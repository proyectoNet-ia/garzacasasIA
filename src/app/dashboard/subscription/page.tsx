import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Check, TrendingUp } from 'lucide-react'

export default function AgentSubscription() {
    const currentPlan = {
        name: 'Gratis',
        price: 0,
        properties_limit: 5,
        images_per_property: 3,
        priority_tier: 1,
    }

    const plans = [
        {
            name: 'Gratis',
            price: 0,
            properties_limit: 5,
            images_per_property: 3,
            priority_tier: 1,
            features: ['5 propiedades', '3 imágenes por propiedad', 'Prioridad básica'],
            current: true
        },
        {
            name: 'Pro',
            price: 499,
            properties_limit: 50,
            images_per_property: 15,
            priority_tier: 2,
            features: ['50 propiedades', '15 imágenes por propiedad', 'Prioridad media', 'Análisis con IA'],
            current: false
        },
        {
            name: 'Platino',
            price: 999,
            properties_limit: 500,
            images_per_property: 30,
            priority_tier: 3,
            features: ['500 propiedades', '30 imágenes por propiedad', 'Prioridad máxima', 'Análisis con IA', 'Estadísticas avanzadas', 'Soporte prioritario'],
            current: false
        },
    ]

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Mi Plan</h1>
                <p className="text-zinc-500 mt-2">Gestiona tu suscripción y mejora tu plan</p>
            </div>

            {/* Current Plan */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-zinc-900 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-blue-600" />
                            Plan Actual: {currentPlan.name}
                        </CardTitle>
                        <span className="text-2xl font-black text-blue-600">
                            ${currentPlan.price} <span className="text-sm text-zinc-600">/mes</span>
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-zinc-600 mb-1">Propiedades</p>
                            <p className="text-lg font-bold text-zinc-900">0 / {currentPlan.properties_limit}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-600 mb-1">Imágenes por propiedad</p>
                            <p className="text-lg font-bold text-zinc-900">{currentPlan.images_per_property}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-600 mb-1">Prioridad</p>
                            <p className="text-lg font-bold text-zinc-900">Tier {currentPlan.priority_tier}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Available Plans */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-4">Planes Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={plan.current ? 'border-blue-300 bg-blue-50' : 'border-zinc-200'}
                        >
                            <CardHeader>
                                <CardTitle className="text-zinc-900">{plan.name}</CardTitle>
                                <div className="text-3xl font-black text-zinc-900">
                                    ${plan.price}
                                    <span className="text-sm text-zinc-600 font-normal">/mes</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-zinc-700">
                                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full gap-2"
                                    variant={plan.current ? 'outline' : 'default'}
                                    disabled={plan.current}
                                >
                                    {plan.current ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Plan Actual
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="h-4 w-4" />
                                            Mejorar a {plan.name}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
