import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getServerClient, getAdminClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/actions/auth"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = getServerClient()
    // Use our robust sync function to ensure profile exists
    const profile = await getCurrentProfile()

    return (
        <>
            <Navbar
                nombre={profile?.nombre || "Usuario"}
                apellido={profile?.apellido || ""}
                rol={profile?.rol || "user"}
            />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
            <Footer />
        </>
    )
}
