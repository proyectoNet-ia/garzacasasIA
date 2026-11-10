export type BrandSurface = 'light' | 'dark'

export interface BrandLogos {
    /** Logotipo diseñado para colocarse sobre fondos OSCUROS (normalmente blanco/claro). */
    onDark: string | null
    /** Logotipo diseñado para colocarse sobre fondos CLAROS (normalmente oscuro/a color). */
    onLight: string | null
}

export const EMPTY_BRAND_LOGOS: BrandLogos = { onDark: null, onLight: null }

/** Luminancia relativa WCAG (0 = negro, 1 = blanco). */
export function relativeLuminance(r: number, g: number, b: number): number {
    const toLinear = (c: number) => {
        const v = c / 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Elige el logotipo correcto para la superficie detectada.
 * Si solo existe una versión cargada en Admin, se usa como respaldo para ambas superficies.
 */
export function pickBrandLogo(logos: BrandLogos, surface: BrandSurface): string | null {
    if (surface === 'dark') return logos.onDark || logos.onLight || null
    return logos.onLight || logos.onDark || null
}

const RGBA_REGEX = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i

function parseColor(value: string): { r: number; g: number; b: number; a: number } | null {
    const match = value.match(RGBA_REGEX)
    if (!match) return null
    let a = 1
    if (match[4] !== undefined) {
        a = match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4])
    }
    return { r: parseFloat(match[1]), g: parseFloat(match[2]), b: parseFloat(match[3]), a }
}

/** Luminancia asumida para fotografías/videos de fondo (heros con overlay oscuro). */
const PHOTO_ASSUMED_RGB = 55

/**
 * Detecta de forma inteligente si el logotipo está pintado sobre una superficie clara u oscura.
 * Compone (front-to-back) los fondos reales que hay debajo del centro del logotipo,
 * incluyendo navbars transparentes/fijas superpuestas sobre heros con imagen.
 */
export function detectSurfaceBehind(element: HTMLElement): BrandSurface | null {
    if (typeof window === 'undefined' || !element.isConnected) return null

    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null

    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1)
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1)

    const stack = document.elementsFromPoint(x, y).filter((node) => !element.contains(node))

    let accR = 0
    let accG = 0
    let accB = 0
    let accA = 0

    const addLayer = (r: number, g: number, b: number, a: number) => {
        if (a <= 0) return
        const weight = (1 - accA) * a
        accR += r * weight
        accG += g * weight
        accB += b * weight
        accA += weight
    }

    for (const node of stack) {
        if (accA >= 0.98) break
        const style = window.getComputedStyle(node)
        if (style.visibility === 'hidden' || Number(style.opacity) === 0) continue

        const opacity = Number(style.opacity) || 1
        const tag = node.tagName

        if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'PICTURE') {
            addLayer(PHOTO_ASSUMED_RGB, PHOTO_ASSUMED_RGB, PHOTO_ASSUMED_RGB, opacity)
            continue
        }

        const bgColor = parseColor(style.backgroundColor)
        if (bgColor && bgColor.a > 0) {
            addLayer(bgColor.r, bgColor.g, bgColor.b, bgColor.a * opacity)
        }

        const bgImage = style.backgroundImage
        if (bgImage && bgImage !== 'none') {
            if (bgImage.includes('url(')) {
                addLayer(PHOTO_ASSUMED_RGB, PHOTO_ASSUMED_RGB, PHOTO_ASSUMED_RGB, opacity)
            } else if (bgImage.includes('gradient')) {
                // Aproximación: promedio de los colores declarados en el gradiente
                const colors = bgImage.match(/rgba?\([^)]+\)/gi) || []
                const parsed = colors.map(parseColor).filter((c): c is NonNullable<typeof c> => c !== null)
                if (parsed.length > 0) {
                    const avg = parsed.reduce(
                        (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b, a: acc.a + c.a }),
                        { r: 0, g: 0, b: 0, a: 0 }
                    )
                    const n = parsed.length
                    addLayer(avg.r / n, avg.g / n, avg.b / n, (avg.a / n) * opacity)
                }
            }
        }
    }

    // Lo que quede sin cubrir se asume como el lienzo blanco del documento
    if (accA < 1) addLayer(255, 255, 255, 1)

    const luminance = relativeLuminance(accR, accG, accB)
    return luminance < 0.4 ? 'dark' : 'light'
}

/**
 * Analiza un archivo de imagen local (antes de subirlo) y devuelve la luminancia
 * promedio de sus píxeles visibles. Sirve para sugerir si el logo es apto para fondo oscuro o claro.
 */
export function analyzeLogoFileLuminance(file: File): Promise<number | null> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            try {
                const maxSide = 128
                const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1))
                const w = Math.max(1, Math.round((img.width || maxSide) * scale))
                const h = Math.max(1, Math.round((img.height || maxSide) * scale))
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                const ctx = canvas.getContext('2d')
                if (!ctx) return resolve(null)
                ctx.drawImage(img, 0, 0, w, h)
                const { data } = ctx.getImageData(0, 0, w, h)
                let total = 0
                let weightSum = 0
                for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3] / 255
                    if (alpha < 0.2) continue
                    total += relativeLuminance(data[i], data[i + 1], data[i + 2]) * alpha
                    weightSum += alpha
                }
                resolve(weightSum > 0 ? total / weightSum : null)
            } catch {
                resolve(null)
            } finally {
                URL.revokeObjectURL(url)
            }
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            resolve(null)
        }
        img.src = url
    })
}
