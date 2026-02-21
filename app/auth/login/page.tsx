import { LoginForm } from "@/components/forms/LoginForm"
import { ShieldCheck } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col justify-center items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900">GastosApp</h2>
            </div>
            <LoginForm />
        </div>
    )
}
