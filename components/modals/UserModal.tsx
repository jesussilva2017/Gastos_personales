"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userAdminSchema, userAdminUpdateSchema, type UserAdminInput, type UserAdminUpdateInput } from "@/lib/validations"
import { addUser, editUser } from "@/actions/users"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface UserModalProps {
    defaultOpen?: boolean
    onOpenChange: (open: boolean) => void
    editingId?: string | null
    initialData?: any
}

export function UserModal({ defaultOpen = false, onOpenChange, editingId, initialData }: UserModalProps) {
    const [loading, setLoading] = useState(false)

    const schema = editingId ? userAdminUpdateSchema : userAdminSchema
    const form = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: {
            nombre: "",
            apellido: "",
            email: "",
            celular: "",
            password: "",
            rol: "user",
            activo: true,
        },
    })

    useEffect(() => {
        if (defaultOpen) {
            if (editingId && initialData) {
                form.reset({
                    nombre: initialData.nombre,
                    apellido: initialData.apellido,
                    celular: initialData.celular,
                    rol: initialData.rol,
                    activo: initialData.activo,
                    email: initialData.email,
                })
            } else {
                form.reset({
                    nombre: "",
                    apellido: "",
                    email: "",
                    celular: "",
                    password: "",
                    rol: "user",
                    activo: true,
                })
            }
        }
    }, [defaultOpen, editingId, initialData])

    const onSubmit = async (data: any) => {
        setLoading(true)
        let result
        if (editingId) {
            result = await editUser(editingId, data as UserAdminUpdateInput)
        } else {
            result = await addUser(data as UserAdminInput)
        }

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(editingId ? "Usuario actualizado" : "Usuario creado")
            onOpenChange(false)
        }
        setLoading(false)
    }

    return (
        <Dialog open={defaultOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" {...form.register("nombre")} />
                            {form.formState.errors.nombre && <p className="text-red-500 text-sm">{form.formState.errors.nombre.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input id="apellido" {...form.register("apellido")} />
                            {form.formState.errors.apellido && <p className="text-red-500 text-sm">{form.formState.errors.apellido.message as string}</p>}
                        </div>
                    </div>

                    {!editingId && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo</Label>
                                <Input id="email" type="email" {...form.register("email")} />
                                {form.formState.errors.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input id="password" type="password" {...form.register("password")} />
                                {form.formState.errors.password && <p className="text-red-500 text-sm">{form.formState.errors.password.message as string}</p>}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="celular">Celular</Label>
                        <Input id="celular" {...form.register("celular")} />
                        {form.formState.errors.celular && <p className="text-red-500 text-sm">{form.formState.errors.celular.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rol">Rol</Label>
                            <Select
                                value={form.watch("rol")}
                                onValueChange={(val) => form.setValue("rol", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuario</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="activo">Estado</Label>
                            <div className="flex space-x-2 mt-1">
                                <Button
                                    type="button"
                                    variant={form.watch("activo") ? "default" : "outline"}
                                    onClick={() => form.setValue("activo", true)}
                                    className={form.watch("activo") ? "bg-green-600 hover:bg-green-700 w-1/2" : "w-1/2"}
                                >
                                    Activo
                                </Button>
                                <Button
                                    type="button"
                                    variant={!form.watch("activo") ? "default" : "outline"}
                                    onClick={() => form.setValue("activo", false)}
                                    className={!form.watch("activo") ? "bg-red-500 hover:bg-red-600 w-1/2" : "w-1/2"}
                                >
                                    Inactivo
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-slate-900 text-white">
                            {loading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
