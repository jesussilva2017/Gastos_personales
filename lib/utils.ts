import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string) {
  // If it's just a date string (YYYY-MM-DD) like the one from fecha_pago
  if (dateString.includes("-") && !dateString.includes("T") && dateString.length === 10) {
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return format(date, "dd/MM/yyyy")
  }

  // Otherwise, handle it as a full ISO date (like created_at)
  const date = new Date(dateString)
  return format(date, "dd/MM/yyyy")
}
