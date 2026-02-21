"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface CategoryData {
    nombre: string
    emoji: string
    total: number
}

interface PieChartProps {
    data: CategoryData[]
}

const COLORS = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
    "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16",
]

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload
        return (
            <div className="bg-white border border-slate-100 shadow-lg rounded-lg px-4 py-3 text-sm">
                <p className="font-semibold text-slate-700 mb-1">
                    {entry.emoji} {entry.nombre}
                </p>
                <p className="text-slate-500">{formatCurrency(entry.total)}</p>
            </div>
        )
    }
    return null
}

const CustomLegend = ({ payload }: any) => (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
        {payload?.map((entry: any, index: number) => (
            <li key={index} className="flex items-center gap-1 text-xs text-slate-600">
                <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                />
                {entry.payload.emoji} {entry.value}
            </li>
        ))}
    </ul>
)

export function PieChartComponent({ data }: PieChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-1 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-800 font-semibold tracking-tight">
                        Gastos por Categoría
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-slate-400 text-sm">Sin datos para el período</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const chartData = data.map((d) => ({
        name: d.nombre,
        nombre: d.nombre,
        emoji: d.emoji,
        total: d.total,
        value: d.total,
    }))

    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle className="text-slate-800 font-semibold tracking-tight">
                    Gastos por Categoría
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                outerRadius={100}
                                innerRadius={50}
                                labelLine={false}
                                label={renderCustomLabel}
                            >
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
