import locationsData from './mexico-locations.json'

// Forzar el tipado del JSON para permitir acceso por string
const locations = locationsData as Record<string, string[]>

export interface Estado {
    id: string
    nombre: string
    jsonKey: string
}

export interface Municipio {
    id: string
    nombre: string
    estado_id: string
}

// Mapeo de IDs de INEGI a las llaves del JSON local
export const ESTADOS: Estado[] = [
    { id: '16', nombre: 'Michoacán', jsonKey: 'Michoacan' },
    { id: '19', nombre: 'Nuevo León', jsonKey: 'Nuevo Leon' },
    { id: '09', nombre: 'Ciudad de México', jsonKey: 'Ciudad de Mexico' },
    { id: '14', nombre: 'Jalisco', jsonKey: 'Jalisco' },
    { id: '15', nombre: 'Estado de México', jsonKey: 'Estado de Mexico' },
    { id: '24', nombre: 'San Luis Potosí', jsonKey: 'San Luis Potosi' },
    { id: '25', nombre: 'Sinaloa', jsonKey: 'Sinaloa' },
    { id: '26', nombre: 'Sonora', jsonKey: 'Sonora' },
    { id: '27', nombre: 'Tabasco', jsonKey: 'Tabasco' },
    { id: '28', nombre: 'Tamaulipas', jsonKey: 'Tamaulipas' },
    { id: '01', nombre: 'Aguascalientes', jsonKey: 'Aguascalientes' },
    { id: '02', nombre: 'Baja California', jsonKey: 'Baja California' },
    { id: '03', nombre: 'Baja California Sur', jsonKey: 'Baja California Sur' },
    { id: '04', nombre: 'Campeche', jsonKey: 'Campeche' },
    { id: '05', nombre: 'Coahuila', jsonKey: 'Coahuila' },
    { id: '06', nombre: 'Colima', jsonKey: 'Colima' },
    { id: '07', nombre: 'Chiapas', jsonKey: 'Chiapas' },
    { id: '08', nombre: 'Chihuahua', jsonKey: 'Chihuahua' },
    { id: '10', nombre: 'Durango', jsonKey: 'Durango' },
    { id: '11', nombre: 'Guanajuato', jsonKey: 'Guanajuato' },
    { id: '12', nombre: 'Guerrero', jsonKey: 'Guerrero' },
    { id: '13', nombre: 'Hidalgo', jsonKey: 'Hidalgo' },
    { id: '17', nombre: 'Morelos', jsonKey: 'Morelos' },
    { id: '18', nombre: 'Nayarit', jsonKey: 'Nayarit' },
    { id: '20', nombre: 'Oaxaca', jsonKey: 'Oaxaca' },
    { id: '21', nombre: 'Puebla', jsonKey: 'Puebla' },
    { id: '22', nombre: 'Querétaro', jsonKey: 'Queretaro' },
    { id: '23', nombre: 'Quintana Roo', jsonKey: 'Quintana Roo' },
    { id: '29', nombre: 'Tlaxcala', jsonKey: 'Tlaxcala' },
    { id: '30', nombre: 'Veracruz', jsonKey: 'Veracruz' },
    { id: '31', nombre: 'Yucatán', jsonKey: 'Yucatan' },
    { id: '32', nombre: 'Zacatecas', jsonKey: 'Zacatecas' },
].sort((a, b) => a.nombre.localeCompare(b.nombre))

/**
 * Obtiene los municipios de un estado desde el JSON local
 */
export function getMunicipiosPorEstado(estadoId: string): Municipio[] {
    const estado = ESTADOS.find(e => e.id === estadoId)
    if (!estado) return []

    const lista = locations[estado.jsonKey] || []
    return lista.map((nombre: string, index: number) => ({
        id: `${estadoId}${index.toString().padStart(3, '0')}`, // Generamos un ID local determinista
        nombre,
        estado_id: estadoId
    }))
}

// Mantenemos esta variable para compatibilidad, pero ahora es dinámica
export const MUNICIPIOS: Municipio[] = []
