import { getServerClient } from "@/lib/supabase"
import { ProfileForm } from "./ProfileForm"
import { ShieldCheck } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = getServerClient()
    const { data: { user } } = await supabase.auth.getSession()

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single()

    return (
        <div className="max-w-xl mx-auto space-y-8 mt-10">
            <div className="flex items-center space-x-4 mb-8">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {profile?.nombre?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
                    <p className="text-slate-500">{user?.email}</p>
                </div>
            </div>

            <ProfileForm
                initialData={{ nombre: profile?.nombre || "", apellido: profile?.apellido || "", celular: profile?.celular || "" }}
                hasPasswordLogin={user?.app_metadata?.provider === "email"}
            />
        </div>
    )
}
