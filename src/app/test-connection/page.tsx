'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function TestConnection() {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [message, setMessage] = useState('')
    const supabase = createClient()

    async function testConnection() {
        setStatus('LOADING')
        try {
            const { data, error } = await supabase.from('profiles').select('*').limit(1)
            if (error) throw error
            setStatus('SUCCESS')
            setMessage('¡Conexión exitosa! Supabase está respondiendo correctamente.')
        } catch (err: any) {
            console.error(err)
            setStatus('ERROR')
            setMessage(`Error de conexión: ${err.message}`)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md glass">
                <CardHeader>
                    <CardTitle>Prueba de Conexión Supabase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Haz clic en el botón para verificar que las variables de entorno y el cliente de Supabase funcionan.
                    </p>

                    <Button
                        onClick={testConnection}
                        disabled={status === 'LOADING'}
                        className="w-full"
                    >
                        {status === 'LOADING' ? 'Probando...' : 'Probar Conexión'}
                    </Button>

                    {status !== 'IDLE' && (
                        <div className={`p-4 rounded-md text-sm ${status === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-200' :
                                status === 'ERROR' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                            {message}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
