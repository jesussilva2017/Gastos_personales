"use server"

import { getServerClient, getAdminClient } from "@/lib/supabase"
import { transactionSchema, type TransactionInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getTransactions(page: number = 1, limit: number = 10, year?: number, month?: number, search?: string) {
    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], count: 0 }

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = adminSupabase
        .from("transactions")
        .select(`
      *,
      categories (
        nombre,
        emoji
      )
    `, { count: "exact" })
        .eq("user_id", user.id)

    if (year !== undefined && month !== undefined) {
        const startOfMonth = new Date(year, month, 1).toISOString()
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
        query = query.gte("created_at", startOfMonth).lte("created_at", endOfMonth)
    }

    if (search) {
        query = query.ilike("nombre", `%${search}%`)
    }

    const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to)

    if (error) return { data: [], count: 0 }
    return { data, count: count || 0 }
}

export async function addTransaction(data: TransactionInput) {
    const result = transactionSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await adminSupabase.from("transactions").insert({
        nombre: data.nombre,
        valor: data.valor,
        tipo: data.tipo,
        categoria_id: data.categoria_id,
        user_id: user.id,
    })

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { success: true }
}

export async function editTransaction(id: string, data: TransactionInput) {
    const result = transactionSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await adminSupabase
        .from("transactions")
        .update({
            nombre: data.nombre,
            valor: data.valor,
            tipo: data.tipo,
            categoria_id: data.categoria_id,
        })
        .match({ id, user_id: user.id })

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { success: true }
}

export async function deleteTransaction(id: string) {
    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await adminSupabase
        .from("transactions")
        .delete()
        .match({ id, user_id: user.id })

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { success: true }
}

export async function getDashboardStats(year?: number, month?: number) {
    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ingresos: 0, gastos: 0, ahorros: 0, balance: 0, chartData: [], categoryData: [] }

    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month !== undefined ? month : now.getMonth()

    const startOfMonth = new Date(targetYear, targetMonth, 1).toISOString()
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).toISOString()

    // Get selected month transactions
    const { data: currentMonthTx } = await adminSupabase
        .from("transactions")
        .select("tipo, valor")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)

    let ingresos = 0
    let gastos = 0
    let ahorros = 0

    currentMonthTx?.forEach((tx) => {
        if (tx.tipo === "ingreso") ingresos += Number(tx.valor)
        if (tx.tipo === "gasto") gastos += Number(tx.valor)
        if (tx.tipo === "ahorro") ahorros += Number(tx.valor)
    })

    // Get transactions for the selected period to build the chart
    const { data: allTx } = await adminSupabase
        .from("transactions")
        .select("created_at, tipo, valor, categories(nombre, emoji)")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)
        .order("created_at", { ascending: true })

    const monthlyData: Record<string, { ingresos: number; gastos: number; ahorros: number }> = {}
    const categoryTotals: Record<string, { nombre: string; emoji: string; total: number; tipo: "ingreso" | "gasto" | "ahorro" }> = {}

    allTx?.forEach((tx: any) => {
        const date = new Date(tx.created_at)
        const monthName = date.toLocaleString('es-CO', { month: 'long' })
        const label = monthName.charAt(0).toUpperCase() + monthName.slice(1)
        if (!monthlyData[label]) monthlyData[label] = { ingresos: 0, gastos: 0, ahorros: 0 }

        if (tx.tipo === "ingreso") monthlyData[label].ingresos += Number(tx.valor)
        if (tx.tipo === "gasto") monthlyData[label].gastos += Number(tx.valor)
        if (tx.tipo === "ahorro") monthlyData[label].ahorros += Number(tx.valor)

        // Aggregate totals per category (Income and Expense separately)
        const cat = tx.categories
        const catName = cat?.nombre || "Sin categoría"
        const catEmoji = cat?.emoji || "🏷️"
        const key = `${catName}-${tx.tipo}`

        if (!categoryTotals[key]) {
            categoryTotals[key] = {
                nombre: catName,
                emoji: catEmoji,
                total: 0,
                tipo: tx.tipo as "ingreso" | "gasto" | "ahorro"
            }
        }
        categoryTotals[key].total += Number(tx.valor)
    })

    // Format for Recharts
    const chartData = Object.keys(monthlyData).map(key => ({
        name: key,
        ingresos: monthlyData[key].ingresos,
        gastos: monthlyData[key].gastos,
        ahorros: monthlyData[key].ahorros,
    }))

    const categoryData = Object.values(categoryTotals).sort((a, b) => b.total - a.total)

    const totalTransactions = await adminSupabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

    return { ingresos, gastos, ahorros, balance: ingresos - gastos, chartData, categoryData, totalTransactions: totalTransactions.count || 0 }
}

export async function copyTransactions(ids: string[], targetYear: number, targetMonth: number) {
    const supabase = getServerClient()
    const adminSupabase = getAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    // Fetch the selected transactions
    const { data: txs, error: fetchError } = await adminSupabase
        .from("transactions")
        .select("nombre, valor, tipo, categoria_id, created_at")
        .in("id", ids)
        .eq("user_id", user.id)

    if (fetchError || !txs) return { error: fetchError?.message || "Error al obtener transacciones" }

    // Build new records with dates in the target month, preserving the day where possible
    const newRecords = txs.map((tx: any) => {
        const originalDate = new Date(tx.created_at)
        const originalDay = originalDate.getDate()
        // Clamp day to last day of target month
        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate()
        const day = Math.min(originalDay, lastDay)
        const newDate = new Date(targetYear, targetMonth, day, 12, 0, 0).toISOString()

        return {
            nombre: tx.nombre,
            valor: tx.valor,
            tipo: tx.tipo,
            categoria_id: tx.categoria_id,
            user_id: user.id,
            created_at: newDate,
        }
    })

    const { error: insertError } = await adminSupabase.from("transactions").insert(newRecords)
    if (insertError) return { error: insertError.message }

    revalidatePath("/dashboard")
    return { success: true, count: newRecords.length }
}

