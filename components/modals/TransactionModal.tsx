"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionSchema, type TransactionInput } from "@/lib/validations"
import { addTransaction, editTransaction } from "@/actions/transactions"
import { getCategories } from "@/actions/categories"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionModalProps {
    defaultOpen?: boolean
    onOpenChange: (open: boolean) => void
    editingId?: string | null
    initialData?: any
}

export function TransactionModal({ defaultOpen = false, onOpenChange, editingId, initialData }: TransactionModalProps) {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [categoriesLoading, setCategoriesLoading] = useState(true)

    const form = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: { nombre: "", valor: "" as any, tipo: "gasto", categoria_id: "" },
    })

    useEffect(() => {
        loadCategories()
        if (editingId && initialData) {
            form.reset({
                nombre: initialData.nombre,
                valor: initialData.valor,
                tipo: initialData.tipo,
                categoria_id: initialData.categoria_id,
            })
        } else {
            form.reset({ nombre: "", valor: "" as any, tipo: "gasto", categoria_id: "" })
        }
    }, [editingId, initialData])

    const loadCategories = async () => {
        setCategoriesLoading(true)
        try {
            const data = await getCategories()
            setCategories(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setCategoriesLoading(false)
        }
    }

    const onSubmit = async (data: TransactionInput) => {
        setLoading(true)
        let result
        if (editingId) {
            result = await editTransaction(editingId, data)
        } else {
            result = await addTransaction(data)
        }

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(editingId ? "Transacción actualizada" : "Transacción creada")
            onOpenChange(false)
        }
        setLoading(false)
    }

    return (
        <Dialog open={defaultOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Transacción" : "Agregar Transacción"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant={form.watch("tipo") === "ingreso" ? "default" : "outline"}
                            className={form.watch("tipo") === "ingreso" ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => form.setValue("tipo", "ingreso")}
                        >
                            Ingreso
                        </Button>
                        <Button
                            type="button"
                            variant={form.watch("tipo") === "gasto" ? "default" : "outline"}
                            className={form.watch("tipo") === "gasto" ? "bg-red-500 hover:bg-red-600" : ""}
                            onClick={() => form.setValue("tipo", "gasto")}
                        >
                            Gasto
                        </Button>
                    </div>
                    {form.formState.errors.tipo && <p className="text-red-500 text-sm">{form.formState.errors.tipo.message}</p>}

                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre o Descripción</Label>
                        <Input id="nombre" {...form.register("nombre")} placeholder="Ej. Supermercado" />
                        {form.formState.errors.nombre && <p className="text-red-500 text-sm">{form.formState.errors.nombre.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="valor">Valor</Label>
                        <Input id="valor" type="number" step="0.01" {...form.register("valor")} placeholder="Ej. 50000" />
                        {form.formState.errors.valor && <p className="text-red-500 text-sm">{form.formState.errors.valor.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categoria_id">Categoría</Label>
                        <Select
                            value={form.watch("categoria_id")}
                            onValueChange={(val) => form.setValue("categoria_id", val)}
                            disabled={categoriesLoading || categories.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    categoriesLoading
                                        ? "Cargando categorías..."
                                        : categories.length === 0
                                            ? "No hay categorías registradas"
                                            : "Seleccione una categoría"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.emoji} {cat.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {categories.length === 0 && !categoriesLoading && (
                            <p className="text-amber-600 text-xs mt-1">
                                Debes crear al menos una categoría primero.
                            </p>
                        )}
                        {form.formState.errors.categoria_id && <p className="text-red-500 text-sm">{form.formState.errors.categoria_id.message}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800">
                            {loading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
