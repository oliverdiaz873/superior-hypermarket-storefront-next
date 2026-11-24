import { describe, expect, it } from '@jest/globals'
import { filterOffersByCategory, sortOffersByDiscount } from './useOfferFilters'
import type { OfferProduct } from '@/lib/api-client'

const buildOffer = (id: string, categoria: string, discountPercentage: number): OfferProduct => ({
  id,
  name: `Oferta ${id}`,
  description: '',
  url: `/product/${id}`,
  categoria,
  precio: 50,
  precioTexto: 'Precio: $50',
  imagen: '',
  oldPrice: 'RD$ 100',
  discountPercentage,
})

// Espejo del contrato real de GET /offers: `categoria` es el slug de la
// categoría RAÍZ (ApiOffer.categoryId), nunca el de subcategoría.
const offers: OfferProduct[] = [
  buildOffer('offer_alimentos_1', 'alimentos', 20),
  buildOffer('offer_alimentos_2', 'alimentos', 50),
  buildOffer('offer_tecnologia_1', 'tecnologia', 30),
]

describe('filterOffersByCategory', () => {
  it('devuelve todas las ofertas cuando la categoría es "all"', () => {
    expect(filterOffersByCategory(offers, 'all')).toEqual(offers)
  })

  it('filtra por categoría raíz comparando categoria directamente', () => {
    const result = filterOffersByCategory(offers, 'alimentos')
    expect(result.map((p) => p.id)).toEqual(['offer_alimentos_1', 'offer_alimentos_2'])
    expect(result.every((p) => p.categoria === 'alimentos')).toBe(true)
  })

  it('no incluye ofertas de otras categorías', () => {
    const result = filterOffersByCategory(offers, 'tecnologia')
    expect(result.map((p) => p.id)).toEqual(['offer_tecnologia_1'])
    expect(result.some((p) => p.categoria === 'alimentos')).toBe(false)
  })

  it('devuelve lista vacía para una categoría sin ofertas', () => {
    expect(filterOffersByCategory(offers, 'hogar')).toEqual([])
  })
})

describe('sortOffersByDiscount', () => {
  it('ordena por discountPercentage de mayor a menor', () => {
    const sorted = sortOffersByDiscount(filterOffersByCategory(offers, 'all'))
    expect(sorted.map((p) => p.discountPercentage)).toEqual([50, 30, 20])
  })
})
