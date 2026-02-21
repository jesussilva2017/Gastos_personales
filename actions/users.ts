"use server"

import { getAdminClient, getServerClient } from "@/lib/supabase"
import { userAdminSchema, userAdminUpdateSchema, type UserAdminInput, type UserAdminUpdateInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getUsersStats() {
    const adminClient = getAdminClient()

    const { count: total, error: totalError } = await adminClient.from("profiles").select("*", { count: "exact", head: true })
    const { count: inactivos, error: inactivosError } = await adminClient.from("profiles").select("*", { count: "exact", head: true }).eq("activo", false)

    if (totalError || inactivosError) {
        console.error("Error fetching stats:", totalError || inactivosError)
        return { total: 0, inactivos: 0 }
    }

    return { total: total || 0, inactivos: inactivos || 0 }
}

export async function getUsers(page: number = 1, search: string = "") {
    const adminClient = getAdminClient()

    const limit = 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = adminClient
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to)

    if (search) {
        query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()

    const mappedData = data?.map(profile => {
        const authUser = authUsers?.find(u => u.id === profile.id)
        return { ...profile, email: authUser?.email || "" }
    })

    // Re-filter by email if search present and no mapping matched name?
    let finalData = mappedData || []
    if (search && !data?.length && authUsers) {
        const matchingAuthUsers = authUsers.filter(u => u.email?.toLowerCase().includes(search.toLowerCase())).map(u => u.id)
        if (matchingAuthUsers.length) {
            const q = await adminClient.from("profiles").select("*", { count: "exact" }).in("id", matchingAuthUsers).range(from, to)
            finalData = q.data?.map(profile => {
                const authUser = authUsers.find(u => u.id === profile.id)
                return { ...profile, email: authUser?.email || "" }
            }) || []
        }
    }

    if (error) return { data: [], count: 0 }
    return { data: finalData, count: count || 0 }
}

export async function addUser(data: UserAdminInput) {
    const result = userAdminSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const adminClient = getAdminClient()
    const { data: adminUser, error: adminError } = await adminClient.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
    })

    if (adminError) return { error: adminError.message }

    if (adminUser.user) {
        const { error: profileError } = await adminClient.from("profiles").insert({
            id: adminUser.user.id,
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular,
            rol: data.rol,
            activo: data.activo,
        })

        if (profileError) {
            await adminClient.auth.admin.deleteUser(adminUser.user.id)
            return { error: "Error al crear el perfil del usuario" }
        }
    }

    revalidatePath("/admin")
    return { success: true }
}

export async function editUser(id: string, data: UserAdminUpdateInput) {
    const result = userAdminUpdateSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const adminClient = getAdminClient()

    const { error } = await adminClient.from("profiles").update({
        nombre: data.nombre,
        apellido: data.apellido,
        celular: data.celular,
        rol: data.rol,
        activo: data.activo,
    }).eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return { success: true }
}

export async function deleteUser(id: string) {
    const adminClient = getAdminClient()
    const { error: profileError } = await adminClient.from("profiles").delete().eq("id", id)
    if (profileError) return { error: profileError.message }

    const { error: authError } = await adminClient.auth.admin.deleteUser(id)
    if (authError) return { error: authError.message }

    revalidatePath("/admin")
    return { success: true }
}
