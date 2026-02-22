"use client"

import { useState } from "react"
import { SummaryCard } from "@/components/cards/SummaryCard"
import { BarChartComponent } from "@/components/charts/BarChartComponent"
import { PieChartComponent } from "@/components/charts/PieChartComponent"
import { TransactionCard } from "@/components/cards/TransactionCard"
import { CategoryModal } from "@/components/modals/CategoryModal"
import { TransactionModal } from "@/components/modals/TransactionModal"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, FolderOpen, Plus, ChevronLeft, ChevronRight, CheckSquare, X, Copy, PiggyBank } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteTransaction, copyTransactions } from "@/actions/transactions"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface DashboardClientProps {
    stats: {
        ingresos: number
        gastos: number
        ahorros: number
        balance: number
        chartData: any[]
        categoryData: { nombre: string; emoji: string; total: number; tipo: "ingreso" | "gasto" | "ahorro" }[]
        totalTransactions: number
    }
    initialTransactions: {
        data: any[]
        count: number
    }
    page: number
    currentMonth: number
    currentYear: number
    search: string
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function DashboardClient({ stats, initialTransactions, page, currentMonth, currentYear, search }: DashboardClientProps) {
    const router = useRouter()
    const [catModalOpen, setCatModalOpen] = useState(false)
    const [txModalOpen, setTxModalOpen] = useState(false)
    const [editingTxId, setEditingTxId] = useState<string | null>(null)
    const [editingTxData, setEditingTxData] = useState<any>(null)

    // Selección de transacciones
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Modal de copia
    const [copyModalOpen, setCopyModalOpen] = useState(false)
    const [copyMonth, setCopyMonth] = useState(currentMonth.toString())
    const [copyYear, setCopyYear] = useState(currentYear.toString())
    const [copying, setCopying] = useState(false)

    const [searchTerm, setSearchTerm] = useState(search || "")

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== search) {
                router.push(`/dashboard?page=1&month=${currentMonth}&year=${currentYear}&search=${encodeURIComponent(searchTerm)}`)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm, currentMonth, currentYear, search, router])

    const handleFilterChange = (month?: number, year?: number) => {
        const m = month !== undefined ? month : currentMonth
        const y = year !== undefined ? year : currentYear
        router.push(`/dashboard?page=1&month=${m}&year=${y}&search=${encodeURIComponent(searchTerm)}`)
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

    const handleCheck = (id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (checked) next.add(id)
            else next.delete(id)
            return next
        })
    }

    const handleSelectAll = () => {
        if (selectedIds.size === initialTransactions.data.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(initialTransactions.data.map((tx: any) => tx.id)))
        }
    }

    const handleExitSelectMode = () => {
        setSelectMode(false)
        setSelectedIds(new Set())
    }

    const handleCopyConfirm = async () => {
        if (selectedIds.size === 0) return
        setCopying(true)
        const res = await copyTransactions(Array.from(selectedIds), parseInt(copyYear), parseInt(copyMonth))
        setCopying(false)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(`${(res as any).count} transacción(es) copiada(s) a ${MONTHS[parseInt(copyMonth)]} ${copyYear}`)
            setCopyModalOpen(false)
            handleExitSelectMode()
            router.refresh()
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Filtros de Mes y Año - Ocultar si es usuario nuevo */}
            {stats.totalTransactions > 0 && (
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
            )}

            {/* Botones de acción */}
            <div className={cn(
                "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full transition-all duration-300",
                stats.totalTransactions === 0 ? "justify-center py-10" : "justify-end sm:w-auto ml-auto"
            )}>
                <Button
                    size={stats.totalTransactions === 0 ? "lg" : "sm"}
                    className={cn(
                        "bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md hover:shadow-lg transition-all w-full sm:w-auto",
                        stats.totalTransactions === 0 ? "h-14 px-8 text-lg" : "py-2 px-4 text-sm"
                    )}
                    onClick={() => { setEditingTxId(null); setEditingTxData(null); setTxModalOpen(true); }}
                >
                    <Plus className={cn(stats.totalTransactions === 0 ? "mr-3 h-5 w-5" : "mr-1.5 h-4 w-4")} />
                    Agregar Transacción
                </Button>
                <Button
                    size={stats.totalTransactions === 0 ? "lg" : "sm"}
                    className={cn(
                        "bg-slate-800 hover:bg-slate-900 text-white border-0 rounded-full shadow-md hover:shadow-lg transition-all w-full sm:w-auto",
                        stats.totalTransactions === 0 ? "h-14 px-8 text-lg" : "py-2 px-4 text-sm"
                    )}
                    onClick={() => setCatModalOpen(true)}
                >
                    <FolderOpen className={cn("text-blue-400", stats.totalTransactions === 0 ? "mr-3 h-5 w-5" : "mr-1.5 h-4 w-4")} />
                    Categorías
                </Button>
            </div>


            {stats.totalTransactions > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="Ingresos (Mes)" amount={stats.ingresos} icon={TrendingUp} type="income" />
                        <SummaryCard title="Gastos (Mes)" amount={stats.gastos} icon={TrendingDown} type="expense" />
                        <SummaryCard title="Ahorros (Mes)" amount={stats.ahorros} icon={PiggyBank} type="saving" />
                        <SummaryCard title="Balance Total" amount={stats.balance} icon={Wallet} type="balance" />
                    </div>

                    {/* ── Fila de Gráficos ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BarChartComponent data={stats.chartData} />
                        <PieChartComponent data={(stats.categoryData || []).filter(c => c.tipo === "gasto")} />
                    </div>

                    {/* ── Fila de Listas por Categoría (Dinámica) ── */}
                    {(() => {
                        const hasIngresos = (stats.categoryData || []).filter(c => c.tipo === "ingreso").length > 0;
                        const hasGastos = (stats.categoryData || []).filter(c => c.tipo === "gasto").length > 0;
                        const hasAhorros = (stats.categoryData || []).filter(c => c.tipo === "ahorro").length > 0;
                        const totalVisible = [hasIngresos, hasGastos, hasAhorros].filter(Boolean).length;

                        if (totalVisible === 0) return null;

                        return (
                            <div className={`grid gap-6 grid-cols-1 ${totalVisible === 2 ? 'lg:grid-cols-2' :
                                totalVisible === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : ''
                                }`}>
                                {/* Ingresos por Categoría */}
                                {hasIngresos && (
                                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-full min-h-[200px]">
                                        <div className="px-6 pt-5 pb-3 border-b border-slate-50 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <h3 className="text-slate-800 font-semibold tracking-tight text-base">Ingresos por Categoría</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-[300px]">
                                            {(stats.categoryData || []).filter(c => c.tipo === "ingreso").map((cat, i) => (
                                                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-green-50/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl leading-none">{cat.emoji}</span>
                                                        <span className="text-sm font-medium text-slate-700">{cat.nombre}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-green-600">
                                                        + $ {cat.total.toLocaleString('es-CO')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Gastos por Categoría */}
                                {hasGastos && (
                                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-full min-h-[200px]">
                                        <div className="px-6 pt-5 pb-3 border-b border-slate-50 flex items-center gap-2">
                                            <TrendingDown className="h-4 w-4 text-rose-500" />
                                            <h3 className="text-slate-800 font-semibold tracking-tight text-base">Gastos por Categoría</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-[300px]">
                                            {(stats.categoryData || []).filter(c => c.tipo === "gasto").map((cat, i) => (
                                                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-rose-50/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl leading-none">{cat.emoji}</span>
                                                        <span className="text-sm font-medium text-slate-700">{cat.nombre}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-rose-600">
                                                        - $ {cat.total.toLocaleString('es-CO')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Ahorros por Categoría */}
                                {hasAhorros && (
                                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-full min-h-[200px]">
                                        <div className="px-6 pt-5 pb-3 border-b border-slate-50 flex items-center gap-2">
                                            <PiggyBank className="h-4 w-4 text-indigo-500" />
                                            <h3 className="text-slate-800 font-semibold tracking-tight text-base">Ahorros por Categoría</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-[300px]">
                                            {(stats.categoryData || []).filter(c => c.tipo === "ahorro").map((cat, i) => (
                                                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-indigo-50/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl leading-none">{cat.emoji}</span>
                                                        <span className="text-sm font-medium text-slate-700">{cat.nombre}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-indigo-600">
                                                        + $ {cat.total.toLocaleString('es-CO')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()}

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Transacciones Recientes</h2>
                            {!selectMode && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors sm:flex hidden"
                                    onClick={() => setSelectMode(true)}
                                >
                                    <CheckSquare className="mr-1.5 h-4 w-4" />
                                    Seleccionar
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    className="pl-10 bg-white border-slate-200 h-10 shadow-sm focus:ring-indigo-500 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                                {!selectMode ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors sm:hidden w-full flex rounded-lg"
                                        onClick={() => setSelectMode(true)}
                                    >
                                        <CheckSquare className="mr-1.5 h-4 w-4" />
                                        Seleccionar
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1.5 rounded-md">
                                            {selectedIds.size}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9 rounded-lg px-3"
                                            onClick={handleSelectAll}
                                        >
                                            <span className="hidden sm:inline">
                                                {selectedIds.size === initialTransactions.data.length ? "Deseleccionar todo" : "Seleccionar todo"}
                                            </span>
                                            <span className="sm:hidden">Todo</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={selectedIds.size === 0}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 h-9 rounded-lg px-3 shadow-sm"
                                            onClick={() => setCopyModalOpen(true)}
                                        >
                                            <Copy className="h-4 w-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Copiar al mes...</span>
                                            <span className="sm:hidden">Copiar</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 p-0 rounded-lg transition-colors"
                                            onClick={handleExitSelectMode}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
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
                                    selectable={selectMode}
                                    checked={selectedIds.has(tx.id)}
                                    onCheck={handleCheck}
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
                                    onClick={() => router.push(`/dashboard?page=${page - 1}&month=${currentMonth}&year=${currentYear}&search=${encodeURIComponent(searchTerm)}`)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page * 10 >= initialTransactions.count}
                                    onClick={() => router.push(`/dashboard?page=${page + 1}&month=${currentMonth}&year=${currentYear}&search=${encodeURIComponent(searchTerm)}`)}
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="mt-12 bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 max-w-4xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Wallet className="h-10 w-10 text-green-600" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            ¡Bienvenido a tu nueva libertad financiera! 🚀
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Estamos muy emocionados de ayudarte a tomar el control total de tus gastos e ingresos. Para comenzar tu viaje, sigue estos dos sencillos pasos:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">1</div>
                            <h3 className="font-bold text-slate-800 text-xl">Configura tus Categorías</h3>
                            <p className="text-slate-500 text-sm">
                                Crea categorías personalizadas como "Alimentación", "Transporte" o "Salario" con emojis divertidos para organizar mejor tu dinero.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold text-lg">2</div>
                            <h3 className="font-bold text-slate-800 text-xl">Registra tu primer movimiento</h3>
                            <p className="text-slate-500 text-sm">
                                Agrega tu primer ingreso o gasto. ¡Verás cómo tus gráficos cobra vida instantáneamente y empiezas a entender tus finanzas!
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <p className="text-sm font-medium text-slate-400">
                            Haz clic en los botones de arriba para empezar ahora mismo.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Modal Copiar al Mes ── */}
            {copyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !copying && setCopyModalOpen(false)}
                    />
                    {/* Panel */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Copiar transacciones</h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {selectedIds.size} transacción(es) seleccionada(s)
                                </p>
                            </div>
                            <button
                                onClick={() => !copying && setCopyModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600">
                            Elige el mes y año de destino. Se crearán copias de las transacciones seleccionadas en ese período.
                        </p>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Mes destino</label>
                                <Select value={copyMonth} onValueChange={setCopyMonth}>
                                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Mes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((m, idx) => (
                                            <SelectItem key={idx} value={idx.toString()}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-28">
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Año</label>
                                <Select value={copyYear} onValueChange={setCopyYear}>
                                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Año" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <Button
                                variant="outline"
                                className="flex-1 border-slate-200"
                                onClick={() => setCopyModalOpen(false)}
                                disabled={copying}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={handleCopyConfirm}
                                disabled={copying}
                            >
                                {copying ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Copiando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Copy className="h-4 w-4" />
                                        Copiar
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {catModalOpen && (
                <CategoryModal defaultOpen={catModalOpen} onOpenChange={setCatModalOpen} />
            )}

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
