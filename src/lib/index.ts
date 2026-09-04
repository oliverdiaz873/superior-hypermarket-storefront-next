/**
 * @fileoverview Barrel export para todas las utilidades del proyecto
 * 
 * Este archivo centraliza las exportaciones de todas las funciones utility,
 * permitiendo imports más limpios y centralizados:
 * 
 * @example
 * ```typescript
 * // Antes (ruta larga):
 * import { getAssetUrl } from '@/lib/assetUtils'
 * import { cleanPrice } from '@/lib/priceUtils'
 * 
 * // Después (desde este index):
 * import { getAssetUrl, cleanPrice } from '@/lib'
 * ```
 */

// Assets: Resolución dinámica de rutas de imágenes/fuentes
export { getAssetUrl } from './assetUtils'

// búsqueda: Normalización de texto para búsquedas sin acentos
export { normalizarTexto } from './searchUtils'

// Precios: Formateo y extracción de precios y unidades
export { cleanPrice, formatProductPrice, formatUnitLabel } from './priceUtils'

// Categorías: Nombres traducidos de categorías y subcategorías
export { getCategoryName, getSubcategoryName } from './categoryUtils'

// Constantes: Datos de configuración y contacto
export { CONTACT_EMAIL } from './constants'

// API backend: cliente HTTP tipado y resolución de imágenes remotas (F5.1)
export {
  getProducts,
  getProduct,
  getOffers,
  search,
  getCategories,
  fetchCategories,
  getAllCategoryProducts,
  fetchOffers,
  resolveApiImageUrl,
  mapApiProductToProduct,
  mapApiProductsToProducts,
  mapApiOfferToOfferProduct,
  mapApiCategoryToCategory,
  mapApiCategoriesToCategories,
} from './api-client'
export type {
  ApiProduct,
  ApiCategory,
  ApiOffer,
  ApiCollection,
  ApiEnvelope,
  ApiPagination,
  ApiPaginationParams,
  OfferProduct,
} from './api-client'
