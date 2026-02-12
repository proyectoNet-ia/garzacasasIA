'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)

        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Button
                size="icon"
                onClick={scrollToTop}
                className={cn(
                    "rounded-full shadow-xl transition-all duration-500 transform h-14 w-14 bg-blue-600/90 backdrop-blur-md text-white border border-blue-400/20 hover:bg-blue-700 hover:scale-110 hover:shadow-blue-600/40 active:scale-90",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                )}
                aria-label="Volver arriba"
            >
                <ArrowUp className="h-6 w-6" />
            </Button>
        </div>
    )
}
