import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface SummaryCardProps {
    title: string
    amount: number
    icon: LucideIcon
    type: "income" | "expense" | "balance" | "saving"
}

export function SummaryCard({ title, amount, icon: Icon, type }: SummaryCardProps) {
    let colorClass = "text-slate-900"
    let iconColor = "text-slate-500"

    if (type === "income") {
        colorClass = "text-green-600"
        iconColor = "text-green-500"
    } else if (type === "expense") {
        colorClass = "text-rose-500"
        iconColor = "text-rose-400"
    } else if (type === "saving") {
        colorClass = "text-indigo-600"
        iconColor = "text-indigo-500"
    } else {
        colorClass = amount >= 0 ? "text-slate-900" : "text-rose-500"
        iconColor = "text-slate-400"
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${colorClass}`}>
                    {formatCurrency(amount)}
                </div>
            </CardContent>
        </Card>
    )
}
