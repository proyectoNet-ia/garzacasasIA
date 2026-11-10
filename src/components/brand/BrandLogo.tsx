'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useBrandLogos } from '@/providers/BrandProvider'
import { detectSurfaceBehind, pickBrandLogo, type BrandSurface } from '@/lib/brand'
import { cn } from '@/lib/utils'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface BrandLogoProps {
    /** Marcado de texto/icono actual que se muestra si el Admin aún no carga logotipos. */
    fallback: ReactNode
    /**
     * 'auto' (default): detecta el fondo real detrás del logo y elige la versión correcta.
     * 'light' | 'dark': fuerza una superficie concreta.
     */
    surface?: 'auto' | BrandSurface
    /** Superficie esperada para el primer render (evita parpadeo antes de la detección). */
    initialSurface?: BrandSurface
    /** Clases para el <img> (controlar alto, p. ej. "h-10"). */
    imgClassName?: string
    className?: string
    alt?: string
}

export function BrandLogo({
    fallback,
    surface = 'auto',
    initialSurface = 'light',
    imgClassName,
    className,
    alt = 'Garza Casas IA',
}: BrandLogoProps) {
    const logos = useBrandLogos()
    const wrapperRef = useRef<HTMLSpanElement>(null)
    const [detected, setDetected] = useState<BrandSurface>(surface === 'auto' ? initialSurface : surface)
    const frameRef = useRef<number | null>(null)

    const hasAnyLogo = Boolean(logos.onDark || logos.onLight)

    const evaluate = useCallback(() => {
        if (surface !== 'auto') {
            setDetected(surface)
            return
        }
        if (frameRef.current !== null) return
        frameRef.current = window.requestAnimationFrame(() => {
            frameRef.current = null
            const el = wrapperRef.current
            if (!el) return
            const result = detectSurfaceBehind(el)
            if (result) setDetected((prev) => (prev === result ? prev : result))
        })
    }, [surface])

    useIsomorphicLayoutEffect(() => {
        if (!hasAnyLogo) return
        evaluate()

        if (surface !== 'auto') return

        const onChange = () => evaluate()
        window.addEventListener('scroll', onChange, { passive: true })
        window.addEventListener('resize', onChange)
        // Navbars/menus con transiciones de color: reevaluar al terminar animaciones
        document.addEventListener('transitionend', onChange, true)
        document.addEventListener('animationend', onChange, true)

        // Cambios de clases en ancestros (ej. navbar al hacer scroll, tema oscuro/claro)
        const observer = new MutationObserver(onChange)
        let node: HTMLElement | null = wrapperRef.current?.parentElement || null
        let depth = 0
        while (node && depth < 6) {
            observer.observe(node, { attributes: true, attributeFilter: ['class', 'style'] })
            node = node.parentElement
            depth++
        }

        const settleTimer = window.setTimeout(onChange, 400)

        return () => {
            window.removeEventListener('scroll', onChange)
            window.removeEventListener('resize', onChange)
            document.removeEventListener('transitionend', onChange, true)
            document.removeEventListener('animationend', onChange, true)
            observer.disconnect()
            window.clearTimeout(settleTimer)
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current)
                frameRef.current = null
            }
        }
    }, [hasAnyLogo, surface, evaluate])

    if (!hasAnyLogo) return <>{fallback}</>

    const src = pickBrandLogo(logos, surface === 'auto' ? detected : surface)
    if (!src) return <>{fallback}</>

    return (
        <span ref={wrapperRef} className={cn('inline-flex items-center', className)} data-brand-surface={detected}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                className={cn('h-10 w-auto max-w-[220px] object-contain select-none transition-opacity duration-300', imgClassName)}
                draggable={false}
            />
        </span>
    )
}
