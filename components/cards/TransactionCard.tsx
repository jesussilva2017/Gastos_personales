"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Edit2, Trash2 } from "lucide-react"

interface TransactionCardProps {
    id: string
    nombre: string
    valor: number
    tipo: "ingreso" | "gasto" | "ahorro"
    categoria: {
        nombre: string
        emoji: string
    }
    fecha: string
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    selectable?: boolean
    checked?: boolean
    onCheck?: (id: string, checked: boolean) => void
}

export function TransactionCard({
    id,
    nombre,
    valor,
    tipo,
    categoria,
    fecha,
    onEdit,
    onDelete,
    selectable = false,
    checked = false,
    onCheck,
}: TransactionCardProps) {
    const isPositive = tipo === "ingreso" || tipo === "ahorro"

    return (
        <Card
            className={`transition-all duration-200 border bg-white ${checked
                ? "border-indigo-400 shadow-md ring-1 ring-indigo-300"
                : "border-slate-100 hover:shadow-md"
                }`}
        >
            <CardContent className="p-4 flex items-center justify-between gap-3">
                {/* Checkbox */}
                {selectable && (
                    <button
                        type="button"
                        onClick={() => onCheck?.(id, !checked)}
                        className="flex-shrink-0 flex items-center justify-center"
                        title={checked ? "Deseleccionar" : "Seleccionar"}
                    >
                        <span
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked
                                ? "bg-indigo-600 border-indigo-600"
                                : "border-slate-300 hover:border-indigo-400 bg-white"
                                }`}
                        >
                            {checked && (
                                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </span>
                    </button>
                )}

                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl shrink-0">
                        {categoria?.emoji || "💸"}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 tracking-tight truncate">{nombre}</h3>
                        <div className="flex items-center text-sm text-slate-500 space-x-2 mt-0.5">
                            <span>{categoria?.nombre || "Sin Categoría"}</span>
                            <span>•</span>
                            <span>{formatDate(fecha)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-center space-y-1 flex-shrink-0">
                    <span className={`font-bold tabular-nums ${tipo === 'ingreso' ? 'text-green-600' : tipo === 'ahorro' ? 'text-indigo-600' : 'text-rose-500'
                        }`}>
                        {isPositive ? "+" : "-"}{formatCurrency(valor)}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onEdit(id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            title="Editar"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
