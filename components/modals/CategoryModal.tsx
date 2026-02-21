"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema, type CategoryInput } from "@/lib/validations"
import { addCategory, editCategory, deleteCategory, getCategories } from "@/actions/categories"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Trash2 } from "lucide-react"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { toast } from "sonner"

export function CategoryModal({ defaultOpen = false, onOpenChange }: { defaultOpen?: boolean, onOpenChange: (open: boolean) => void }) {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showPicker, setShowPicker] = useState(false)

    const form = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: { nombre: "", emoji: "🏷️" },
    })

    useEffect(() => {
        loadCategories()
    }, [])

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

    const onSubmit = async (data: CategoryInput) => {
        setLoading(true)
        let result
        if (editingId) {
            result = await editCategory(editingId, data)
        } else {
            result = await addCategory(data)
        }

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(editingId ? "Categoría actualizada" : "Categoría creada")
            setEditingId(null)
            form.reset({ nombre: "", emoji: "🏷️" })
            loadCategories()
        }
        setLoading(false)
    }

    const handleEdit = (category: any) => {
        setEditingId(category.id)
        form.setValue("nombre", category.nombre)
        form.setValue("emoji", category.emoji)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return
        const result = await deleteCategory(id)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Categoría eliminada")
            loadCategories()
        }
    }

    return (
        <Dialog open={defaultOpen} onOpenChange={(open) => {
            if (!open) {
                setEditingId(null)
                form.reset({ nombre: "", emoji: "🏷️" })
                setShowPicker(false)
            }
            onOpenChange(open)
        }}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Categoría" : "Gestionar Categorías"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6 relative">
                    <div className="flex space-x-3 items-end">
                        <div className="space-y-2 relative">
                            <Label>Emoji</Label>
                            <Button type="button" variant="outline" className="w-12 h-10 p-0 text-xl" onClick={() => setShowPicker(!showPicker)}>
                                {form.watch("emoji") || "🙂"}
                            </Button>
                        </div>

                        <div className="space-y-2 flex-1">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" {...form.register("nombre")} placeholder="Ej. Comida" />
                        </div>
                    </div>

                    {showPicker && (
                        <div className="absolute z-50 mt-1 left-0 shadow-lg rounded-xl overflow-hidden border border-slate-100">
                            <EmojiPicker
                                onEmojiClick={(emojiData: EmojiClickData) => {
                                    form.setValue("emoji", emojiData.emoji)
                                    setShowPicker(false)
                                }}
                            />
                        </div>
                    )}

                    {form.formState.errors.nombre && <p className="text-red-500 text-sm">{form.formState.errors.nombre.message}</p>}
                    {form.formState.errors.emoji && <p className="text-red-500 text-sm">{form.formState.errors.emoji.message}</p>}

                    <div className="flex gap-2 justify-end">
                        {editingId && (
                            <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset({ nombre: "", emoji: "🏷️" }) }}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" disabled={loading} className="bg-slate-900 text-white">
                            {loading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>

                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                    <h3 className="font-medium text-sm text-slate-500">Categorías existentes</h3>

                    {categoriesLoading ? (
                        <div className="space-y-2 py-4">
                            <div className="h-12 bg-slate-50 animate-pulse rounded-lg"></div>
                            <div className="h-12 bg-slate-50 animate-pulse rounded-lg"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-slate-400">No hay categorías para tu usuario.</p>
                            <p className="text-[10px] text-slate-300 mt-2">Prueba creando una nueva con el botón de arriba.</p>
                        </div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{cat.emoji}</span>
                                    <span className="font-medium text-slate-700">{cat.nombre}</span>
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
