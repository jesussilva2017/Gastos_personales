import { getDashboardStats, getTransactions } from "@/actions/transactions"
import { DashboardClient } from "./DashboardClient"
import { ShieldAlert } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { page?: string }
}) {
    const page = searchParams.page ? parseInt(searchParams.page) : 1
    const stats = await getDashboardStats()
    const transactionsData = await getTransactions(page, 10)

    return <DashboardClient stats={stats} initialTransactions={transactionsData} page={page} />
}
