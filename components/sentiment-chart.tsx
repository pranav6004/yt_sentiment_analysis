"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList
} from "recharts"

interface SentimentData {
  positive: number
  negative: number
  neutral: number
}

interface SentimentChartProps {
  data: SentimentData
}

export function SentimentChart({ data }: SentimentChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Ensure data is valid
  const validData = {
    positive: Number.isFinite(data?.positive) ? data.positive : 0,
    negative: Number.isFinite(data?.negative) ? data.negative : 0,
    neutral: Number.isFinite(data?.neutral) ? data.neutral : 0,
  }

  const chartData = [
    { name: "Positive", value: validData.positive, color: "#FDCA40" },  // Brighter yellow
    { name: "Negative", value: validData.negative, color: "#F94144" },  // Brighter red
    { name: "Neutral", value: validData.neutral, color: "#4EA8DE" },    // Brighter blue
  ]

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0)

  // Don't render the chart if there's no data
  if (total === 0) {
    return (
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 h-[300px] w-full flex items-center justify-center">
        <p className="text-center text-gray-500 dark:text-gray-400">No sentiment data available</p>
      </div>
    )
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small segments
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium" style={{ color: data.color }}>{data.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">{`${((data.value / total) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800/50 p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-[350px]">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              paddingAngle={2}
              animationBegin={200}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="white"
                  strokeWidth={2} 
                  style={{ filter: activeIndex === index ? 'drop-shadow(0px 0px 8px rgba(0,0,0,0.2))' : 'none' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-4 mt-2">
        {chartData.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium dark:text-gray-300">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
