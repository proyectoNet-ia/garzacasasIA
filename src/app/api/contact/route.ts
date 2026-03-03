import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const contactEmail = process.env.CONTACT_EMAIL_TO || 'hola@garzacasas.com';

export async function POST(req: Request) {
    // Inicializar Resend de forma lazy para que el build no falle si la key no está
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY no configurada — formulario de contacto deshabilitado');
        return NextResponse.json(
            { error: 'El servicio de email no está configurado.' },
            { status: 503 }
        );
    }

    const resend = new Resend(apiKey);

    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Todos los campos son obligatorios' },
                { status: 400 }
            );
        }

        const { data, error } = await resend.emails.send({
            from: 'Garza Casas IA <onboarding@resend.dev>',
            to: [contactEmail],
            subject: `Nuevo mensaje de contacto: ${name}`,
            replyTo: email,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Nuevo Mensaje de Contacto</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Mensaje:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
