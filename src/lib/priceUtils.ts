/**
 * @fileoverview Utilidades para procesamiento de precios y unidades
 * 
 * Este módulo centraliza la lógica de formateo de precios y extracción
 * de unidades de medida para evitar duplicación entre ProductCard y CartItem.
 * 
 * Usadas en:
 * - ProductCard: Mostrar precios en grid de productos
 * - CartItem: Mostrar precios en carrito
 * - ProductDetails: Detalles del producto
 */

import { Product } from '@/types/product'

/**
 * Extrae el precio numérico limpio de una cadena de texto formateado
 * 
 * Función de transformación que:
 * 1. Quita el prefijo "Precio: "
 * 2. Extrae el formato monetario ($1,200.50)
 * 3. Retorna solo el número formateado
 * 
 * @param text - Texto con formato (ej: "Precio: $1,200.50 / kg")
 * @returns Precio limpio (ej: "$1,200.50")
 * 
 * @example
 * ```typescript
 * cleanPrice("Precio: $2,500.00") // "$2,500.00"
 * cleanPrice("$1,200.50 / unidad") // "$1,200.50"
 * ```
 * 
 * Beneficio: Permite mostrar precios consistentemente en toda la app
 */
export const cleanPrice = (text: string): string => {
    // Remove common labels like "Precio: " or "Price: " (case insensitive)
    const cleaned = text.replace(/^[a-z]+:\s*/i, '').trim()
    const match = cleaned.match(/(\$?\d+(?:,\d+)?(?:\.\d+)?)/)
    return match ? match[1] : cleaned
}

// Unidades que SÍ pluralizan (contables)
const COUNTABLE_UNITS = new Set([
    'unidad',
    'unit',
    'litro',
    'liters',
    'paquete',
    'pack',
    'caja',
    'box',
    'botella',
    'bottle',
    'lata',
    'can',
])

// Unidades que NO pluralizan (peso/volumen)
const NON_COUNTABLE_UNITS = new Set([
    'kg',
    'g',
    'lb',
    'oz',
    'ml',
    'l',
])

/**
 * Formatea la etiqueta de unidad con cantidad y pluralización correcta.
 * 
 * Reglas:
 * - Sin unidad → ''
 * - Cantidad === 1 → solo unidad (singular)
 * - Cantidad !== 1 → cantidad + unidad (plural si es contable, sin cambios si no contable)
 * 
 * @param product - Product con unidad y quantity
 * @param locale - Locale para determinar pluralización ('es' | 'en')
 * @returns Etiqueta formateada (ej: "unidad", "2 unidades", "kg", "2 kg", "0.5 kg")
 */
export function formatUnitLabel(product: Product, locale: 'es' | 'en' = 'es'): string {
    const unit = product.unidad?.trim().toLowerCase()
    const quantity = product.quantity
    
    if (!unit || quantity == null) return ''
    
    // Cantidad 1 → solo unidad (singular)
    if (quantity === 1) {
        return unit
    }
    
    // Cantidad !== 1 → cantidad + unidad
    const qtyStr = String(quantity)
    
    // Unidades contables → pluralizar
    if (COUNTABLE_UNITS.has(unit)) {
        const plural = pluralizeUnit(unit, locale)
        return `${qtyStr} ${plural}`
    }
    
    // Unidades no contables → no pluralizar
    if (NON_COUNTABLE_UNITS.has(unit)) {
        return `${qtyStr} ${unit}`
    }
    
    // Fallback: tratar como contable si no está en ninguna lista
    const plural = pluralizeUnit(unit, locale)
    return `${qtyStr} ${plural}`
}

/**
 * Pluraliza una unidad según el locale.
 * Reglas simples para unidades conocidas; fallback genérico.
 */
function pluralizeUnit(unit: string, locale: 'es' | 'en'): string {
    // Mapeo explícito para unidades con plural irregular
    const irregularPlurals: Record<string, Record<'es' | 'en', string>> = {
        'unidad': { es: 'unidades', en: 'units' },
        'unit': { es: 'unidades', en: 'units' },
        'litro': { es: 'litros', en: 'liters' },
        'liters': { es: 'litros', en: 'liters' },
    }
    
    if (irregularPlurals[unit]) {
        return irregularPlurals[unit][locale]
    }
    
    // Reglas genéricas simples
    if (locale === 'es') {
        if (unit.endsWith('z')) return unit.slice(0, -1) + 'ces'  // lápiz → lápices
        if (/[aeiou]s$/.test(unit)) return unit  // crisis → crisis (invariable)
        if (unit.endsWith('s')) return unit  // ya termina en s
        return unit + 's'
    } else {
        // Inglés simple
        if (unit.endsWith('y') && !/[aeiou]y$/.test(unit)) return unit.slice(0, -1) + 'ies'
        if (/[sxz]$/.test(unit) || unit.endsWith('ch') || unit.endsWith('sh')) return unit + 'es'
        return unit + 's'
    }
}

interface FormatPriceOptions {
    pricePrefix?: string
    translatedUnit?: string
    locale?: 'es' | 'en'
}

/**
 * Construye una etiqueta de precio localizada para la UI.
 * 
 * Fuente única de verdad para presentar precio + unidad.
 * 
 * @param product - Product con precio, unidad y quantity
 * @param options - Opciones de formato
 * @returns String formateado (ej: "Precio: $100 / 2 unidades", "Precio: $100 / kg")
 */
export const formatProductPrice = (
    product: Product,
    { pricePrefix = 'Precio: ', translatedUnit, locale = 'es' }: FormatPriceOptions = {}
): string => {
    const price = `$${product.precio.toLocaleString()}`
    
    // Si ya nos pasan la unidad traducida (desde useProductTranslation), usarla
    if (translatedUnit) {
        return `${pricePrefix}${price} / ${translatedUnit}`
    }
    
    // Usar formatUnitLabel como fuente de verdad para decidir si hay unidad
    const unitLabel = formatUnitLabel(product, locale)
    
    if (!unitLabel) {
        return `${pricePrefix}${price}`
    }
    
    return `${pricePrefix}${price} / ${unitLabel}`
}
