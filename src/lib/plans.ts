export const UNLIMITED_LIMIT = 999999

export function isUnlimitedLimit(value?: number | null): boolean {
    return Number(value ?? 0) >= UNLIMITED_LIMIT
}

export function formatPropertiesBullet(limit: number): string {
    if (isUnlimitedLimit(limit)) return 'Propiedades ilimitadas'
    if (limit === 1) return 'Hasta 1 propiedad'
    return `Hasta ${limit} propiedades`
}

export function formatImagesBullet(limit: number): string {
    if (isUnlimitedLimit(limit)) return 'Imágenes ilimitadas por propiedad'
    if (limit === 1) return '1 imagen por propiedad'
    return `${limit} imágenes por propiedad`
}

const PROPERTY_LIMIT_BULLET_REGEX =
    /^(?:hasta\s+)?\d+\s+propiedad(?:es)?(?:\s+activas?)?$|^propiedades(?:\s+activas)?\s+ilimitadas$/i

const IMAGE_LIMIT_BULLET_REGEX =
    /^(?:hasta\s+)?\d+\s+(?:im[aá]gen(?:es)?|fotos?)(?:\s+por\s+propiedad)?$|^(?:im[aá]genes|fotos)\s+ilimitadas(?:\s+por\s+propiedad)?$/i

export function normalizePlanFeatures(features: unknown): string[] {
    if (Array.isArray(features)) {
        return features.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    }
    if (features && typeof features === 'object') {
        return Object.values(features).filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0
        )
    }
    return []
}

/**
 * Sincroniza las viñetas de cupo de propiedades e imágenes con los límites reales
 * configurados en Admin (/admin/packages → public.subscriptions_config).
 */
export function syncFeatureBulletsWithLimits(
    rawFeatures: unknown,
    propertiesLimit?: number | null,
    imagesPerProperty?: number | null,
    options: { ensureBullets?: boolean } = {}
): string[] {
    const features = normalizePlanFeatures(rawFeatures)
    const hasValidPropLimit = typeof propertiesLimit === 'number' && !Number.isNaN(propertiesLimit) && propertiesLimit > 0
    const hasValidImgLimit = typeof imagesPerProperty === 'number' && !Number.isNaN(imagesPerProperty) && imagesPerProperty > 0

    let matchedProp = false
    let matchedImg = false

    const synced = features.map((feature) => {
        const trimmed = feature.trim()
        if (hasValidPropLimit && PROPERTY_LIMIT_BULLET_REGEX.test(trimmed)) {
            matchedProp = true
            return formatPropertiesBullet(propertiesLimit!)
        }
        if (hasValidImgLimit && IMAGE_LIMIT_BULLET_REGEX.test(trimmed)) {
            matchedImg = true
            return formatImagesBullet(imagesPerProperty!)
        }
        return feature
    })

    if (options.ensureBullets) {
        const additions: string[] = []
        if (hasValidPropLimit && !matchedProp) {
            additions.push(formatPropertiesBullet(propertiesLimit!))
        }
        if (hasValidImgLimit && !matchedImg) {
            additions.push(formatImagesBullet(imagesPerProperty!))
        }
        if (additions.length > 0) {
            return [...additions, ...synced]
        }
    }

    return synced
}

/**
 * Detecta si alguna viñeta de propiedades o imágenes escrita manualmente no coincide
 * con los límites técnicos configurados para el paquete.
 */
export function hasPlanBulletMismatch(
    rawFeatures: unknown,
    propertiesLimit?: number | null,
    imagesPerProperty?: number | null
): boolean {
    const features = normalizePlanFeatures(rawFeatures)
    const synced = syncFeatureBulletsWithLimits(features, propertiesLimit, imagesPerProperty)
    if (features.length !== synced.length) return true
    return features.some((item, idx) => item.trim() !== synced[idx].trim())
}
