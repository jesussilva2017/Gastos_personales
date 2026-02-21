import { getDashboardStats, getTransactions } from "@/actions/transactions"
import { DashboardClient } from "./DashboardClient"
import { ShieldAlert } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { page?: string, month?: string, year?: string, search?: string }
}) {
    const page = searchParams.page ? parseInt(searchParams.page) : 1
    const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear()
    const month = searchParams.month ? parseInt(searchParams.month) : new Date().getMonth()
    const search = searchParams.search || ""

    const stats = await getDashboardStats(year, month)
    const transactionsData = await getTransactions(page, 10, year, month, search)

    return (
        <DashboardClient
            stats={stats}
            initialTransactions={transactionsData}
            page={page}
            currentMonth={month}
            currentYear={year}
            search={search}
        />
    )
}
