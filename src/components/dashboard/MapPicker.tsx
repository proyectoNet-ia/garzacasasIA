'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Search, Locate, Layers, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface MapPickerProps {
    isOpen: boolean
    onClose: () => void
    initialLat?: number | null
    initialLng?: number | null
    defaultSearchText?: string
    onConfirm: (lat: number, lng: number) => void
}

export function MapPicker({
    isOpen,
    onClose,
    initialLat,
    initialLng,
    defaultSearchText = '',
    onConfirm
}: MapPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markerInstanceRef = useRef<any>(null)

    // Coordenadas actuales seleccionadas en el mapa
    const [currentLat, setCurrentLat] = useState<number>(initialLat || 20.3464)
    const [currentLng, setCurrentLng] = useState<number>(initialLng || -102.0358)
    const [searchQuery, setSearchQuery] = useState(defaultSearchText)
    const [isSearching, setIsSearching] = useState(false)
    const [isMapReady, setIsMapReady] = useState(false)
    const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets')
    const tileLayerRef = useRef<any>(null)

    // Cargar Leaflet dinámicamente sin paquetes npm
    useEffect(() => {
        if (!isOpen) return

        // 1. Cargar CSS si no existe
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link')
            link.id = 'leaflet-css'
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
        }

        // 2. Cargar JS si no existe
        const initLeaflet = () => {
            const L = (window as any).L
            if (!L || !mapContainerRef.current) return

            // Evitar doble inicialización
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }

            const startLat = initialLat && !isNaN(initialLat) ? initialLat : 20.3464
            const startLng = initialLng && !isNaN(initialLng) ? initialLng : -102.0358

            setCurrentLat(startLat)
            setCurrentLng(startLng)

            // Crear mapa
            const map = L.map(mapContainerRef.current, {
                center: [startLat, startLng],
                zoom: initialLat && initialLng ? 16 : 14,
                zoomControl: false
            })

            // Controles de zoom
            L.control.zoom({ position: 'bottomright' }).addTo(map)

            // Capa base
            const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
                maxZoom: 19
            })
            streetsLayer.addTo(map)
            tileLayerRef.current = streetsLayer

            // Marcador personalizado
            const icon = L.divIcon({
                className: 'custom-pin-marker',
                html: `
                    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                        <div style="position: absolute; width: 14px; height: 14px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3" fill="#ffffff"/>
                        </svg>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 34]
            })

            const marker = L.marker([startLat, startLng], {
                draggable: true,
                icon
            }).addTo(map)

            marker.bindTooltip('Arrastra el pin al inmueble', {
                permanent: true,
                direction: 'top',
                offset: [0, -32],
                className: 'font-sans text-xs font-bold px-2 py-1 bg-zinc-900 text-white rounded-lg shadow-md border-0'
            })

            // Evento arrastrar marcador
            marker.on('dragend', (e: any) => {
                const pos = e.target.getLatLng()
                setCurrentLat(parseFloat(pos.lat.toFixed(6)))
                setCurrentLng(parseFloat(pos.lng.toFixed(6)))
            })

            // Evento clic en el mapa
            map.on('click', (e: any) => {
                marker.setLatLng(e.latlng)
                setCurrentLat(parseFloat(e.latlng.lat.toFixed(6)))
                setCurrentLng(parseFloat(e.latlng.lng.toFixed(6)))
            })

            mapInstanceRef.current = map
            markerInstanceRef.current = marker
            setIsMapReady(true)

            // Forzar recálculo de tamaño
            setTimeout(() => map.invalidateSize(), 200)
        }

        if ((window as any).L) {
            initLeaflet()
        } else {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.async = true
            script.onload = initLeaflet
            document.body.appendChild(script)
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [isOpen])

    // Cambiar capa (Calles vs Satélite)
    const toggleMapLayer = () => {
        const L = (window as any).L
        if (!L || !mapInstanceRef.current) return

        const newLayer = mapLayer === 'streets' ? 'satellite' : 'streets'
        setMapLayer(newLayer)

        if (tileLayerRef.current) {
            mapInstanceRef.current.removeLayer(tileLayerRef.current)
        }

        if (newLayer === 'satellite') {
            tileLayerRef.current = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                { attribution: '&copy; Esri & Maxar', maxZoom: 19 }
            ).addTo(mapInstanceRef.current)
        } else {
            tileLayerRef.current = L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                { attribution: '&copy; OpenStreetMap', maxZoom: 19 }
            ).addTo(mapInstanceRef.current)
        }
    }

    // Buscar dirección dentro del modal
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            const res = await fetch(`/api/geo/geocode?q=${encodeURIComponent(searchQuery)}`)
            const data = await res.json()

            if (data.success && data.latitude && data.longitude) {
                setCurrentLat(data.latitude)
                setCurrentLng(data.longitude)

                if (mapInstanceRef.current && markerInstanceRef.current) {
                    mapInstanceRef.current.setView([data.latitude, data.longitude], 17)
                    markerInstanceRef.current.setLatLng([data.latitude, data.longitude])
                }
                toast.success('Ubicación encontrada en el mapa')
            } else {
                toast.error('No se encontró el punto. Intenta con otra referencia o mueve el mapa.')
            }
        } catch {
            toast.error('Error al buscar dirección')
        } finally {
            setIsSearching(false)
        }
    }

    // GPS del usuario
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error('Tu navegador no soporta geolocalización')
            return
        }

        const locateToast = toast.loading('Obteniendo tu ubicación actual...')
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = parseFloat(pos.coords.latitude.toFixed(6))
                const lng = parseFloat(pos.coords.longitude.toFixed(6))
                setCurrentLat(lat)
                setCurrentLng(lng)

                if (mapInstanceRef.current && markerInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 17)
                    markerInstanceRef.current.setLatLng([lat, lng])
                }
                toast.success('Ubicación GPS detectada', { id: locateToast })
            },
            (err) => {
                toast.error('No se pudo obtener la ubicación: ' + err.message, { id: locateToast })
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleConfirm = () => {
        onConfirm(currentLat, currentLng)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-zinc-900 leading-tight">
                                Selecciona la Ubicación en el Mapa
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium">
                                Haz clic en el mapa o arrastra el pin al techo del inmueble
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full h-9 w-9 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search Bar & Map Controls */}
                <div className="p-3 bg-white border-b border-zinc-100 flex flex-wrap items-center gap-2">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[240px] flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar calle, colonia o referencia..."
                                className="pl-9 h-10 bg-zinc-50 border-zinc-200 text-xs sm:text-sm rounded-xl focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSearching}
                            className="h-10 px-4 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold text-xs shrink-0"
                        >
                            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Buscar'}
                        </Button>
                    </form>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLocateMe}
                            className="h-10 text-xs font-bold gap-1.5 rounded-xl border-zinc-200 text-zinc-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                            title="Centrar en mi ubicación GPS"
                        >
                            <Locate className="h-4 w-4 text-blue-600" />
                            <span className="hidden sm:inline">Mi GPS</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={toggleMapLayer}
                            className="h-10 text-xs font-bold gap-1.5 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                            title="Alternar vista Satélite / Calles"
                        >
                            <Layers className="h-4 w-4" />
                            <span>{mapLayer === 'streets' ? 'Satélite' : 'Calles'}</span>
                        </Button>
                    </div>
                </div>

                {/* Map Container */}
                <div className="relative flex-1 w-full min-h-[380px] sm:min-h-[460px] bg-zinc-100">
                    <div ref={mapContainerRef} className="absolute inset-0 h-full w-full z-10" />

                    {/* Coordinates Readout Floating Pill */}
                    <div className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-zinc-200/80 flex items-center gap-2 text-xs font-mono font-bold text-zinc-800">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Lat: {currentLat}</span>
                        <span className="text-zinc-300">|</span>
                        <span>Lng: {currentLng}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-zinc-500 font-medium text-center sm:text-left">
                        Las coordenadas seleccionadas se sincronizarán directamente con el reporte de servicios INEGI.
                    </p>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 sm:flex-initial h-11 px-5 rounded-2xl font-bold text-zinc-600 hover:bg-zinc-200"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            className="flex-1 sm:flex-initial h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-blue-600/20"
                        >
                            <Check className="h-4 w-4" />
                            Confirmar Ubicación
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}
