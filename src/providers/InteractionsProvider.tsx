"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

interface InteractionsContextType {
    favorites: string[]
    compareList: any[]
    toggleFavorite: (id: string) => void
    toggleCompare: (property: any) => void
    isFavorite: (id: string) => boolean
    isComparing: (id: string) => boolean
    clearCompare: () => void
}

const InteractionsContext = createContext<InteractionsContextType | undefined>(undefined)

export function InteractionsProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([])
    const [compareList, setCompareList] = useState<any[]>([])
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        setMounted(true)
        try {
            const savedFavorites = localStorage.getItem('garza_favorites')
            if (savedFavorites) setFavorites(JSON.parse(savedFavorites))

            const savedCompare = localStorage.getItem('garza_compare')
            if (savedCompare) setCompareList(JSON.parse(savedCompare))
        } catch (e) {
            console.error("Error loading interactions from localStorage", e)
        }
    }, [])

    // Sync to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('garza_favorites', JSON.stringify(favorites))
            localStorage.setItem('garza_compare', JSON.stringify(compareList))
        }
    }, [favorites, compareList, mounted])

    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(fId => fId !== id)
                : [...prev, id]
        )
    }, [])

    const toggleCompare = useCallback((property: any) => {
        setCompareList(prev => {
            const isAlreadyComparing = prev.some(p => p.id === property.id)
            if (isAlreadyComparing) {
                return prev.filter(p => p.id !== property.id)
            }
            if (prev.length >= 3) {
                return prev
            }
            return [...prev, property]
        })
    }, [])

    const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])
    const isComparing = useCallback((id: string) => compareList.some(p => p.id === id), [compareList])
    const clearCompare = useCallback(() => setCompareList([]), [])

    const contextValue = useMemo(() => ({
        favorites,
        compareList,
        toggleFavorite,
        toggleCompare,
        isFavorite,
        isComparing,
        clearCompare
    }), [favorites, compareList, toggleFavorite, toggleCompare, isFavorite, isComparing, clearCompare])

    return (
        <InteractionsContext.Provider value={contextValue}>
            <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.2s' }}>
                {children}
            </div>
        </InteractionsContext.Provider>
    )
}

export function useInteractions() {
    const context = useContext(InteractionsContext)
    if (context === undefined) {
        throw new Error('useInteractions must be used within an InteractionsProvider')
    }
    return context
}
