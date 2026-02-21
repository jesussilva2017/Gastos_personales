"use server"

import { getServerClient } from "@/lib/supabase"
import { registerSchema, loginSchema, resetPasswordSchema, updatePasswordSchema, type RegisterInput, type LoginInput, type ResetPasswordInput, type UpdatePasswordInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function loginAction(data: LoginInput) {
    const result = loginSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    })

    if (error) return { error: error.message }
    redirect("/")
}

export async function registerAction(data: RegisterInput) {
    const result = registerSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    })

    if (authError) return { error: authError.message }

    if (authData.user) {
        const adminClient = await import("@/lib/supabase").then(m => m.getAdminClient())
        const { error: profileError } = await adminClient.from('profiles').insert({
            id: authData.user.id,
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular,
            rol: 'user',
            activo: true
        })

        if (profileError) return { error: "Error al crear perfil" }
    }

    redirect("/dashboard")
}

export async function resetPasswordAction(data: ResetPasswordInput) {
    const result = resetPasswordSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset`,
    })

    if (error) return { error: error.message }
    return { success: true }
}

export async function logoutAction() {
    const supabase = getServerClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
}

export async function updatePasswordAction(data: UpdatePasswordInput) {
    const result = updatePasswordSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { error } = await supabase.auth.updateUser({
        password: data.password,
    })

    if (error) return { error: error.message }
    return { success: true }
}
