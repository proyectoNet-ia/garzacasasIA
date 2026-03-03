'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Send } from "lucide-react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { toast } from "sonner"

export function Contact() {
    return (
        <section id="contacto" className="py-24 bg-zinc-950 relative overflow-hidden">
            {/* Dark Aesthetic Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative">
                <div className="max-w-6xl mx-auto rounded-[4rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl">
                    <div className="grid lg:grid-cols-2">
                        {/* Info Side */}
                        <ScrollReveal direction="right" className="p-12 lg:p-20 space-y-12 bg-white/[0.02] border-r border-white/5">
                            <div className="space-y-6">
                                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
                                    Hablemos Hoy
                                </Badge>
                                <h2 className="text-4xl font-black tracking-tighter text-white sm:text-6xl font-heading leading-[0.9]">
                                    ¿Listo para tu próxima <span className="text-blue-500 italic block">Inversión?</span>
                                </h2>
                                <p className="text-zinc-300 text-lg font-medium leading-relaxed">
                                    Estamos aquí para resolver tus dudas y guiarte en cada paso del proceso inmobiliario en Monterrey.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6 group">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 ring-1 ring-white/10">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Llámanos</p>
                                        <p className="text-xl font-bold text-white">+52 (81) 1234 5678</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 ring-1 ring-white/10">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email</p>
                                        <p className="text-xl font-bold text-white">hola@garzacasas.ia</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 ring-1 ring-white/10">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Oficina</p>
                                        <p className="text-xl font-bold text-white">San Pedro Garza García, NL</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Form Side */}
                        <ScrollReveal direction="left" className="p-12 lg:p-20 bg-black/40">
                            <ContactForm />
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ContactForm() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('¡Mensaje enviado con éxito!', {
                    description: 'Te contactaremos a la brevedad.'
                })
                setFormData({ name: '', email: '', message: '' })
            } else {
                throw new Error(data.error || 'Algo salió mal')
            }
        } catch (error: any) {
            toast.error('Error al enviar mensaje', {
                description: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nombre</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tu nombre"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-zinc-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-zinc-500"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Mensaje</label>
                <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 outline-none focus:border-blue-500/50 transition-all text-white font-medium placeholder:text-zinc-500 resize-none"
                ></textarea>
            </div>
            <Button
                type="submit"
                disabled={loading}
                className="w-full h-16 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 gap-3 group"
            >
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
                {!loading && <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
            </Button>
            <p className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-4">
                O escríbenos por <span className="text-green-500 cursor-pointer hover:underline">WhatsApp</span> para respuesta inmediata
            </p>
        </form>
    )
}
