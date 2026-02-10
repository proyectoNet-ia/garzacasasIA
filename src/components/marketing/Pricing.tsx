import { createClient } from "@/lib/supabase-server"
import { Check, Zap, Crown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const iconMap: any = {
    'Gratis': Building2,
    'Pro': Zap,
    'Enterprise': Crown
}

export async function Pricing() {
    const supabase = await createClient()
    const { data: plans, error } = await supabase
        .from('subscriptions_config')
        .select('*')
        .order('priority', { ascending: true })

    if (error || !plans || plans.length === 0) {
        return null
    }

    return (
        <section id="planes" className="py-24 bg-white relative overflow-hidden">
            {/* Minimal background decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <Badge variant="outline" className="border-blue-500/10 bg-blue-500/5 text-blue-600 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                        Planes
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-700 sm:text-5xl font-heading">
                        Escala tu éxito inmobiliario
                    </h2>
                    <p className="max-w-[700px] text-zinc-500 md:text-xl font-medium">
                        Elige el plan que mejor se adapte a tus necesidades.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const Icon = iconMap[plan.name] || Building2
                        const features = Array.isArray(plan.features) ? plan.features : []
                        const isPopular = plan.name === 'Pro'

                        return (
                            <div
                                key={plan.id}
                                className={`group relative flex flex-col rounded-[3rem] border transition-all hover:-translate-y-2 shadow-sm hover:shadow-2xl duration-500 ${isPopular ? 'border-blue-600/20 bg-white ring-1 ring-blue-600/10' : 'border-black/5 bg-zinc-50'}`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-1 rotate-45 translate-x-4 translate-y-2 shadow-xl">
                                            Popular
                                        </div>
                                    </div>
                                )}

                                <div className="p-8 pb-0">
                                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${isPopular ? 'bg-blue-600 text-white' : 'bg-black/5 text-zinc-400'} mb-6 group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-700">{plan.name}</h3>
                                    <div className="mt-4 flex items-baseline text-zinc-700">
                                        {typeof plan.monthly_price === 'number' && plan.monthly_price > 0 ? (
                                            <>
                                                <span className="text-4xl font-black tracking-tight">$</span>
                                                <span className="text-5xl font-black tracking-tight leading-none">{Math.floor(plan.monthly_price)}</span>
                                                <span className="ml-1 text-sm font-bold text-zinc-400">/mes</span>
                                            </>
                                        ) : (
                                            <span className="text-5xl font-black tracking-tight leading-none">
                                                {plan.monthly_price === 0 ? 'Gratis' : (plan.monthly_price || 'Custom')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-6 text-sm text-zinc-500 leading-relaxed font-medium">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <ul className="mb-10 space-y-4 flex-1">
                                        {features.map((feature: string) => (
                                            <li key={feature} className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                                                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isPopular ? 'bg-blue-600/10 text-blue-600' : 'bg-black/5 text-zinc-400'}`}>
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isPopular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 hover:-translate-y-0.5' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
                                    >
                                        {plan.name === 'Enterprise' ? 'Contactar' : 'Empezar ahora'}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
