import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/auth/login")

    const { data: profile } = await supabase.from("profiles").select("nombre, rol").eq("id", user.id).single()

    return (
        <>
            <Navbar nombre={profile?.nombre || "Usuario"} rol={profile?.rol || "user"} />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
            <Footer />
        </>
    )
}
