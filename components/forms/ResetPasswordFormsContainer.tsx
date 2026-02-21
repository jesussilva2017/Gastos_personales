"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, updatePasswordSchema, type ResetPasswordInput, type UpdatePasswordInput } from "@/lib/validations"
import { resetPasswordAction, updatePasswordAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ResetPasswordFormsContainer({ hasSession }: { hasSession: boolean }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const resetForm = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: "" },
    })

    const updateForm = useForm<UpdatePasswordInput>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    })

    const onResetSubmit = async (data: ResetPasswordInput) => {
        setLoading(true)
        const result = await resetPasswordAction(data)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Correo enviado. Revisa tu bandeja de entrada.")
            resetForm.reset()
        }
        setLoading(false)
    }

    const onUpdateSubmit = async (data: UpdatePasswordInput) => {
        setLoading(true)
        const result = await updatePasswordAction(data)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Contraseña actualizada exitosamente")
            router.push("/dashboard")
        }
        setLoading(false)
    }

    if (hasSession) {
        return (
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4 w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-center mb-6">
                    <p className="text-slate-500 text-sm mt-2">Ingresa tu nueva contraseña</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input id="password" type="password" {...updateForm.register("password")} />
                    {updateForm.formState.errors.password && <p className="text-red-500 text-sm">{updateForm.formState.errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input id="confirmPassword" type="password" {...updateForm.register("confirmPassword")} />
                    {updateForm.formState.errors.confirmPassword && <p className="text-red-500 text-sm">{updateForm.formState.errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                    {loading ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
            </form>
        )
    }

    return (
        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4 w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-center mb-6">
                <p className="text-slate-500 text-sm mt-2">Ingresa tu correo para recibir un enlace de recuperación</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="nombre@ejemplo.com" {...resetForm.register("email")} />
                {resetForm.formState.errors.email && <p className="text-red-500 text-sm">{resetForm.formState.errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
                <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-700">Volver a inicio de sesión</Link>
            </p>
        </form>
    )
}
