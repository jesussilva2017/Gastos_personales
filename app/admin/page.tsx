import { getUsersStats, getUsers } from "@/actions/users"
import { AdminClient } from "./AdminClient"
import { Users, UserX } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminPage({
    searchParams,
}: {
    searchParams: { page?: string, search?: string }
}) {
    const page = searchParams.page ? parseInt(searchParams.page) : 1
    const search = searchParams.search || ""

    const stats = await getUsersStats()
    const usersData = await getUsers(page, search)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Panel Administrativo</h1>
                <p className="text-slate-500 text-sm">Gestiona los usuarios de la plataforma</p>
            </div>
            <AdminClient stats={stats} initialUsers={usersData} page={page} search={search} />
        </div>
    )
}
