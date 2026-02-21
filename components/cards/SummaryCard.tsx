import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface SummaryCardProps {
    title: string
    amount: number
    icon: LucideIcon
    type: "income" | "expense" | "balance"
}

export function SummaryCard({ title, amount, icon: Icon, type }: SummaryCardProps) {
    let colorClass = "text-slate-900"
    let iconColor = "text-slate-500"

    if (type === "income") {
        colorClass = "text-green-600"
        iconColor = "text-green-500"
    } else if (type === "expense") {
        colorClass = "text-red-500"
        iconColor = "text-red-400"
    } else {
        colorClass = amount >= 0 ? "text-green-600" : "text-red-500"
        iconColor = "text-blue-500"
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
