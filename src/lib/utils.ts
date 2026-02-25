import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string) {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return 'P.N.A'

  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(num)
}
