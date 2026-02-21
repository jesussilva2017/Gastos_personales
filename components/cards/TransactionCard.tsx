import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Edit2, Trash2 } from "lucide-react"

interface TransactionCardProps {
    id: string
    nombre: string
    valor: number
    tipo: "ingreso" | "gasto"
    categoria: {
        nombre: string
        emoji: string
    }
    fecha: string
    onEdit: (id: string) => void
    onDelete: (id: string) => void
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
}: TransactionCardProps) {
    const isIngreso = tipo === "ingreso"

    return (
        <Card className="hover:shadow-md transition-all duration-200 border border-slate-100 bg-white">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl shrink-0">
                        {categoria?.emoji || "💸"}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 tracking-tight">{nombre}</h3>
                        <div className="flex items-center text-sm text-slate-500 space-x-2 mt-0.5">
                            <span>{categoria?.nombre || "Sin Categoría"}</span>
                            <span>•</span>
                            <span>{formatDate(fecha)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-center space-y-1">
                    <span className={`font-bold tabular-nums ${isIngreso ? "text-green-600" : "text-red-500"}`}>
                        {isIngreso ? "+" : "-"}{formatCurrency(valor)}
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
