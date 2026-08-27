import { describe, expect, it } from '@jest/globals'
import { toUiCartItem, uiCartFromServer, localItemsToMergePayload } from './cart-mapper'
import type { CartItem, ServerCart, ServerCartItem } from './cart-types'

const serverItem: ServerCartItem = {
    productId: 'prod_a',
    name: 'Arroz 1kg',
    price: 80,
    unitPrice: 80,
    originalPrice: 100,
    discountPercentage: 20,
    isOffer: true,
    quantity: 5,
    image: 'https://example.com/arroz.png',
    unit: 'kg',
    unitQuantity: 1,
}

describe('toUiCartItem', () => {
    it('mapea los campos del backend al modelo visual', () => {
        expect(toUiCartItem(serverItem)).toEqual({
            id: 'prod_a',
            name: 'Arroz 1kg',
            precio: 80,
            img: 'https://example.com/arroz.png',
            unidad: 'kg',
            unitLabel: 'kg',
            cantidad: 5,
            isOffer: true,
            oldPrice: '100',
            discountPercentage: 20,
            unitQuantity: 1,
        })
    })

    it('usa el snapshot server-side: precio = unitPrice (no recalcula nada localmente)', () => {
        const item = toUiCartItem({ ...serverItem, unitPrice: 80, originalPrice: undefined, price: 80, isOffer: false })
        expect(item.precio).toBe(80)
        expect(item.oldPrice).toBeUndefined()
        expect(item.isOffer).toBe(false)
    })

    it('retorna la URL pública tal cual (API ya normaliza a /uploads/)', () => {
        const item = toUiCartItem({ ...serverItem, image: 'products/bebidas/coca-cola.avif' })
        expect(item.img).toBe('products/bebidas/coca-cola.avif')
    })

    it('default de unitLabel a "unidad" sin unidad explícita', () => {
        const item = toUiCartItem({ ...serverItem, unit: undefined })
        expect(item.unitLabel).toBe('unidad')
    })
})

describe('uiCartFromServer', () => {
    it('mapea el CartResponse completo', () => {
        const cart: ServerCart = {
            items: [serverItem, { ...serverItem, productId: 'prod_b', isOffer: false, originalPrice: undefined, quantity: 2, unitPrice: 89.5 }],
            totalItems: 7,
            subtotal: 579,
        }
        const ui: CartItem[] = uiCartFromServer(cart)
        expect(ui).toHaveLength(2)
        expect(ui[0]).toMatchObject({ id: 'prod_a', cantidad: 5, precio: 80 })
        expect(ui[1]).toMatchObject({ id: 'prod_b', cantidad: 2, precio: 89.5, isOffer: false, oldPrice: undefined })
    })
})

describe('localItemsToMergePayload', () => {
    it('envía SOLO { productId, quantity } descartando precios/ofertas locales', () => {
        const local: CartItem[] = [
            {
                id: 'prod_a',
                name: 'Arroz 1kg',
                precio: 60,
                precioTexto: 'Precio: $60.00 / kg',
                img: 'x',
                unitLabel: 'kg',
                cantidad: 3,
                isOffer: true,
                oldPrice: '$100',
                discountPercentage: 40,
            },
        ]
        expect(localItemsToMergePayload(local)).toEqual([{ productId: 'prod_a', quantity: 3 }])
    })

    it('no incluye ningún precio local en el payload', () => {
        const payload = localItemsToMergePayload([{ id: 'x', name: 'N', precio: 5, img: 'i', unitLabel: 'u', cantidad: 1 }])
        expect(JSON.stringify(payload)).not.toMatch(/[pP]recio|[pP]rice|oldPrice|discount/)
    })
})