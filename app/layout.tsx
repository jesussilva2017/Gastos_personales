import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gastos Personales",
  description: "Aplicación Web de Gastos Personales",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-neutral-50 flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
