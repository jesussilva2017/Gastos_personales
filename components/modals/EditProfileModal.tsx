"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema, type ProfileInput } from "@/lib/validations"
import { updateProfileAction, getCurrentProfile } from "@/actions/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { UserCircle } from "lucide-react"

interface EditProfileModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
    })

    useEffect(() => {
        if (open) {
            loadProfile()
        }
    }, [open])

    const loadProfile = async () => {
        setFetching(true)
        const profile = await getCurrentProfile()
        setFetching(false)
        if (profile) {
            reset({
                nombre: profile.nombre,
                apellido: profile.apellido,
                email: profile.email,
                celular: profile.celular,
            })
        }
    }

    const onSubmit = async (data: ProfileInput) => {
        setLoading(true)
        const result = await updateProfileAction(data)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Perfil actualizado correctamente")
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-full">
                            <UserCircle className="w-5 h-5 text-slate-600" />
                        </div>
                        <DialogTitle>Editar Perfil</DialogTitle>
                    </div>
                </DialogHeader>

                {fetching ? (
                    <div className="py-8 space-y-4">
                        <div className="h-10 bg-slate-50 animate-pulse rounded"></div>
                        <div className="h-10 bg-slate-50 animate-pulse rounded"></div>
                        <div className="h-10 bg-slate-50 animate-pulse rounded"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input id="nombre" {...register("nombre")} />
                                {errors.nombre && (
                                    <p className="text-xs text-red-500">{errors.nombre.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellido">Apellido</Label>
                                <Input id="apellido" {...register("apellido")} />
                                {errors.apellido && (
                                    <p className="text-xs text-red-500">{errors.apellido.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" {...register("email")} />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="celular">Celular</Label>
                            <Input id="celular" {...register("celular")} />
                            {errors.celular && (
                                <p className="text-xs text-red-500">{errors.celular.message}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-slate-800 hover:bg-slate-900"
                                disabled={loading}
                            >
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
