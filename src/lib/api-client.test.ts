import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals'
import {
  getProducts,
  getProduct,
  getAllCategoryProducts,
  fetchFeaturedProducts,
  mapApiProductsToProducts,
  sendContactMessage,
  ApiRequestError,
  apiRequest,
} from './api-client'
import type { ApiProduct } from './api-client'

const makeApiProduct = (overrides: Partial<ApiProduct> = {}): ApiProduct => ({
  id: 'prod_destacado',
  sku: 'SKU-1',
  name: 'Destacado',
  description: '',
  price: 100,
  image: null,
  categoryId: 'cat_granos',
  category: { name: 'Granos', slug: 'granos' },
  status: 'active',
  isAvailable: true,
  featured: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('api-client · featured (E4.6)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('getProducts envía ?featured=true a /products', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [], pagination: { page: 1, limit: 100, total: 0, pages: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await getProducts({ featured: true, limit: 100 })

    const [url] = mockFetch.mock.calls[0] as [URL]
    expect(url.href).toContain('/api/products')
    expect(url.searchParams.get('featured')).toBe('true')
    expect(url.searchParams.get('limit')).toBe('100')
  })

  it('getProducts propaga ?lang= cuando se indica', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [], pagination: { page: 1, limit: 100, total: 0, pages: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await getProducts({ featured: true, limit: 100, lang: 'en' })

    const [url] = mockFetch.mock.calls[0] as [URL]
    expect(url.searchParams.get('lang')).toBe('en')
  })

  it('fetchFeaturedProducts propaga ?lang= hacia /products', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [makeApiProduct()],
          pagination: { page: 1, limit: 100, total: 1, pages: 1 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )

    await fetchFeaturedProducts('en')

    const [url] = mockFetch.mock.calls[0] as [URL]
    expect(url.href).toContain('/api/products')
    expect(url.searchParams.get('featured')).toBe('true')
    expect(url.searchParams.get('lang')).toBe('en')
  })

  it('fetchFeaturedProducts devuelve solo productos activos y disponibles mapeados', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            makeApiProduct(),
            makeApiProduct({ id: 'oculto', featured: true, status: 'inactive', isAvailable: false }),
          ],
          pagination: { page: 1, limit: 100, total: 1, pages: 1 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const featured = await fetchFeaturedProducts()

    expect(featured).toHaveLength(1)
    expect(featured[0].id).toBe('prod_destacado')
    expect(featured[0].categoria).toBe('granos')
  })

  it('fetchFeaturedProducts degrada a [] cuando la API falla (nunca lanza)', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValue(new Error('network down'))

    await expect(fetchFeaturedProducts()).resolves.toEqual([])
  })

  it('mapApiProductsToProducts respeta el gate activo/disponible', () => {
    const mapped = mapApiProductsToProducts([
      makeApiProduct(),
      makeApiProduct({ id: 'a', isAvailable: false }),
      makeApiProduct({ id: 'b', status: 'inactive' }),
    ])
    expect(mapped.map((p) => p.id)).toEqual(['prod_destacado'])
  })
})

describe('api-client · product detail & category (E6.2.1 lang)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('getProduct envía ?lang=en a /products/:id cuando se indica', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: makeApiProduct() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await getProduct('prod_destacado', 'en')

    const [url] = mockFetch.mock.calls[0] as [URL]
    expect(url.href).toContain('/api/products/prod_destacado')
    expect(url.searchParams.get('lang')).toBe('en')
  })

  it('getProduct no añade ?lang cuando no se proporciona', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: makeApiProduct() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await getProduct('prod_destacado')

    const [url] = mockFetch.mock.calls[0] as [URL]
    expect(url.href).toContain('/api/products/prod_destacado')
    expect(url.searchParams.has('lang')).toBe(false)
  })

  it('getAllCategoryProducts propaga ?lang=en a /products', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [makeApiProduct()],
          pagination: { page: 1, limit: 100, total: 1, pages: 1 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const result = await getAllCategoryProducts('granos', 100, 'en')

    const [url] = mockFetch.mock.calls[0] as [URL]
    expect(url.href).toContain('/api/products')
    expect(url.searchParams.get('category')).toBe('granos')
    expect(url.searchParams.get('lang')).toBe('en')
    expect(result).toHaveLength(1)
  })

  it('getAllCategoryProducts no añade ?lang cuando no se proporciona', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: [makeApiProduct()],
          pagination: { page: 1, limit: 100, total: 1, pages: 1 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )

    await getAllCategoryProducts('granos')

    const [url] = mockFetch.mock.calls[0] as [URL]
    expect(url.href).toContain('/api/products')
    expect(url.searchParams.has('lang')).toBe(false)
  })
})

describe('api-client · offers detail bug (precio != discount)', () => {
  it('mapApiOfferToOfferProduct mapea discountPrice a precio y originalPrice a oldPrice', async () => {
    const { mapApiOfferToOfferProduct } = await import('./api-client')
    const offer = {
      id: '58c36965-2a7e-4652-a804-980759c90d2e',
      name: 'prueba',
      price: 100,
      originalPrice: 300,
      discountPrice: 100,
      discountPercentage: 67,
      image: null,
      categoryId: 'farmacia',
      unit: 'kg',
      unitQuantity: 1,
    }
    const mapped = mapApiOfferToOfferProduct(offer as never)
    expect(mapped.id).toBe('58c36965-2a7e-4652-a804-980759c90d2e')
    expect(mapped.precio).toBe(100)
    expect(mapped.precioTexto).toContain('$100')
    expect(mapped.oldPrice).toBe('RD$ 300')
    expect(mapped.discountPercentage).toBe(67)
  })

  it('enriquece producto con oferta sobrescribiendo precio y precioTexto (bug reproduction: product.price 300 != offer 100)', async () => {
    const { mapApiProductToProduct, mapApiOfferToOfferProduct } = await import('./api-client')
    const apiProduct = {
      id: '58c36965-2a7e-4652-a804-980759c90d2e',
      sku: '909078',
      name: 'prueba',
      description: 'pastillas',
      price: 300,
      image: null,
      categoryId: 'farmacia',
      category: { name: 'Farmacia', slug: 'farmacia' },
      status: 'active' as const,
      isAvailable: true,
      createdAt: '2026-08-28T19:13:32.555Z',
      updatedAt: '2026-08-28T19:13:38.581Z',
      unit: 'kg',
      unitQuantity: 1,
    }
    const apiOffer = {
      id: '58c36965-2a7e-4652-a804-980759c90d2e',
      name: 'prueba',
      price: 100,
      originalPrice: 300,
      discountPrice: 100,
      discountPercentage: 67,
      image: null,
      categoryId: 'farmacia',
      unit: 'kg',
      unitQuantity: 1,
    }
    const mappedProduct = mapApiProductToProduct(apiProduct as never)
    const mappedOffer = mapApiOfferToOfferProduct(apiOffer as never)
    // Simula la lógica corregida de product/[id]/page.tsx
    const offerMap = new Map([[mappedOffer.id, mappedOffer]])
    let enriched = { ...mappedProduct }
    const productOffer = offerMap.get(enriched.id)
    if (productOffer) {
      enriched = {
        ...enriched,
        precio: productOffer.precio,
        precioTexto: productOffer.precioTexto,
        oldPrice: productOffer.oldPrice,
        discountPercentage: productOffer.discountPercentage,
      }
    }
    expect(enriched.precio).toBe(100)
    expect(enriched.precioTexto).toContain('$100')
    expect(enriched.oldPrice).toBe('RD$ 300')
    expect(enriched.discountPercentage).toBe(67)
    // Sin la corrección, precio seguiría siendo 300 (bug)
    const buggy = { ...mappedProduct, oldPrice: mappedOffer.oldPrice, discountPercentage: mappedOffer.discountPercentage } as typeof enriched
    expect(buggy.precio).toBe(300)
    expect(buggy.precio).not.toBe(100)
  })
})

describe('api-client · contact (E4.5)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('sendContactMessage hace POST /api/contact con el payload mapeado y devuelve el mensaje persistido', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'cm_1',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            message: 'Consulta sobre un pedido',
            status: 'pending',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const result = await sendContactMessage({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      message: 'Consulta sobre un pedido',
    })

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/contact')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(
      JSON.stringify({ name: 'Juan Pérez', email: 'juan@example.com', message: 'Consulta sobre un pedido' })
    )
    expect(result.id).toBe('cm_1')
    expect(result.status).toBe('pending')
  })

  it('sendContactMessage lanza ApiRequestError con el mensaje del backend en 400', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, message: 'Message must be between 10 and 500 characters', statusCode: 400 }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    )

    await expect(
      sendContactMessage({ name: 'Juan', email: 'juan@example.com', message: 'corto' })
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 400,
      message: 'Message must be between 10 and 500 characters',
})
})

describe('api-client · apiRequest error handling', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('lanza ApiRequestError con status 404 cuando la API devuelve 404', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, message: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    )

    await expect(apiRequest('/products/nonexistent')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 404,
      message: 'Product not found',
    })

    const error = await apiRequest('/products/nonexistent').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).status).toBe(404)
  })

  it('lanza ApiRequestError con status 400 cuando la API devuelve 400', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, message: 'Invalid input' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const error = await apiRequest('/products').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).status).toBe(400)
    expect((error as ApiRequestError).message).toBe('Invalid input')
  })

  it('lanza ApiRequestError con status 500 cuando la API devuelve 500', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, message: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const error = await apiRequest('/products').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).status).toBe(500)
  })

  it('lanza ApiRequestError con mensaje vacío cuando el cuerpo no es JSON', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response('internal error', { status: 500 })
    )

    const error = await apiRequest('/products').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).status).toBe(500)
    expect((error as ApiRequestError).message).toBe('')
  })
})

  it('sendContactMessage expone status 429 para rate limit', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, message: 'Too many messages, please try again later', statusCode: 429, code: 'RATE_LIMITED' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const error = await sendContactMessage({
      name: 'Juan',
      email: 'juan@example.com',
      message: 'Mensaje lo suficientemente largo',
    }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).status).toBe(429)
  })

  it('sendContactMessage no lanza mensaje del backend si el cuerpo no es JSON', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue(
      new Response('internal error', { status: 500 })
    )

    const error = await sendContactMessage({
      name: 'Juan',
      email: 'juan@example.com',
      message: 'Mensaje lo suficientemente largo',
    }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).message).toBe('')
  })
})
