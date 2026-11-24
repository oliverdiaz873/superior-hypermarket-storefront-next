import { useState, useMemo } from 'react'
import type { Category } from '@/types/category'
import type { OfferProduct } from '@/lib/api-client'

interface UseOfferFiltersReturn {
    offerProducts: OfferProduct[]
    filteredProducts: OfferProduct[]
    sortedProducts: OfferProduct[]
    selectedCategory: string
    onCategoryChange: (categoryId: string) => void
}

/**
 * Filtra ofertas por categoría. `OfferProduct.categoria` es el slug de la
 * categoría raíz (`ApiOffer.categoryId`); la selección de la UI también es
 * el slug raíz (`Category.id`), por lo que la comparación es directa.
 */
export const filterOffersByCategory = (offers: OfferProduct[], selectedCategory: string): OfferProduct[] => {
    if (selectedCategory === 'all') return offers
    return offers.filter((p) => p.categoria === selectedCategory)
}

/** Ordena por porcentaje de descuento (mayor a menor). */
export const sortOffersByDiscount = (offers: OfferProduct[]): OfferProduct[] =>
    [...offers].sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0))

/**
 * Hook para gestionar la lógica de filtrado y ordenamiento de ofertas.
 * F5.4: la fuente es la oferta real del backend (`OfferProduct[]` desde
 * /offers), nunca un catálogo mock. Encapsula:
 * - Filtrado por categoría raíz (el contrato /offers expone `categoryId` raíz)
 * - Ordenamiento por descuento (mayor a menor)
 *
 * @returns Objeto con productos filtrados, estado de categoría seleccionada y callbacks
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `categories` se conserva en la firma por compatibilidad con los callers
export const useOfferFilters = (offers: OfferProduct[], categories: Category[]): UseOfferFiltersReturn => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    const offerProducts = offers

    // Lógica de filtrado reactiva
    const filteredProducts: OfferProduct[] = useMemo(
        () => filterOffersByCategory(offerProducts, selectedCategory),
        [offerProducts, selectedCategory]
    )

    // Ordenamiento final por porcentaje de descuento
    const sortedProducts: OfferProduct[] = useMemo(
        () => sortOffersByDiscount(filteredProducts),
        [filteredProducts]
    )

    return {
        offerProducts,
        filteredProducts,
        sortedProducts,
        selectedCategory,
        onCategoryChange: setSelectedCategory,
    }
}
