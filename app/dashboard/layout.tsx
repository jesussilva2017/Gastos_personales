import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getServerClient, getAdminClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    const adminSupabase = getAdminClient()
    const { data: profile } = await adminSupabase
        .from("profiles")
        .select("nombre, apellido, rol")
        .eq("id", user.id)
        .single()

    // Fallback: use email prefix if nombre is missing or is just a placeholder
    const nombre = profile?.nombre && profile.nombre !== "Usuario"
        ? profile.nombre
        : (user.email?.split("@")[0] || "Usuario")

    const apellido = profile?.apellido && profile.apellido !== "Pendiente"
        ? profile.apellido
        : ""

    return (
        <>
            <Navbar
                nombre={nombre}
                apellido={apellido}
                rol={profile?.rol || "user"}
            />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
            <Footer />
        </>
    )
}
