# YouTube Comment Sentiment Analyzer

A full-stack application that analyzes the sentiment of YouTube video comments using machine learning and natural language processing. The application provides detailed sentiment analysis, including sentiment distribution, comment analysis, and transcript summaries.

## Features

- Analyze sentiment of YouTube video comments (positive, negative, neutral)
- Visualize sentiment distribution with interactive charts
- Summarize video comments and transcripts
- Clean, modern UI with responsive design
- Light theme for better readability

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **UI Components**: Shadcn UI with Radix UI primitives
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **Theme Management**: next-themes

### Backend
- **Server**: Flask with Flask-CORS
- **Machine Learning**: 
  - Hugging Face Transformers
  - PyTorch
  - scikit-learn
  - NLTK
- **API Integration**:
  - YouTube Data API
  - OpenAI API
- **Data Processing**: Pandas, NumPy

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.10+
- YouTube Data API key (for fetching comments)
- OpenAI API key (for generating summaries)
- Hugging Face token (for accessing transformer models)

## Setup Instructions

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
YOUTUBE_API_KEY="your_youtube_api_key"
OPENAI_API_KEY="your_openai_api_key"
NEXT_PUBLIC_API_URL="http://localhost:5000"
HUGGINGFACE_TOKEN="your_huggingface_token"
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```bash
   flask run
   ```
   The backend will be available at http://localhost:5000

### Frontend Setup

1. From the root directory, install the required npm packages:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
   The frontend will be available at http://localhost:3000

## Docker Setup (Optional)

### Backend Docker

```bash
cd backend
docker build -t youtube-sentiment-backend .
docker run -p 5000:5000 --env-file ../.env youtube-sentiment-backend
```

### Frontend Docker

```bash
# From root directory
docker build -t youtube-sentiment-frontend .
docker run -p 3000:3000 youtube-sentiment-frontend
```

## Project Structure

```
youtube-sentiment-analyzer/
├── app/                   # Next.js app directory
├── backend/               # Flask backend
│   ├── app.py             # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend Docker config
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static assets
├── styles/                # Global styles
├── .env                   # Environment variables
├── next.config.mjs        # Next.js configuration
├── package.json           # Frontend dependencies
├── README.md              # Project documentation
├── requirements.txt       # Root Python dependencies
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Usage

1. Open http://localhost:3000 in your browser
2. Enter a YouTube video URL in the input field
3. Click "Analyze Comments" to process the video
4. View the sentiment analysis results, including:
   - Sentiment distribution chart
   - Sentiment breakdown percentages
   - Overall sentiment
   - Comment analysis
   - Transcript summary

## API Endpoints

- `POST /api/analyze`: Analyze a YouTube video by URL or ID
- `GET /api/results`: Get analysis results for a specific video ID

## Troubleshooting

- **API Quota Errors**: If you see "API quota exceeded" messages, check your YouTube API and OpenAI API quotas and billing details
- **Missing Comments**: Some videos may have comments disabled or limited
- **Installation Issues**: Make sure you're using compatible versions of Node.js and Python

## License

MIT 