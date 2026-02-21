"use client"

import { useState, useEffect } from "react"
import { logoutAction, getCurrentProfile } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, KeyRound, UserCog } from "lucide-react"
import Link from "next/link"
import { EditProfileModal } from "@/components/modals/EditProfileModal"
import { PasswordModal } from "@/components/modals/PasswordModal"

interface NavbarProps {
    nombre: string
    apellido: string
    rol: string
}

export function Navbar({ nombre: initialNombre, apellido: initialApellido, rol }: NavbarProps) {
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [passModalOpen, setPassModalOpen] = useState(false)
    const [profile, setProfile] = useState({ nombre: initialNombre, apellido: initialApellido })

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await getCurrentProfile()
            if (data) {
                setProfile({ nombre: data.nombre, apellido: data.apellido })
            }
        }
        if (!initialNombre || initialNombre === "Usuario") {
            fetchProfile()
        }
    }, [initialNombre])

    // Calculate initials from current profile state
    const nombre = profile.nombre || "U"
    const apellido = profile.apellido || ""
    const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
    const dashboardLink = rol === 'admin' ? '/admin' : '/dashboard'

    return (
        <nav className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 w-full items-center">
                    <Link href={dashboardLink} className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-slate-800 p-1.5 rounded-lg">
                            <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
                        </div>
                        Gastos
                    </Link>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium hidden md:block text-slate-600">
                            {nombre} {apellido}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center p-0 hover:bg-slate-200 focus:ring-2 focus:ring-slate-400 transition-all border border-slate-200">
                                    <span className="font-bold text-slate-700 text-xs tracking-tighter">{iniciales}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 p-1">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{nombre} {apellido}</p>
                                        <p className="text-xs leading-none text-slate-500 capitalize">{rol}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setEditModalOpen(true)} className="cursor-pointer">
                                    <UserCog className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Editar Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPassModalOpen(true)} className="cursor-pointer">
                                    <KeyRound className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Cambiar Contraseña</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <form action={logoutAction} className="w-full">
                                    <DropdownMenuItem asChild>
                                        <button type="submit" className="w-full flex items-center text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer text-sm outline-none transition-colors">
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

            <EditProfileModal open={editModalOpen} onOpenChange={setEditModalOpen} />
            <PasswordModal open={passModalOpen} onOpenChange={setPassModalOpen} />
        </nav>
    )
}
