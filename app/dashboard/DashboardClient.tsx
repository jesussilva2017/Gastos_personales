"use client"

import { useState } from "react"
import { SummaryCard } from "@/components/cards/SummaryCard"
import { BarChartComponent } from "@/components/charts/BarChartComponent"
import { TransactionCard } from "@/components/cards/TransactionCard"
import { CategoryModal } from "@/components/modals/CategoryModal"
import { TransactionModal } from "@/components/modals/TransactionModal"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, FolderOpen, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteTransaction } from "@/actions/transactions"
import { toast } from "sonner"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardClientProps {
    stats: {
        ingresos: number
        gastos: number
        balance: number
        chartData: any[]
    }
    initialTransactions: {
        data: any[]
        count: number
    }
    page: number
    currentMonth: number
    currentYear: number
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function DashboardClient({ stats, initialTransactions, page, currentMonth, currentYear }: DashboardClientProps) {
    const router = useRouter()
    const [catModalOpen, setCatModalOpen] = useState(false)
    const [txModalOpen, setTxModalOpen] = useState(false)
    const [editingTxId, setEditingTxId] = useState<string | null>(null)
    const [editingTxData, setEditingTxData] = useState<any>(null)

    const handleFilterChange = (month?: number, year?: number) => {
        const m = month !== undefined ? month : currentMonth
        const y = year !== undefined ? year : currentYear
        router.push(`/dashboard?page=1&month=${m}&year=${y}`)
    }

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

    const handleEditTx = (id: string, txData: any) => {
        setEditingTxId(id)
        setEditingTxData(txData)
        setTxModalOpen(true)
    }

    const handleDeleteTx = async (id: string) => {
        if (!confirm("¿Deseas eliminar esta transacción?")) return
        const res = await deleteTransaction(id)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Transacción eliminada")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Filtros de Mes y Año */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Resumen de Periodo</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={currentMonth.toString()} onValueChange={(v) => handleFilterChange(parseInt(v))}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((month, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={currentYear.toString()} onValueChange={(v) => handleFilterChange(undefined, parseInt(v))}>
                        <SelectTrigger className="w-full sm:w-[100px] bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Botones de acción en la parte superior */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 bg-slate-800 hover:bg-slate-900 transition-colors py-6 text-md shadow-sm"
                    onClick={() => setCatModalOpen(true)}
                >
                    <FolderOpen className="mr-2 h-5 w-5 text-blue-400" />
                    Categorías
                </Button>
                <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 transition-colors py-6 text-md shadow-sm text-white"
                    onClick={() => { setEditingTxId(null); setEditingTxData(null); setTxModalOpen(true); }}
                >
                    <Plus className="mr-2 h-5 w-5 text-white" />
                    Agregar Transacción
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="Ingresos (Mes)" amount={stats.ingresos} icon={TrendingUp} type="income" />
                <SummaryCard title="Gastos (Mes)" amount={stats.gastos} icon={TrendingDown} type="expense" />
                <SummaryCard title="Balance Total" amount={stats.balance} icon={Wallet} type="balance" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <BarChartComponent data={stats.chartData} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Transacciones Recientes</h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {initialTransactions.data.map((tx) => (
                        <TransactionCard
                            key={tx.id}
                            id={tx.id}
                            nombre={tx.nombre}
                            valor={tx.valor}
                            tipo={tx.tipo}
                            categoria={tx.categories || { nombre: "Sin categoría", emoji: "🏷️" }}
                            fecha={tx.created_at}
                            onEdit={() => handleEditTx(tx.id, tx)}
                            onDelete={handleDeleteTx}
                        />
                    ))}

                    {initialTransactions.data.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <div className="text-slate-400 mb-2">💸</div>
                            <p className="text-slate-500">No hay transacciones registradas</p>
                        </div>
                    )}
                </div>

                {initialTransactions.count > 10 && (
                    <div className="flex justify-center space-x-2 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => router.push(`/dashboard?page=${page - 1}`)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page * 10 >= initialTransactions.count}
                            onClick={() => router.push(`/dashboard?page=${page + 1}`)}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {catModalOpen && (
                <CategoryModal defaultOpen={catModalOpen} onOpenChange={setCatModalOpen} />
            )}

            {/* Reset the transaction modal form internally by unmounting or passing keys, or just use effect inside it. We use the effect inside. */}
            {txModalOpen && (
                <TransactionModal
                    defaultOpen={txModalOpen}
                    onOpenChange={setTxModalOpen}
                    editingId={editingTxId}
                    initialData={editingTxData}
                />
            )}
        </div>
    )
}
