"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema, updatePasswordSchema, type ProfileInput, type UpdatePasswordInput } from "@/lib/validations"
import { updateProfileAction } from "@/actions/profile"
import { updatePasswordAction, logoutAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ProfileFormProps {
    initialData: { nombre: string; apellido: string; celular: string }
    hasPasswordLogin: boolean | undefined
}

export function ProfileForm({ initialData, hasPasswordLogin }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [loadingPwd, setLoadingPwd] = useState(false)

    const pForm = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
        defaultValues: initialData,
    })

    const pwdForm = useForm<UpdatePasswordInput>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    })

    const onProfileSubmit = async (data: ProfileInput) => {
        setLoading(true)
        const result = await updateProfileAction(data)
        if (result?.error) toast.error(result.error)
        else toast.success("Perfil actualizado")
        setLoading(false)
    }

    const onPwdSubmit = async (data: UpdatePasswordInput) => {
        setLoadingPwd(true)
        const result = await updatePasswordAction(data)
        if (result?.error) toast.error(result.error)
        else {
            toast.success("Contraseña actualizada")
            pwdForm.reset()
        }
        setLoadingPwd(false)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Datos Personales</CardTitle>
                    <CardDescription>Actualiza tu información de contacto</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={pForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input id="nombre" {...pForm.register("nombre")} />
                                {pForm.formState.errors.nombre && <p className="text-red-500 text-sm">{pForm.formState.errors.nombre.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellido">Apellido</Label>
                                <Input id="apellido" {...pForm.register("apellido")} />
                                {pForm.formState.errors.apellido && <p className="text-red-500 text-sm">{pForm.formState.errors.apellido.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="celular">Celular</Label>
                            <Input id="celular" {...pForm.register("celular")} />
                            {pForm.formState.errors.celular && <p className="text-red-500 text-sm">{pForm.formState.errors.celular.message}</p>}
                        </div>

                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {hasPasswordLogin && (
                <Card>
                    <CardHeader>
                        <CardTitle>Cambiar Contraseña</CardTitle>
                        <CardDescription>Asegúrate de usar una contraseña fuerte</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={pwdForm.handleSubmit(onPwdSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nueva contraseña</Label>
                                <Input id="new-password" type="password" {...pwdForm.register("password")} />
                                {pwdForm.formState.errors.password && <p className="text-red-500 text-sm">{pwdForm.formState.errors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                                <Input id="confirm-password" type="password" {...pwdForm.register("confirmPassword")} />
                                {pwdForm.formState.errors.confirmPassword && <p className="text-red-500 text-sm">{pwdForm.formState.errors.confirmPassword.message}</p>}
                            </div>

                            <Button type="submit" disabled={loadingPwd} variant="outline">
                                {loadingPwd ? "Actualizando..." : "Actualizar contraseña"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="border-red-100 bg-red-50">
                <CardContent className="pt-6">
                    <form action={logoutAction}>
                        <Button type="submit" variant="destructive" className="w-full">
                            Cerrar sesión en este dispositivo
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
