// ============================================================
// TIPOS — API del INEGI
// DENUE: Directorio Estadístico Nacional de Unidades Económicas
// Indicadores: Banco de Indicadores INEGI
// ============================================================

// --- DENUE ---

export interface DenueEstablecimiento {
    id: string
    nom_estab: string          // Nombre del establecimiento
    raz_social: string         // Razón social
    codigo_act: string         // Código de actividad SCIAN
    nombre_act: string         // Nombre de la actividad
    per_ocu: string            // Personal ocupado (rango)
    tipo_vial: string          // Tipo de vialidad
    nom_vial: string           // Nombre de la vialidad
    tipo_v_e_1: string
    nom_v_e_1: string
    numero_ext: string
    letra_ext: string
    colonia: string
    municipio: string
    entidad: string
    cp: string
    telefono: string
    correoelec: string
    www: string
    tipoUniEco: string         // Tipo de unidad económica
    latitud: string
    longitud: string
    fecha_alta: string
}

export interface DenueRespuesta {
    nombre_api: string
    url_api: string
    licencia: string
    datos: DenueEstablecimiento[]
}

export interface ServiciosCercanos {
    escuelas: number
    hospitales: number
    clinicas: number
    farmacias: number
    bancos: number
    supermercados: number
    restaurantes: number
    gasolineras: number
    gimnasios: number
    parques: number
    total: number
    detalle: DenueEstablecimiento[]
}

// --- Indicadores ---

export interface IndicadorObservacion {
    PERIODO: string            // e.g. "2026/01"
    OBS_VALUE: string          // Valor numérico como string
}

export interface IndicadorSerie {
    INDICADOR: string
    UNIDAD_MEDIDA: string
    MULTIPLICADOR: string
    OBSERVACIONES: IndicadorObservacion[]
}

export interface IndicadoresRespuesta {
    Series: IndicadorSerie[]
}

// --- Índice de precios de vivienda (SHF-INEGI) ---

export interface PrecioZona {
    municipio: string
    clave_municipio: string    // e.g. "16053" (Morelia, Michoacán)
    estado: string
    precio_m2: number          // Precio promedio por m²
    variacion_anual: number    // Porcentaje de crecimiento anual
    tipo: 'casa' | 'departamento' | 'promedio'
    periodo: string            // e.g. "2025-Q3"
    fuente: 'SHF-INEGI'
}

// --- Score de zona calculado ---

export interface ZonaScore {
    score: number              // 0-100
    nivel: 'bajo' | 'medio' | 'alto' | 'premium'
    color: 'red' | 'yellow' | 'green' | 'blue'
    factores: {
        servicios: number        // Score 0-25
        plusvalia: number        // Score 0-25
        densidad: number         // Score 0-25
        precio_relativo: number  // Score 0-25
    }
    resumen: string            // Texto corto descriptivo
}

// --- Caché interna ---

export interface InegicacheEntry {
    cache_key: string
    data: unknown
    expires_at: string
}
