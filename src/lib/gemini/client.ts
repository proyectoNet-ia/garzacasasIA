// ============================================================
// GEMINI — Cliente de IA para Garza Casas IA
// Genera descripciones de propiedades y análisis de zona
// Modelo: Gemini 2.5 Flash (Pay-as-you-go · billing activo)
// Registro: https://aistudio.google.com
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ServiciosCercanos } from '@/lib/inegi/tipos'

const apiKey = process.env.GOOGLE_AI_API_KEY

function getClient() {
    if (!apiKey) throw new Error('[Gemini] Falta GOOGLE_AI_API_KEY en variables de entorno')
    return new GoogleGenerativeAI(apiKey)
}

// ---- Tipos de entrada ----

export interface DatosPropiedad {
    tipo: string               // 'casa' | 'departamento' | 'terreno' | 'local'
    municipio: string          // e.g. 'Morelia'
    colonia: string            // e.g. 'Altozano'
    estado: string             // e.g. 'Michoacán'
    superficie_m2: number
    recamaras?: number
    banos?: number
    precio: number
    estacionamientos?: number
    caracteristicas?: string[] // ['alberca', 'jardín', 'roof garden']
}

export interface DatosZona {
    precio_m2_promedio: number
    variacion_anual_pct: number
    servicios: ServiciosCercanos
    perfil_zona?: string       // 'residencial alto' | 'medio' | etc.
}

// ---- Generador de descripción de venta ----

/**
 * Genera una descripción de venta profesional para una propiedad
 * usando datos reales de la zona del INEGI.
 * Feature #13 — Plan Platino
 */
export async function generarDescripcion(
    propiedad: DatosPropiedad,
    zona: DatosZona
): Promise<string> {
    const genAI = getClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const diferenciaPrecio = zona.precio_m2_promedio > 0
        ? (((propiedad.precio / propiedad.superficie_m2) - zona.precio_m2_promedio) / zona.precio_m2_promedio * 100).toFixed(1)
        : null

    const prompt = `
Eres un agente inmobiliario experto en México. Escribe una descripción de venta persuasiva y profesional para la siguiente propiedad. 
El texto debe ser en español, máximo 150 palabras, atractivo para compradores de nivel ${zona.perfil_zona ?? 'medio-alto'}.
Incluye naturalmente los datos de la zona como argumentos de venta. NO uses asteriscos ni formato markdown.

DATOS DE LA PROPIEDAD:
- Tipo: ${propiedad.tipo}
- Ubicación: ${propiedad.colonia}, ${propiedad.municipio}, ${propiedad.estado}
- Superficie: ${propiedad.superficie_m2} m²
${propiedad.recamaras ? `- Recámaras: ${propiedad.recamaras}` : ''}
${propiedad.banos ? `- Baños: ${propiedad.banos}` : ''}
${propiedad.estacionamientos ? `- Estacionamientos: ${propiedad.estacionamientos}` : ''}
${propiedad.caracteristicas?.length ? `- Características adicionales: ${propiedad.caracteristicas.join(', ')}` : ''}
- Precio: $${propiedad.precio.toLocaleString('es-MX')} MXN

DATOS REALES DE LA ZONA (INEGI 2026):
- Precio promedio m² en la zona: $${zona.precio_m2_promedio.toLocaleString('es-MX')} MXN
${diferenciaPrecio ? `- Esta propiedad está un ${Math.abs(parseFloat(diferenciaPrecio))}% ${parseFloat(diferenciaPrecio) < 0 ? 'por debajo' : 'por encima'} del promedio` : ''}
- Plusvalía anual de la zona: +${zona.variacion_anual_pct}% (datos INEGI)
- Servicios cercanos (en 500m): ${zona.servicios.escuelas} escuelas, ${zona.servicios.hospitales + zona.servicios.clinicas} centros de salud, ${zona.servicios.bancos} bancos, ${zona.servicios.supermercados} supermercados

Escribe solo la descripción, sin encabezados ni explicaciones adicionales.
`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
}

// ---- Analizador de insights de zona ----

/**
 * Genera un análisis ejecutivo completo de la zona para el agente.
 * Feature #14 — Plan Platino
 * Incluye: oportunidad de precio, potencial de inversión, perfil
 * del comprador, consideraciones y argumento de cierre sugerido.
 */
export async function analizarZona(
    propiedad: DatosPropiedad,
    zona: DatosZona
): Promise<{
    oportunidad_precio: string
    potencial_inversion: 'Alto' | 'Medio' | 'Bajo'
    perfil_comprador: string
    consideraciones: string
    argumento_cierre: string
    resumen_ejecutivo: string
}> {
    const genAI = getClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const precioM2Propiedad = propiedad.precio / propiedad.superficie_m2

    const prompt = `
Eres un analista inmobiliario experto en México con acceso a datos oficiales del INEGI.
Analiza la siguiente propiedad y su zona. Responde EXACTAMENTE en formato JSON con las claves indicadas.
El análisis debe ser concreto, basado en los datos, y útil para que el agente argumente con su cliente.

DATOS DE LA PROPIEDAD:
- Tipo: ${propiedad.tipo}
- Colonia: ${propiedad.colonia}, ${propiedad.municipio}
- Superficie: ${propiedad.superficie_m2} m²
- Precio: $${propiedad.precio.toLocaleString('es-MX')} MXN
- Precio por m²: $${Math.round(precioM2Propiedad).toLocaleString('es-MX')} MXN/m²

DATOS INEGI DE LA ZONA:
- Precio promedio m² zona: $${zona.precio_m2_promedio.toLocaleString('es-MX')} MXN
- Plusvalía anual: +${zona.variacion_anual_pct}%
- Escuelas cercanas: ${zona.servicios.escuelas}
- Centros de salud: ${zona.servicios.hospitales + zona.servicios.clinicas}
- Bancos: ${zona.servicios.bancos}
- Supermercados: ${zona.servicios.supermercados}
- Restaurantes: ${zona.servicios.restaurantes}
- Perfil de zona: ${zona.perfil_zona ?? 'No especificado'}

Responde SOLO con JSON válido, sin texto adicional, con esta estructura exacta:
{
  "oportunidad_precio": "texto de 1-2 oraciones sobre si está barata/cara vs el mercado",
  "potencial_inversion": "Alto" | "Medio" | "Bajo",
  "perfil_comprador": "descripción del comprador ideal en 1-2 oraciones",
  "consideraciones": "1-2 consideraciones honestas del mercado o la zona",
  "argumento_cierre": "el mejor argumento de venta con datos INEGI en 1 oración",
  "resumen_ejecutivo": "párrafo de 3-4 oraciones con el análisis completo"
}
`

    const result = await model.generateContent(prompt)
    const texto = result.response.text().trim()

    // Limpiar posibles marcadores de código que Gemini a veces agrega
    const json = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(json)
}

// ---- Generador de artículo de blog ----

/**
 * Genera un artículo de blog con datos INEGI de una zona.
 * Usado para el blog automático con SEO del sitio público.
 */
export async function generarArticuloBlog(
    municipio: string,
    estado: string,
    datosZona: DatosZona & { nombre_zonas_destacadas?: string[] }
): Promise<{ titulo: string; contenido: string; meta_descripcion: string }> {
    const genAI = getClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
Eres un experto en mercado inmobiliario de México. Escribe un artículo de blog informativo y optimizado para SEO 
sobre el mercado inmobiliario de ${municipio}, ${estado}.

DATOS REALES A INCLUIR (fuente INEGI 2026):
- Precio promedio m²: $${datosZona.precio_m2_promedio.toLocaleString('es-MX')} MXN
- Plusvalía anual: +${datosZona.variacion_anual_pct}%
${datosZona.nombre_zonas_destacadas ? `- Zonas destacadas: ${datosZona.nombre_zonas_destacadas.join(', ')}` : ''}

El artículo debe:
- Tener título atractivo que incluya "${municipio}" y el año 2026
- 400-500 palabras
- Mencionar los datos del INEGI como fuente oficial
- Incluir recomendaciones prácticas para compradores e inversores
- Lenguaje claro y accesible, NO técnico

Responde en JSON con esta estructura:
{
  "titulo": "...",
  "contenido": "HTML básico con <p>, <h2>, <ul>, <li> permitidos",
  "meta_descripcion": "máximo 160 caracteres para Google"
}
`

    const result = await model.generateContent(prompt)
    const texto = result.response.text().trim()
    const json = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(json)
}
