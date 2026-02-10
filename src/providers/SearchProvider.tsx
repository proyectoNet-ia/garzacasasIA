'use client'

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react'

interface SearchFilters {
    location: string;
    type: string;
    priceRange: string;
}

interface SearchContextType {
    filters: SearchFilters;
    setFilters: (filters: SearchFilters) => void;
    updateFilter: (key: keyof SearchFilters, value: string) => void;
    clearFilters: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<SearchFilters>({
        location: '',
        type: '',
        priceRange: ''
    })

    const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    const clearFilters = useCallback(() => {
        setFilters({
            location: '',
            type: '',
            priceRange: ''
        })
    }, [])

    const contextValue = useMemo(() => ({
        filters,
        setFilters,
        updateFilter,
        clearFilters
    }), [filters, updateFilter, clearFilters])

    return (
        <SearchContext.Provider value={contextValue}>
            {children}
        </SearchContext.Provider>
    )
}

export function useSearch() {
    const context = useContext(SearchContext)
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider')
    }
    return context
}
