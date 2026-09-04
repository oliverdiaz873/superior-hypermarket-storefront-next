/**
 * Mapper Backend → UI (N2).
 *
 * El servidor es la fuente de verdad de cantidades, precios y ofertas (snapshot).
 * Este módulo solo transforma el `CartResponse` al modelo visual `CartItem`.
 * `localItemsToMergePayload` construye el payload del merge descartando cualquier
 * precio/oferta del lado local.
 */
import { resolveApiImageUrl } from '@/lib/api-client'
import type { CartItem, MergePayloadItem, ServerCart, ServerCartItem } from './cart-types'

/** Entrada de addToCart: todo menos cantidad/unitLabel (los decide el CartContext). */
export type CartItemInput = Omit<CartItem, 'cantidad' | 'unitLabel'>

/** Convierte un item del backend al modelo visual. */
export const toUiCartItem = (item: ServerCartItem): CartItem => ({
    id: item.productId,
    name: item.name,
    precio: item.unitPrice,
    img: resolveApiImageUrl(item.image) ?? '',
    unidad: item.unit,
    unitLabel: item.unit?.trim() || 'unidad',
    cantidad: item.quantity,
    isOffer: item.isOffer,
    oldPrice: item.originalPrice != null ? String(item.originalPrice) : undefined,
    discountPercentage: item.discountPercentage,
    unitQuantity: item.unitQuantity,
})

/** Convierte un CartResponse completo al listado visual. */
export const uiCartFromServer = (cart: ServerCart): CartItem[] => cart.items.map(toUiCartItem)

/**
 * Cálculo local y puro del porcentaje de descuento como fallback del
 * `discountPercentage` real del backend (F5.4). El precio final nunca se
 * recalcula de local: lo trae siempre el snapshot servidor.
 */
function discountFromPrices(price: number, oldPrice?: string): number | undefined {
    if (oldPrice == null) return undefined
    const numericOld = parseFloat(oldPrice.replace(/[^\d.-]/g, ''))
    if (isNaN(numericOld) || numericOld <= 0) return undefined
    return Math.round(((numericOld - price) / numericOld) * 100)
}

/** Construye el item visual para el update optimista (usa la entrada de la UI). */
export function createCartItem(product: CartItemInput): CartItem {
    const finalUnidad = product.unidad || (product.precioTexto ? product.precioTexto.split('/').pop()?.trim() : undefined)
    const discountPercentage = product.discountPercentage ?? discountFromPrices(product.precio, product.oldPrice)
    return {
        ...product,
        unidad: finalUnidad,
        unitLabel: finalUnidad || 'unidad',
        cantidad: 1,
        discountPercentage,
        unitQuantity: product.unitQuantity,
    }
}

/**
 * Payload de merge a partir de items locales. Solo { productId, quantity }:
 * el punto 6 (N2) exige que para precios/ofertas nunca se use el valor local.
 */
export const localItemsToMergePayload = (items: CartItem[]): MergePayloadItem[] =>
    items.map(({ id, cantidad }) => ({ productId: id, quantity: cantidad }))