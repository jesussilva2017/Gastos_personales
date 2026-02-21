"use server"

import { getServerClient } from "@/lib/supabase"
import { categorySchema, type CategoryInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getCategories() {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) return []
    return data
}

export async function addCategory(data: CategoryInput) {
    const result = categorySchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await supabase.from("categories").insert({
        nombre: data.nombre,
        emoji: data.emoji,
        user_id: user.id,
    })

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { success: true }
}

export async function editCategory(id: string, data: CategoryInput) {
    const result = categorySchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await supabase
        .from("categories")
        .update({ nombre: data.nombre, emoji: data.emoji })
        .match({ id, user_id: user.id })

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await supabase
        .from("categories")
        .delete()
        .match({ id, user_id: user.id })

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { success: true }
}
