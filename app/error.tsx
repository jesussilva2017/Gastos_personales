"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Algo salió mal</h2>
            <p className="text-slate-500 mb-8 max-w-md">
                {error.message || "Ha ocurrido un error inesperado al cargar la información. Por favor, intenta de nuevo."}
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} className="bg-slate-900 text-white hover:bg-slate-800">
                    Reintentar
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Ir al Inicio
                </Button>
            </div>
        </div>
    )
}
