"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import { registerAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState } from "react"
import Link from "next/link"

export function RegisterForm() {
    const [loading, setLoading] = useState(false)
    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { nombre: "", apellido: "", celular: "", email: "", password: "" },
    })

    const onSubmit = async (data: RegisterInput) => {
        setLoading(true)
        const result = await registerAction(data)
        if (result?.error) {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crear una cuenta</h1>
                <p className="text-slate-500 text-sm mt-2">Ingresa tus datos para registrarte</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" {...form.register("nombre")} />
                    {form.formState.errors.nombre && <p className="text-red-500 text-sm">{form.formState.errors.nombre.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" {...form.register("apellido")} />
                    {form.formState.errors.apellido && <p className="text-red-500 text-sm">{form.formState.errors.apellido.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input id="celular" type="tel" {...form.register("celular")} />
                {form.formState.errors.celular && <p className="text-red-500 text-sm">{form.formState.errors.celular.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors" disabled={loading}>
                {loading ? "Cargando..." : "Registrarse"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
                ¿Ya tienes cuenta? <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-700">Inicia sesión</Link>
            </p>
        </form>
    )
}
