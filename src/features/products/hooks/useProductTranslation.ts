import { useTranslations, useLocale } from 'next-intl'
import { Product } from '@/types/product'
import { ProductPageData } from '@/services/catalog/productPageData'
import { formatProductPrice, formatUnitLabel } from '@/lib/priceUtils'

/**
 * useProductTranslation - Hook para gestionar la internacionalizacion de productos.
 *
 * F5.2: el backend ya localiza `name` y `description` con `?lang=`. Este hook
 * mantiene la compatibilidad con el patrón "Overlay & Fallback" para datos mock:
 * 1. Si existe clave en i18n 'products.{id}.name' → úsala (override mock).
 * 2. Sino → usa `product.name` (localizado por API).
 * Igual para description: i18n → `product.description` (API) → pageData → fallback.
 */
export const useProductTranslation = (product?: Product, pageData?: ProductPageData) => {
    const tProducts = useTranslations('products');
    const tCommon = useTranslations('common');
    const locale = useLocale() as 'es' | 'en';
    const productId = product?.id
    const fallbackName = product?.name ?? tCommon('product.not_found')

    const nameKey = `${productId}.name`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalName = productId && tProducts.has(nameKey as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? tProducts(nameKey as any)
        : fallbackName

    const descKey = `${productId}.description`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalDescription = productId && tProducts.has(descKey as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? tProducts(descKey as any)
        : (product?.description ?? pageData?.description ?? `Disfruta de la mejor calidad con nuestro ${fallbackName}.`)

    const specsKey = `${productId}.specs`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalSpecs = productId && tProducts.has(specsKey as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (tProducts.raw(specsKey as any) as string[])
        : (pageData?.detalles ?? [])

    // Usar formatUnitLabel centralizado en place de lógica inline
    const displayUnit = product ? formatUnitLabel(product, locale) : ''

    return {
        name: finalName,
        description: finalDescription,
        specs: finalSpecs,
        priceText: product
            ? formatProductPrice(product, {
                pricePrefix: tCommon('product.price_prefix'),
                locale,
            })
            : '',
        labels: {
            viewDetails: tCommon('product.view_details', { name: finalName }),
            addToCart: tCommon('product.add_to_cart'),
            pricePrefix: tCommon('product.price_prefix'),
            unit: displayUnit,
            similarProducts: tCommon('product.similar_products'),
            notFound: tCommon('product.not_found'),
            clickToEnlarge: tCommon('product.click_to_enlarge'),
            closeModal: tCommon('product.close_modal'),
            expandedImage: tCommon('product.expanded_image', { name: finalName }),
        },
    }
}
