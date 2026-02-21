"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations"
import { updatePasswordAction } from "@/actions/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { KeyRound } from "lucide-react"

interface PasswordModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PasswordModal({ open, onOpenChange }: PasswordModalProps) {
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdatePasswordInput>({
        resolver: zodResolver(updatePasswordSchema),
    })

    const onSubmit = async (data: UpdatePasswordInput) => {
        setLoading(true)
        const result = await updatePasswordAction(data)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Contraseña actualizada correctamente")
            reset()
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-full">
                            <KeyRound className="w-5 h-5 text-slate-600" />
                        </div>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            placeholder="••••••••"
                            {...register("currentPassword")}
                        />
                        {errors.currentPassword && (
                            <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
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
                            {loading ? "Actualizando..." : "Actualizar Contraseña"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
