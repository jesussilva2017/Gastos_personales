"use server"

import { getServerClient } from "@/lib/supabase"
import { profileSchema, type ProfileInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function updateProfileAction(data: ProfileInput) {
    const result = profileSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autenticado" }

    const { error } = await supabase
        .from("profiles")
        .update({
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular
        })
        .eq("id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    return { success: true }
}
