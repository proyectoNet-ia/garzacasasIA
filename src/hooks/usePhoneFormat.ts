/**
 * usePhoneFormat — formato (000) 000-0000
 * Limita a 10 dígitos, aplica máscara automáticamente.
 * Guarda solo dígitos en estado, muestra formato visual al usuario.
 */

/**
 * Formatea una cadena de dígitos en (000) 000-0000
 */
export function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length === 0) return ''
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/**
 * Elimina el formato y retorna solo los dígitos
 */
export function stripPhone(formatted: string): string {
    return formatted.replace(/\D/g, '').slice(0, 10)
}

/**
 * Handler para onChange en un input de teléfono.
 * Recibe el evento y llama a la función setter con el valor formateado.
 */
export function handlePhoneChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
) {
    setter(formatPhone(e.target.value))
}
