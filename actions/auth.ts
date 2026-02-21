"use server"

import { getServerClient, getAdminClient } from "@/lib/supabase"
import { registerSchema, loginSchema, resetPasswordSchema, updatePasswordSchema, profileSchema, type RegisterInput, type LoginInput, type ResetPasswordInput, type UpdatePasswordInput, type ProfileInput } from "@/lib/validations"
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

    const adminClient = getAdminClient()

    // Crear usuario usando el cliente admin para marcar el email como confirmado automáticamente
    // Esto evita que se envíe el correo de confirmación de Supabase
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
    })

    if (authError) return { error: authError.message }

    if (authData.user) {
        console.log("Creating profile for user:", authData.user.id)

        const { error: profileError } = await adminClient.from('profiles').upsert({
            id: authData.user.id,
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular,
            rol: 'user',
            activo: true
        })

        if (profileError) {
            console.error("Error creating profile:", profileError)
            return { error: "Error al crear el perfil del usuario" }
        }

        // Iniciar sesión automáticamente después de crear la cuenta y el perfil
        const supabase = getServerClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (signInError) {
            console.error("Error signing in after registration:", signInError)
            return { error: "Cuenta creada, por favor inicia sesión manualmente" }
        }
    }

    revalidatePath("/")
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    // Verify current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
    })

    if (signInError) return { error: "La contraseña actual es incorrecta" }

    const { error } = await supabase.auth.updateUser({
        password: data.password,
    })

    if (error) return { error: error.message }
    return { success: true }
}

export async function updateProfileAction(data: ProfileInput) {
    const result = profileSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    // Update email if changed
    if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: data.email })
        if (authError) return { error: authError.message }
    }

    const { error } = await adminSupabase
        .from("profiles")
        .update({
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular,
        })
        .eq("id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/")
    return { success: true }
}

export async function getCurrentUser() {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getCurrentProfile() {
    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    let { data, error } = await adminSupabase.from("profiles").select("*").eq("id", user.id).single()

    // If profile doesn't exist, create a basic one for this user
    if (error && error.code === 'PGRST116') {
        const defaultName = user.email ? user.email.split('@')[0] : "Usuario"
        const { data: newProfile, error: createError } = await adminSupabase.from("profiles").insert({
            id: user.id,
            nombre: defaultName,
            apellido: "Pendiente",
            rol: "user",
            activo: true
        }).select().single()

        if (createError) return null
        data = newProfile
    } else if (error) {
        return null
    }

    return { ...data, email: user.email }
}
