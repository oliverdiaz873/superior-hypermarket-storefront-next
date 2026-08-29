// ─────────────────────────────────────────────────────────────────────────────
// Tipos del contrato de la API (backend real, ver docs/F5-CONTRACT.md)
// ─────────────────────────────────────────────────────────────────────────────

import type { Product } from '@/types/product'
import type { Category } from '@/types/category'

export type ApiLang = 'es' | 'en'

export interface ApiProduct {
  id: string
  sku: string
  name: string
  description: string
  price: number
  image: string | null
  categoryId: string
  subcategoryId?: string | null
  category: { name: string; slug: string }
  subcategory?: { name: string; slug: string } | null
  brandId?: string
  brand?: { name: string; slug: string }
  unit?: string
  unitQuantity?: number
  status: 'active' | 'inactive'
  isAvailable: boolean
  featured?: boolean
  createdAt: string
  updatedAt: string
  translations?: Record<'es' | 'en', { name?: string; description?: string }>
}

export interface ApiCategory {
  id: string
  name: string
  slug: string
  subcategories: {
    id: string
    name: string
    slug: string
  }[]
}

export interface ApiOffer {
  id: string
  name: string
  price: number
  originalPrice: number
  discountPrice: number
  discountPercentage: number
  image: string | null
  categoryId: string
  unit?: string
  unitQuantity?: number
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiCollection<T> {
  success?: boolean
  data: T[]
  pagination: ApiPagination
}

export interface ApiEnvelope<T> {
  success?: boolean
  data: T
}

export interface ApiPaginationParams {
  page?: number
  limit?: number
  q?: string
  category?: string
  categoryId?: string
  subcategoryId?: string
  brand?: string
  featured?: boolean
  lang?: ApiLang
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  status: 'pending' | 'read' | 'answered'
  createdAt: string
  updatedAt: string
}

export interface ApiContactPayload {
  name: string
  email: string
  phone?: string
  message: string
}

/**
 * Error de API con el código HTTP y el mensaje del backend (si existe).
 * Permite a la UI distinguir el 429 (rate limit) de otros fallos.
 */
export class ApiRequestError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api'

export const STORAGE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

// ─────────────────────────────────────────────────────────────────────────────
// Imágenes (decisión F5.0: resolver en el frontend, nunca tocar el backend)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resuelve la URL pública de una imagen de producto (contrato único normalizado).
 * - La API devuelve siempre una URL pública (`/uploads/...?v=` en dev,
 *   `https://cdn/...` en prod) o `null` — ver
 *   `superior-hypermarket-api/src/modules/products/presenters/product.presenter.ts`.
 * - URL absoluta (http/https/data:) y `/uploads/...` se usan tal cual
 *   (`/uploads/...` se hace absoluta con `STORAGE_PUBLIC_URL` para `next/image`).
 * - No se hace conversión legacy `products/... -> /uploads/...` en el cliente;
 *   esa compatibilidad vive solo en la API.
 * - `?v=` se conserva si viene en la respuesta; jamás se versiona en el cliente.
 */
export function resolveApiImageUrl(image?: string | null): string | null {
  if (!image) return null
  if (/^(https?:)?\/\//.test(image) || image.startsWith('data:')) {
    return image
  }
  if (image.startsWith('/uploads/')) return `${STORAGE_PUBLIC_URL}${image}`
  return image
}

/**
 * Mapper F5.2: ApiProduct (backend Express+MongoDB) → modelo Product del storefront Next.
 *
 * Decisiones F5.0:
 * - `price` → `precio`, `unit` → `unidad`, `unitQuantity` → `quantity`.
 * - `category.slug` → `categoria` (la identidad navegable es el slug).
 * - `url` y `precioTexto` se generan en el frontend (no vienen del backend).
 * - `image` se resuelve con el resolver de imágenes (nunca se toca el backend).
 * - `description` viene localizada del backend (`?lang=`).
 */
export function mapApiProductToProduct(api: ApiProduct): Product {
  const imagen = resolveApiImageUrl(api.image) ?? ''
  const unit = api.unit ?? ''
  const quantity = api.unitQuantity

  const precioTexto = `Precio: $${api.price.toLocaleString('en-US')}`

  return {
    id: api.id,
    name: api.name,
    description: api.description,
    url: `/product/${encodeURIComponent(api.id)}`,
    categoria: api.category.slug,
    subcategoryId: api.subcategoryId ?? null,
    precio: api.price,
    precioTexto,
    imagen,
    unidad: unit || undefined,
    quantity,
  }
}

export function mapApiProductsToProducts(apiProducts: ApiProduct[]): Product[] {
  return apiProducts
    .filter((p) => p.status === 'active' && p.isAvailable)
    .map(mapApiProductToProduct)
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper F5.4: ApiOffer (backend Express+MongoDB) → Product con badge de oferta
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Producto en oferta con la información comercial real del backend (F5.4).
 * `oldPrice` y `discountPercentage` provienen de la API; nunca se calculan aquí.
 */
export interface OfferProduct extends Product {
  oldPrice?: string
  discountPercentage?: number
}

/**
 * Mapper F5.4: ApiOffer → OfferProduct (modelo UI del storefront).
 *
 * Decisiones F5.0/F5.4:
 * - `discountPrice` → `precio` y `precioTexto` (única fuente: backend).
 * - `originalPrice` → `oldPrice` (string de display) y `discountPercentage` del
 *   backend tal cual, sin cálculos locales ni valores mock.
 * - `categoryId` → `categoria` (los mismos slugs que filtran las ofertas).
 * - `url` e `imagen` se resuelven en el frontend (igual que F5.2).
 */
export function mapApiOfferToOfferProduct(api: ApiOffer): OfferProduct {
  const imagen = resolveApiImageUrl(api.image) ?? ''
  const unit = api.unit ?? ''
  const quantity = api.unitQuantity

  const precioTexto = `Precio: $${api.discountPrice.toLocaleString('en-US')}`

  return {
    id: api.id,
    name: api.name,
    description: '',
    url: `/product/${encodeURIComponent(api.id)}`,
    categoria: api.categoryId,
    precio: api.discountPrice,
    precioTexto,
    imagen,
    unidad: unit || undefined,
    quantity,
    oldPrice: `RD$ ${api.originalPrice.toLocaleString('en-US')}`,
    discountPercentage: api.discountPercentage,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper F5.3: ApiCategory (backend Express+MongoDB) → modelo Category del storefront
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapper F5.3: ApiCategory → Category del storefront.
 *
 * Decisiones F5.3 (docs/F5-CONTRACT-AUDIT.md §10):
 * - `slug` es la única identidad navegable; el `id` del backend jamás se propaga.
 * - `href` se genera en el frontend: `/category/<slug>` (+ `#<slug>` por subcategoría).
 * - Los nombres traducibles se resuelven vía i18n en los componentes con fallback al `name` del API.
 *   (getCategoryName/getSubcategoryName usan la subkey `categories.<id>` / `categories.sub.<slug>`).
 */
export function mapApiCategoryToCategory(api: ApiCategory): Category {
  return {
    id: api.slug,
    name: api.name,
    href: `/category/${api.slug}`,
    subcategories: api.subcategories.map((sub) => ({
      name: sub.name,
      href: `/category/${api.slug}/${sub.slug}`,
    })),
  }
}

export function mapApiCategoriesToCategories(apiCategories: ApiCategory[]): Category[] {
  return apiCategories.map(mapApiCategoryToCategory)
}

// ─────────────────────────────────────────────────────────────────────────────
// Client HTTP (fetch nativo; sirve tanto en Server Components como en el cliente)
// ─────────────────────────────────────────────────────────────────────────────

export async function apiRequest<T>(
  path: string,
  params?: object,
  init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const fetchInit: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    ...(init?.next ? { next: init.next } : { cache: 'no-store' as const }),
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers as Record<string, string> | undefined) },
  }
  // Si se pasó next, aseguramos que no se envíe cache:'no-store' simultáneo
  if (init?.next && 'cache' in fetchInit) {
    // next.revalidate ya define la estrategia; eliminar cache para evitar conflicto
    delete (fetchInit as { cache?: string }).cache
  }

  const res = await fetch(url, fetchInit)

  if (!res.ok) {
    let message = ''
    try {
      const body = (await res.json()) as { message?: string } | null
      message = body?.message ?? ''
    } catch {
      /* cuerpo no-JSON: se usa el mensaje por defecto */
    }
    throw new ApiRequestError(res.status, message)
  }

  return (await res.json()) as T
}

export function getProducts(query: ApiPaginationParams = {}): Promise<ApiCollection<ApiProduct>> {
  const params: ApiPaginationParams = {
    page: query.page,
    limit: query.limit,
    q: query.q,
    category: query.category,
    categoryId: query.categoryId,
    subcategoryId: query.subcategoryId,
    brand: query.brand,
    featured: query.featured,
    lang: query.lang,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  }
  // Búsqueda por texto (q) es dinámica y no debe cachearse; resto sí puede reutilizar Data Cache
  const isSearchQuery = typeof params.q === 'string' && params.q.trim().length > 0
  if (isSearchQuery) {
    return apiRequest<ApiCollection<ApiProduct>>('/products', params)
  }
  const tags = ['products']
  if (params.category) tags.push(`products:category:${params.category}`)
  if (params.featured) tags.push('products:featured')
  return apiRequest<ApiCollection<ApiProduct>>('/products', params, {
    next: { revalidate: 60, tags },
  })
}

export function getProduct(id: string, lang?: ApiLang): Promise<ApiEnvelope<ApiProduct>> {
  return apiRequest<ApiEnvelope<ApiProduct>>(`/products/${encodeURIComponent(id)}`, { lang }, {
    next: { revalidate: 60, tags: ['products', `product:${id}`, `product:${id}:${lang ?? 'all'}`] },
  })
}

export function getOffers(lang?: ApiLang): Promise<ApiEnvelope<ApiOffer[]>> {
  return apiRequest<ApiEnvelope<ApiOffer[]>>('/offers', { lang }, {
    next: { revalidate: 60, tags: ['offers', `offers:${lang ?? 'all'}`] },
  })
}

/**
 * F5.4: obtiene las ofertas de la API y las mapea al modelo UI. Nunca lanza:
 * si el backend no responde devuelve una lista vacía para que la UI degrade a
 * "sin ofertas" en vez de romper el SSR.
 */
export async function fetchOffers(lang?: ApiLang): Promise<OfferProduct[]> {
  try {
    const { data } = await getOffers(lang)
    return data.map(mapApiOfferToOfferProduct)
  } catch {
    return []
  }
}

/**
 * E4.6: obtiene los productos destacados desde la API real
 * (GET /products?featured=true). Nunca lanza: si el backend no responde
 * devuelve una lista vacía para que la Home degrade a "sin destacados" en
 * vez de romper el SSR. Sin IDs hardcodeados en el frontend.
 */
export async function fetchFeaturedProducts(lang?: ApiLang): Promise<Product[]> {
  try {
    const { data } = await getProducts({ featured: true, limit: 100, lang })
    return mapApiProductsToProducts(data)
  } catch {
    return []
  }
}

export function search(
  query: Pick<ApiPaginationParams, 'q' | 'category'>,
  lang?: ApiLang
): Promise<ApiEnvelope<ApiProduct[]>> {
  return apiRequest<ApiEnvelope<ApiProduct[]>>('/search', {
    q: query.q,
    category: query.category,
    lang,
  })
}

export function getCategories(): Promise<ApiEnvelope<ApiCategory[]>> {
  return apiRequest<ApiEnvelope<ApiCategory[]>>('/categories', undefined, {
    next: { revalidate: 300, tags: ['categories'] },
  })
}

/**
 * E4.5: envía un mensaje de contacto (POST /api/contact). Lanza `ApiRequestError`
 * con el mensaje del backend en 400 y el código 429 en rate limit para que la UI
 * muestre la traducción adecuada. Nunca simula ni cachea: persiste en MongoDB.
 */
export async function sendContactMessage(payload: ApiContactPayload): Promise<ApiContactMessage> {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = ''
    try {
      const body = (await res.json()) as { message?: string } | null
      message = body?.message ?? ''
    } catch {
      /* cuerpo no-JSON: se usa el mensaje por defecto */
    }
    throw new ApiRequestError(res.status, message)
  }

  const envelope = (await res.json()) as ApiEnvelope<ApiContactMessage>
  return envelope.data
}

/**
 * F5.3: obtiene categorías de la API y las mapea al modelo del storefront.
 * Nunca lanza: si el backend no responde devuelve una lista vacía para que la
 * UI degrade a "sin navegación de categorías" en vez de romper el SSR.
 * El error se loggea para observabilidad SSR (no se silencia).
 * Data Cache (revalidate 300s, tag categories) + fetch memoization
 * deduplican layout + generateMetadata + page a 1 request.
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data } = await getCategories()
    return mapApiCategoriesToCategories(data)
  } catch (error) {
    console.error('[fetchCategories] failed to fetch categories from', `${API_BASE_URL}/categories`, error)
    return []
  }
}

/**
 * F5.3: obtiene todos los productos de una categoría respetando la paginación
 * del backend (GET /products?category=<slug>&page=N&limit=N). Usa el `total`
 * real del primer page para calcular los pages restantes.
 */
export async function getAllCategoryProducts(category: string, limit = 100, lang?: ApiLang, subcategoryId?: string): Promise<ApiProduct[]> {
  const first = await getProducts({ category, subcategoryId, page: 1, limit, lang })
  const total = first.pagination?.total ?? first.data.length
  const pages = Math.max(1, Math.ceil(total / limit))
  if (pages <= 1) return first.data

  const remaining = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      getProducts({ category, subcategoryId, page: i + 2, limit, lang }).then((page) => page.data)
    )
  )
  return [...first.data, ...remaining.flat()]
}
