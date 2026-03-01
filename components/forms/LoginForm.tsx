"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function LoginForm() {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    useEffect(() => {
        const error = searchParams.get("error")
        if (error === "account_inactive") {
            toast.error("Tu cuenta está inactiva. Por favor, contacta al administrador.")
        }
    }, [searchParams])

    const onSubmit = async (data: LoginInput) => {
        setLoading(true)
        const result = await loginAction(data)
        if (result?.error) {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bienvenido de nuevo</h1>
                <p className="text-slate-500 text-sm mt-2">Ingresa a tu cuenta para continuar</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    {...form.register("email")}
                />
                {form.formState.errors.email && (
                    <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/auth/reset" className="text-sm text-green-600 hover:text-green-700 font-medium">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                />
                {form.formState.errors.password && (
                    <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors" disabled={loading}>
                {loading ? "Cargando..." : "Iniciar sesión"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
                ¿No tienes cuenta? <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-700">Regístrate</Link>
            </p>
        </form>
    )
}
