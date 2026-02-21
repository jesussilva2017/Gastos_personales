import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, TrendingUp, PiggyBank, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar Minimalista */}
      <nav className="w-full bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-green-100 p-2 rounded-full">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">GastosApp</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
            Iniciar Sesión
          </Link>
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
            <Link href="/auth/register">Empezar Gratis</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>La forma más inteligente de gestionar tu dinero</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Toma el control de tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">finanzas</span> hoy.
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Registra tus ingresos, controla tus gastos diarios y visualiza tu balance mensual con gráficos detallados. Todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-200 transition-all hover:scale-105 w-full sm:w-auto">
              <Link href="/auth/register">Crear mi cuenta gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto">
              <Link href="/auth/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Registra Movimientos</h3>
            <p className="text-slate-500 text-sm">Añade tus ingresos y gastos en segundos con categorías personalizadas y emojis.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-2">
              <PiggyBank className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Conoce tu Balance</h3>
            <p className="text-slate-500 text-sm">Visualiza al instante cuánto has ganado y gastado en el mes para evitar sorpresas.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-2">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Gráficos Detallados</h3>
            <p className="text-slate-500 text-sm">Analiza tu progreso mensual con gráficas de barras interactivas fáciles de entender.</p>
          </div>
        </div>
      </main>

      {/* Footer Minimalista (opcional extra para el landing) */}
      <footer className="w-full bg-white border-t border-slate-100 py-6 text-center">
        <p className="text-sm text-slate-400">© devsoluciones. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
