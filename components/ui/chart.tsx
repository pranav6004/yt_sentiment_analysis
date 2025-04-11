"use client"

import type * as React from "react"
import { Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const Chart = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  )
}

const ChartPie = ({ children, ...props }: any) => {
  return (
    <Pie dataKey="value" {...props}>
      {children}
    </Pie>
  )
}

const ChartTooltip = ({ content }: { content: React.ReactNode }) => {
  return <Tooltip content={content} />
}

const ChartTooltipContent = ({
  className,
  formatter,
  payload,
}: {
  className?: string
  formatter?: (value: number) => [string, string]
  payload?: any[]
}) => {
  if (!payload || payload.length === 0) {
    return null
  }

  const [value, name] = formatter ? formatter(payload[0].value) : [payload[0].value, payload[0].name]

  return (
    <div className={className}>
      <p className="font-bold">{name}</p>
      <p>{value}</p>
    </div>
  )
}

const ChartLegend = ({ content }: { content: React.ReactNode }) => {
  return <Legend content={content} />
}

const ChartLegendContent = ({
  className,
  formatter,
}: {
  className?: string
  formatter?: (value: string) => string
}) => {
  return <div className={className}>{/* Implement your legend content here */}</div>
}

const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export { Chart, ChartPie, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartContainer, Cell }
