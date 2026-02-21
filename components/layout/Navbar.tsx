import { logoutAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
    nombre: string
    rol: string
}

export function Navbar({ nombre, rol }: NavbarProps) {
    const inicial = nombre.charAt(0).toUpperCase()
    const dashboardLink = rol === 'admin' ? '/admin' : '/dashboard'

    return (
        <nav className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 w-full items-center">
                    <Link href={dashboardLink} className="text-xl font-bold text-slate-800">
                        Gastos
                    </Link>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium hidden sm:block">Hola, {nombre}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center p-0 hover:bg-slate-200 focus:ring-2 focus:ring-slate-400">
                                    <span className="font-semibold text-slate-700">{inicial}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        Mi Perfil
                                    </Link>
                                </DropdownMenuItem>
                                <form action={logoutAction}>
                                    <DropdownMenuItem asChild>
                                        <button type="submit" className="w-full text-left text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer text-sm py-1.5 px-2 rounded-sm outline-none transition-colors">
                                            Cerrar sesión
                                        </button>
                                    </DropdownMenuItem>
                                </form>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    )
}
