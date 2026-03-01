"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SummaryCard } from "@/components/cards/SummaryCard"
import { UserModal } from "@/components/modals/UserModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserX, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Shield, User, AlertTriangle, X } from "lucide-react"
import { deleteUser, editUser } from "@/actions/users"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface AdminClientProps {
    stats: { total: number; inactivos: number }
    initialUsers: { data: any[]; count: number }
    page: number
    search: string
}

export function AdminClient({ stats, initialUsers, page, search }: AdminClientProps) {
    const router = useRouter()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingData, setEditingData] = useState<any>(null)
    const [searchValue, setSearchValue] = useState(search)
    const [deletingUser, setDeletingUser] = useState<any>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/admin?page=1&search=${encodeURIComponent(searchValue)}`)
    }

    const handleEdit = (user: any) => {
        setEditingId(user.id)
        setEditingData(user)
        setModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingUser) return
        setIsDeleting(true)
        const res = await deleteUser(deletingUser.id)
        setIsDeleting(false)
        setDeletingUser(null)
        if (res?.error) toast.error(res.error)
        else {
            toast.success("Usuario eliminado")
            router.refresh()
        }
    }

    const toggleActive = async (user: any) => {
        const res = await editUser(user.id, {
            nombre: user.nombre,
            apellido: user.apellido,
            celular: user.celular,
            rol: user.rol,
            activo: !user.activo,
        })
        if (res?.error) toast.error(res.error)
        else {
            toast.success(user.activo ? "Usuario deshabilitado" : "Usuario habilitado")
            router.refresh()
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SummaryCard title="Total Usuarios Registrados" amount={stats.total} icon={Users} type="income" />
                <SummaryCard title="Usuarios Inactivos" amount={stats.inactivos} icon={UserX} type="expense" />
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex max-w-sm w-full gap-2">
                        <Input
                            placeholder="Buscar por nombre o correo..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="bg-slate-50 border-slate-200"
                        />
                        <Button type="submit" variant="secondary" className="px-3">
                            <Search className="h-4 w-4 text-slate-600" />
                        </Button>
                    </form>
                    <Button onClick={() => { setEditingId(null); setEditingData(null); setModalOpen(true) }} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Usuario
                    </Button>
                </div>

                <div className="rounded-md border border-slate-200 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Correo / Celular</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Registro</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialUsers.data.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-800">
                                        {user.nombre} {user.apellido}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-600">{user.email || "No disponible"}</div>
                                        <div className="text-xs text-slate-400">{user.celular}</div>
                                    </TableCell>
                                    <TableCell>
                                        {user.rol === "admin" ? (
                                            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                <Shield className="h-3 w-3" />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                <User className="h-3 w-3" />
                                                User
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => toggleActive(user)}
                                            className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium border transition-colors ${user.activo
                                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                                : "bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                                }`}
                                            title={user.activo ? "Click para deshabilitar" : "Click para habilitar"}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${user.activo ? "bg-green-600" : "bg-red-600"}`}></span>
                                            {user.activo ? "Activo" : "Inactivo"}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {formatDate(user.created_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeletingUser(user)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {initialUsers.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                        No se encontraron usuarios
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {initialUsers.count > 10 && (
                    <div className="flex justify-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => router.push(`/admin?page=${page - 1}&search=${encodeURIComponent(searchValue)}`)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page * 10 >= initialUsers.count}
                            onClick={() => router.push(`/admin?page=${page + 1}&search=${encodeURIComponent(searchValue)}`)}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {modalOpen && (
                <UserModal
                    defaultOpen={modalOpen}
                    onOpenChange={setModalOpen}
                    editingId={editingId}
                    initialData={editingData}
                />
            )}

            {/* Modal de confirmación para eliminar usuario */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !isDeleting && setDeletingUser(null)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Eliminar usuario</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">{deletingUser.nombre} {deletingUser.apellido}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => !isDeleting && setDeletingUser(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-sm text-red-700 font-medium">
                                ⚠️ Esta acción es irreversible
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                                Se eliminará permanentemente al usuario y todos sus datos: transacciones, categorías y configuraciones.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-slate-200 text-slate-700"
                                onClick={() => setDeletingUser(null)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Eliminando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Eliminar usuario
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
