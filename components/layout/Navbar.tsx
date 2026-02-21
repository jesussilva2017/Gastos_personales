"use client"

import { logoutAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, KeyRound, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { PasswordModal } from "@/components/modals/PasswordModal"
import { useState } from "react"

interface NavbarProps {
    nombre: string
    apellido: string
    rol: string
}

export function Navbar({ nombre, apellido, rol }: NavbarProps) {
    const [passModalOpen, setPassModalOpen] = useState(false)

    const nombreMostrar = nombre || "Usuario"
    const apellidoMostrar = apellido || ""

    // Iniciales: primera letra de nombre + primera letra de apellido
    const iniciales = `${nombreMostrar.charAt(0)}${apellidoMostrar.charAt(0)}`.toUpperCase().trim() || "U"

    return (
        <nav className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 w-full items-center">
                    <Link href="/dashboard" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-slate-800 p-1.5 rounded-lg">
                            <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
                        </div>
                        Finanzas Personales
                    </Link>

                    <div className="flex items-center space-x-3">
                        {/* Nombre completo visible en desktop */}
                        <span className="text-sm font-medium hidden md:block text-slate-600">
                            {nombreMostrar} {apellidoMostrar}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center p-0 hover:bg-slate-700 focus:ring-2 focus:ring-slate-400 transition-all border-0"
                                >
                                    <span className="font-bold text-white text-xs tracking-tighter">
                                        {iniciales}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 p-1">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none text-slate-800">
                                            {nombreMostrar} {apellidoMostrar}
                                        </p>
                                        <p className="text-xs leading-none text-slate-500 capitalize">{rol}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {rol === 'admin' && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="flex items-center cursor-pointer">
                                                <ShieldCheck className="mr-2 h-4 w-4 text-slate-500" />
                                                <span className="font-medium text-slate-700">Panel Administrativo</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem
                                    onClick={() => setPassModalOpen(true)}
                                    className="cursor-pointer"
                                >
                                    <KeyRound className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Cambiar Contraseña</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <form action={logoutAction} className="w-full">
                                    <DropdownMenuItem asChild>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer text-sm outline-none transition-colors"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Cerrar sesión
                                        </button>
                                    </DropdownMenuItem>
                                </form>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <PasswordModal open={passModalOpen} onOpenChange={setPassModalOpen} />
        </nav>
    )
}
