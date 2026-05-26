import { redirect } from 'next/navigation'

// Redirige la ruta antigua /dashboard/subscription → /dashboard/suscripcion
export default function OldSubscriptionPage() {
    redirect('/dashboard/suscripcion')
}
