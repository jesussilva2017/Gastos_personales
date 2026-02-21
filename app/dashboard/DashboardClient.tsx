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
}

export function DashboardClient({ stats, initialTransactions, page }: DashboardClientProps) {
    const router = useRouter()
    const [catModalOpen, setCatModalOpen] = useState(false)
    const [txModalOpen, setTxModalOpen] = useState(false)
    const [editingTxId, setEditingTxId] = useState<string | null>(null)
    const [editingTxData, setEditingTxData] = useState<any>(null)

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="Ingresos (Mes)" amount={stats.ingresos} icon={TrendingUp} type="income" />
                <SummaryCard title="Gastos (Mes)" amount={stats.gastos} icon={TrendingDown} type="expense" />
                <SummaryCard title="Balance Total" amount={stats.balance} icon={Wallet} type="balance" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <BarChartComponent data={stats.chartData} />
                </div>

                <div className="space-y-4 flex flex-col justify-end">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-full flex flex-col justify-center space-y-4">
                        <h3 className="font-semibold text-slate-800 text-center">Gestión Rápida</h3>
                        <Button className="w-full bg-slate-800 hover:bg-slate-900 transition-colors py-6 text-md shadow-sm" onClick={() => setCatModalOpen(true)}>
                            <FolderOpen className="mr-2 h-5 w-5 text-blue-400" />
                            Categorías
                        </Button>
                        <Button className="w-full bg-green-600 hover:bg-green-700 transition-colors py-6 text-md shadow-sm text-white" onClick={() => { setEditingTxId(null); setEditingTxData(null); setTxModalOpen(true); }}>
                            <Plus className="mr-2 h-5 w-5 text-white" />
                            Agregar
                        </Button>
                    </div>
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

            <CategoryModal defaultOpen={catModalOpen} onOpenChange={setCatModalOpen} />

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
