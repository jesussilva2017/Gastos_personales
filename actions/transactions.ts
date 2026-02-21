"use server"

import { getServerClient } from "@/lib/supabase"
import { transactionSchema, type TransactionInput } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getTransactions(page: number = 1, limit: number = 10) {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], count: 0 }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await supabase
        .from("transactions")
        .select(`
      *,
      categories (
        nombre,
        emoji
      )
    `, { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to)

    if (error) return { data: [], count: 0 }
    return { data, count: count || 0 }
}

export async function addTransaction(data: TransactionInput) {
    const result = transactionSchema.safeParse(data)
    if (!result.success) return { error: result.error.issues[0].message }

    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await supabase.from("transactions").insert({
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await supabase
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { error } = await supabase
        .from("transactions")
        .delete()
        .match({ id, user_id: user.id })

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { success: true }
}

export async function getDashboardStats() {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ingresos: 0, gastos: 0, balance: 0, chartData: [] }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    // Get current month transactions
    const { data: currentMonthTx } = await supabase
        .from("transactions")
        .select("tipo, valor")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)

    let ingresos = 0
    let gastos = 0

    currentMonthTx?.forEach((tx) => {
        if (tx.tipo === "ingreso") ingresos += Number(tx.valor)
        if (tx.tipo === "gasto") gastos += Number(tx.valor)
    })

    // Get all transactions for chart (grouped by month)
    const { data: allTx } = await supabase
        .from("transactions")
        .select("created_at, tipo, valor")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

    const monthlyData: Record<string, { ingresos: number; gastos: number }> = {}

    allTx?.forEach((tx) => {
        const date = new Date(tx.created_at)
        const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' })
        if (!monthlyData[monthYear]) monthlyData[monthYear] = { ingresos: 0, gastos: 0 }
        if (tx.tipo === "ingreso") monthlyData[monthYear].ingresos += Number(tx.valor)
        if (tx.tipo === "gasto") monthlyData[monthYear].gastos += Number(tx.valor)
    })

    // Format for Recharts
    const chartData = Object.keys(monthlyData).map(key => ({
        name: key,
        ingresos: monthlyData[key].ingresos,
        gastos: monthlyData[key].gastos,
    }))

    return { ingresos, gastos, balance: ingresos - gastos, chartData }
}
