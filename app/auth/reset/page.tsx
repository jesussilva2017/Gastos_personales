import { ResetPasswordFormsContainer } from "@/components/forms/ResetPasswordFormsContainer"
import { ShieldCheck } from "lucide-react"
import { getServerClient } from "@/lib/supabase"

export default async function ResetPage() {
    const supabase = getServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col justify-center items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900">Restablecer Contraseña</h2>
            </div>
            <ResetPasswordFormsContainer hasSession={!!session} />
        </div>
    )
}
