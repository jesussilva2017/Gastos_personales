import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/auth/login")

    const adminSupabase = (await import("@/lib/supabase")).getAdminClient()
    const { data: profile } = await adminSupabase.from("profiles").select("nombre, apellido, rol").eq("id", user.id).single()

    return (
        <>
            <Navbar nombre={profile?.nombre || "Admin"} apellido={profile?.apellido || ""} rol={profile?.rol || "admin"} />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
            <Footer />
        </>
    )
}
