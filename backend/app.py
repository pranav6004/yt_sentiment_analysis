from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import time
from googleapiclient.discovery import build
from transformers import pipeline
from openai import OpenAI
from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize the sentiment analysis pipeline
sentiment_analyzer = pipeline("sentiment-analysis")

# YouTube API key from environment variables
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client with proper error handling
openai_client_initialized = False
client = None

try:
    if not OPENAI_API_KEY:
        print("WARNING: OpenAI API key is not set. Some features will be limited.")
    else:
        client = OpenAI(
            api_key=OPENAI_API_KEY,
            http_client=httpx.Client()
        )
        openai_client_initialized = True
except Exception as e:
    print(f"ERROR initializing OpenAI client: {e}")
    print("OpenAI integration will be disabled.")

def extract_video_id(url):
    """Extract the video ID from a YouTube URL."""
    regex = r"(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})"
    match = re.search(regex, url)
    return match.group(1) if match else None

def get_video_info(video_id):
    """Get basic information about a YouTube video."""
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    response = youtube.videos().list(
        part="snippet",
        id=video_id
    ).execute()
    
    if not response['items']:
        return None
    
    video_info = response['items'][0]['snippet']
    return {
        'title': video_info['title'],
        'channelTitle': video_info['channelTitle'],
        'publishedAt': video_info['publishedAt']
    }

def get_comments(video_id):
    """Get comments for a YouTube video."""
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    comments = []
    
    try:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            textFormat="plainText",
            maxResults=100
        ).execute()
        
        while response and 'items' in response:
            for item in response['items']:
                if 'snippet' in item and 'topLevelComment' in item['snippet'] and 'snippet' in item['snippet']['topLevelComment']:
                    comment = item['snippet']['topLevelComment']['snippet'].get('textDisplay', '')
                    if comment:
                        comments.append(comment)
            
            if 'nextPageToken' in response and len(comments) < 500:
                response = youtube.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    textFormat="plainText",
                    pageToken=response['nextPageToken'],
                    maxResults=100
                ).execute()
            else:
                break
                
    except Exception as e:
        print(f"Error fetching comments: {e}")
        # Provide some sample comments for testing if the API fails
        if not comments:
            comments = [
                "This video was really helpful, thank you!",
                "I didn't like the audio quality but the content was good.",
                "Can you make more videos like this? Very informative.",
                "Not sure I agree with all points but interesting perspective.",
                "The explanation at 2:15 was exactly what I needed to understand."
            ]
    
    # Return at least some comments
    if not comments:
        comments = ["No comments were found for this video."]
        
    return comments

def get_transcript(video_id):
    """Get transcript for a YouTube video."""
    # This is a placeholder. In a real implementation, you would use YouTube's captions API
    # or a third-party library like youtube-transcript-api
    return "This is a placeholder transcript."

def get_transcript_summary(transcript):
    """Get a summary of the video transcript using OpenAI."""
    # Check if OpenAI client is initialized
    if not openai_client_initialized or client is None:
        return "Transcript summary unavailable: OpenAI API is not configured."
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Provide a detailed summary of the given youtube video transcript."},
                {"role": "user", "content": transcript}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in transcript summary: {e}")
        
        # Check if it's a quota exceeded error
        error_str = str(e)
        if "insufficient_quota" in error_str or "exceeded your current quota" in error_str:
            return "Unable to generate transcript summary: OpenAI API quota exceeded. Please check your API key and billing details."
        
        # For other errors, retry once after delay
        time.sleep(60)  # Wait for 60 seconds before retrying
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Provide a detailed summary of the given youtube video transcript."},
                    {"role": "user", "content": transcript}
                ]
            )
            return response.choices[0].message.content
        except Exception as retry_error:
            print(f"Retry failed: {retry_error}")
            return "Unable to generate transcript summary due to API errors. Please try again later."

def batch_comments(comments, max_tokens=2048):
    """Split comments into manageable batches."""
    batches = []
    current_batch = []
    current_length = 0

    for comment in comments:
        comment_length = len(comment.split())
        if current_length + comment_length > max_tokens:
            batches.append(current_batch)
            current_batch = [comment]
            current_length = comment_length
        else:
            current_batch.append(comment)
            current_length += comment_length

    if current_batch:
        batches.append(current_batch)

    return batches

def get_comments_summaries(batches):
    """Get summaries of comment batches using OpenAI."""
    summaries = []
    quota_exceeded = False
    
    # Check if OpenAI client is initialized
    if not openai_client_initialized or client is None:
        return ["Comments summary unavailable: OpenAI API is not configured."]

    for batch in batches:
        # Skip processing if quota already exceeded
        if quota_exceeded:
            summaries.append("OpenAI API quota exceeded. Unable to process comments.")
            continue
            
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Summarize the following comments while keeping the detailed context."},
                    {"role": "user", "content": " ".join(batch)}
                ]
            )
            summaries.append(response.choices[0].message.content)
        except Exception as e:
            print(f"Error in comment summary: {e}")
            error_str = str(e)
            
            # Check if it's a quota exceeded error
            if "insufficient_quota" in error_str or "exceeded your current quota" in error_str:
                quota_exceeded = True
                summaries.append("OpenAI API quota exceeded. Unable to process comments.")
                continue
                
            # For other errors, retry once after delay
            time.sleep(60)  # Wait for 60 seconds
            try:
                # Retry the current batch
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Summarize the following comments while keeping the detailed context."},
                        {"role": "user", "content": " ".join(batch)}
                    ]
                )
                summaries.append(response.choices[0].message.content)
            except Exception as retry_error:
                print(f"Retry failed: {retry_error}")
                summaries.append("Failed to summarize comments due to API errors.")

    return summaries

def create_final_summary(summaries, transcript_summary):
    """Create a final summary from comment summaries and transcript summary."""
    # Check if OpenAI client is initialized
    if not openai_client_initialized or client is None:
        return "Analysis unavailable: OpenAI API is not configured."
    
    # Check if we already have fallback messages in the summaries
    for summary in summaries:
        if "OpenAI API quota exceeded" in summary or "API errors" in summary or "unavailable" in summary:
            return "Unable to provide a complete analysis: Some parts of the analysis failed due to API limitations."
            
    # Check if transcript summary contains an error message
    if "OpenAI API quota exceeded" in transcript_summary or "API errors" in transcript_summary or "unavailable" in transcript_summary:
        return "Unable to provide a complete analysis: Failed to process video transcript due to API limitations."
        
    summary_text = " ".join(summaries)
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"This is the summary of a YouTube video's transcript: {transcript_summary}. A user has commented on the video. Your task is to analyze this comment in the context of the video transcript. Based on the comment content and its relation to the transcript, please provide detailed insights, addressing these key points:\n1. Identify positive aspects of the video that the comment highlights and link these to specific parts of the transcript where possible.\n2. Identify any criticisms or areas for improvement mentioned in the comment, and relate these to relevant sections of the transcript.\n3. Based on the feedback or suggestions in the comment, recommend new content ideas or topics for future videos that align with the viewer's interests and the overall content strategy but don't make up things from your side unnecessarily. Ensure your analysis is clear and includes specific examples from both the comment and the transcript to support your insights."},
                {"role": "user", "content": summary_text}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in final summary: {e}")
        error_str = str(e)
        
        # Check if it's a quota exceeded error
        if "insufficient_quota" in error_str or "exceeded your current quota" in error_str:
            return "Unable to generate analysis: OpenAI API quota exceeded. Please check your API key and billing details."
            
        # For other errors, retry once after delay
        time.sleep(60)  # Wait for 60 seconds before retrying
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"This is the summary of a YouTube video's transcript: {transcript_summary}. A user has commented on the video. Your task is to analyze this comment in the context of the video transcript. Based on the comment content and its relation to the transcript, please provide detailed insights, addressing these key points:\n1. Identify positive aspects of the video that the comment highlights and link these to specific parts of the transcript where possible.\n2. Identify any criticisms or areas for improvement mentioned in the comment, and relate these to relevant sections of the transcript.\n3. Based on the feedback or suggestions in the comment, recommend new content ideas or topics for future videos that align with the viewer's interests and the overall content strategy but don't make up things from your side unnecessarily. Ensure your analysis is clear and includes specific examples from both the comment and the transcript to support your insights."},
                    {"role": "user", "content": summary_text}
                ]
            )
            return response.choices[0].message.content
        except Exception as retry_error:
            print(f"Retry failed: {retry_error}")
            return "Unable to generate final analysis due to API errors. Please try again later."

def analyze_sentiment(comments):
    """Analyze the sentiment of comments."""
    if not comments:
        return {
            'positive': 0,
            'negative': 0,
            'neutral': 0
        }
    
    sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
    
    for comment in comments:
        try:
            # Process comments in batches to avoid rate limits
            result = sentiment_analyzer(comment)
            sentiment = result[0]
            
            # Using the same threshold as in the original code (0.9)
            if sentiment['label'] == 'POSITIVE' and sentiment['score'] > 0.9:
                sentiment_counts['positive'] += 1
            elif sentiment['label'] == 'NEGATIVE' and sentiment['score'] > 0.9:
                sentiment_counts['negative'] += 1
            else:
                sentiment_counts['neutral'] += 1
                
        except Exception as e:
            print(f"Error in sentiment analysis: {e}")
            sentiment_counts['neutral'] += 1
    
    # Calculate percentages instead of raw counts
    total = sum(sentiment_counts.values())
    if total > 0:
        sentiment_percentages = {
            'positive': (sentiment_counts['positive'] / total) * 100,
            'negative': (sentiment_counts['negative'] / total) * 100,
            'neutral': (sentiment_counts['neutral'] / total) * 100
        }
        return sentiment_percentages
    else:
        return {
            'positive': 0,
            'negative': 0,
            'neutral': 0
        }

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    
    # Check if URL or video ID is provided
    if 'url' in data:
        video_id = extract_video_id(data['url'])
    elif 'videoId' in data:
        video_id = data['videoId']
    else:
        return jsonify({'error': 'No URL or video ID provided'}), 400
    
    if not video_id:
        return jsonify({'error': 'Invalid YouTube URL or video ID'}), 400
    
    try:
        # Get video information
        video_info = get_video_info(video_id)
        if not video_info:
            return jsonify({'error': 'Video not found'}), 404
        
        # Get comments
        comments = get_comments(video_id)
        
        # Get transcript and summary
        transcript = get_transcript(video_id)
        transcript_summary = get_transcript_summary(transcript)
        
        # Check if there was an API quota error with transcript summary
        quota_error = False
        if "OpenAI API quota exceeded" in transcript_summary:
            quota_error = True
        
        # Batch comments and get summaries
        comment_batches = batch_comments(comments)
        comment_summaries = get_comments_summaries(comment_batches)
        
        # Check if there was an API quota error with comment summaries
        for summary in comment_summaries:
            if "OpenAI API quota exceeded" in summary:
                quota_error = True
                break
        
        # Create final summary
        final_summary = create_final_summary(comment_summaries, transcript_summary)
        
        # Analyze sentiment
        sentiment_counts = analyze_sentiment(comments)
        
        # Prepare results
        results = {
            'videoId': video_id,
            'videoTitle': video_info['title'],
            'channelTitle': video_info['channelTitle'],
            'commentCount': len(comments),
            'sentiment': sentiment_counts,
            'summary': final_summary,
            'transcriptSummary': transcript_summary,
            'apiQuotaExceeded': quota_error
        }
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error processing request: {e}")
        error_msg = str(e)
        
        if "insufficient_quota" in error_msg or "exceeded your current quota" in error_msg:
            return jsonify({
                'error': 'OpenAI API quota exceeded. Please check your API key and billing details.',
                'apiQuotaExceeded': True
            }), 429
        
        return jsonify({'error': 'Failed to process video'}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    video_id = request.args.get('videoId')
    
    if not video_id:
        return jsonify({'error': 'No video ID provided'}), 400
    
    try:
        # Get video information
        video_info = get_video_info(video_id)
        if not video_info:
            return jsonify({'error': 'Video not found'}), 404
        
        # Get comments
        comments = get_comments(video_id)
        
        # Get transcript and summary
        transcript = get_transcript(video_id)
        transcript_summary = get_transcript_summary(transcript)
        
        # Check if there was an API quota error with transcript summary
        quota_error = False
        if "OpenAI API quota exceeded" in transcript_summary:
            quota_error = True
        
        # Batch comments and get summaries
        comment_batches = batch_comments(comments)
        comment_summaries = get_comments_summaries(comment_batches)
        
        # Check if there was an API quota error with comment summaries
        for summary in comment_summaries:
            if "OpenAI API quota exceeded" in summary:
                quota_error = True
                break
        
        # Create final summary
        final_summary = create_final_summary(comment_summaries, transcript_summary)
        
        # Analyze sentiment
        sentiment_counts = analyze_sentiment(comments)
        
        # Prepare results
        results = {
            'videoId': video_id,
            'videoTitle': video_info['title'],
            'channelTitle': video_info['channelTitle'],
            'commentCount': len(comments),
            'sentiment': sentiment_counts,
            'summary': final_summary,
            'transcriptSummary': transcript_summary,
            'apiQuotaExceeded': quota_error
        }
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error processing request: {e}")
        error_msg = str(e)
        
        if "insufficient_quota" in error_msg or "exceeded your current quota" in error_msg:
            return jsonify({
                'error': 'OpenAI API quota exceeded. Please check your API key and billing details.',
                'apiQuotaExceeded': True
            }), 429
        
        return jsonify({'error': 'Failed to process video'}), 500

if __name__ == '__main__':
    app.run(debug=True)
