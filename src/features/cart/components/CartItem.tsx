import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { memo } from 'react'
import { Product } from '@/types/product'
import { cleanPrice } from '@/lib/priceUtils'
import QuantityControls from './QuantityControls'
import { OfferBadge } from '../../offers/components'
import { useTranslations } from 'next-intl'
import { useProductTranslation } from '../../products/hooks/useProductTranslation'
import { TrashIcon } from '@/ui/Icons'
import './CartItem.css'

/**
 * CartItem - Componente Individual de Item del Carrito
 * 
 * Representa un solo producto en el carrito con información detallada:
 * - Imagen del producto
 * - Nombre y precio con formato
 * - Badge de oferta si aplica
 * - Precio anterior si es oferta
 * - Unidad de medida
 * - Controles de cantidad
 * - Subtotal y botón de eliminación
 */
interface CartItemProps {
    id: string
    name: string
    precio: number
    cantidad: number
    img: string
    unitLabel: string
    unitQuantity?: number
    isOffer?: boolean
    oldPrice?: string
    discountPercentage?: number
    updateQuantity: (id: string, change: number) => void
    removeFromCart: (id: string) => void
}

const CartItem = ({
    id,
    name: productName,
    precio,
    cantidad,
    img,
    unitLabel,
    unitQuantity,
    isOffer = false,
    oldPrice,
    discountPercentage,
    updateQuantity,
    removeFromCart
}: CartItemProps) => {
    const t = useTranslations('common');
    const tCommon = useTranslations('common');
    const cartProduct: Product = { id, name: productName, precio, imagen: img } as Product
    const { name } = useProductTranslation(cartProduct)

    const unitKey = `units.${unitLabel}`;
    const translatedUnit = tCommon.has(unitKey) ? tCommon(unitKey) : unitLabel;
    const displayUnit = unitQuantity && unitQuantity > 1 ? `${unitQuantity} ${translatedUnit}` : translatedUnit;

    return (
        <div className="cart-item">
            <Link href={`/product/${id}`}
                className="cart-item__image-link"
                aria-label={t('product.view_details', { name })}
            >
                <div className="cart-item__image-container">
                    {isOffer && (
                        <div className="cart-item__badge-wrapper">
                            <OfferBadge discountPercentage={discountPercentage} />
                        </div>
                    )}
                    <Image
                        src={img}
                        alt={name}
                        width={100}
                        height={100}
                        className="cart-item__image"
                    />
                </div>
            </Link>

            <div className="cart-item__content">
                <div className="cart-item__header">
                    <Link href={`/product/${id}`}
                        className="cart-item__name-link"
                        aria-label={t('product.view_details', { name })}
                    >
                        <h3 className="cart-item__name">{name}</h3>
                    </Link>
                    <button
                        onClick={() => removeFromCart(id)}
                        className="cart-item__remove-icon"
                        aria-label={`${t('product.remove')} ${name}`}
                        title={t('product.remove')}
                    >
                        <TrashIcon />
                    </button>
                </div>

                <div className="cart-item__variant">
                    <span className="cart-item__unit">${precio.toLocaleString()} / {displayUnit}</span>
                </div>

                <div className="cart-item__footer">
                    <div className="cart-item__price-block">
                        {isOffer && oldPrice ? (
                            <>
                                <ins className="cart-item__new-price">${precio.toLocaleString()}</ins>
                                <del className="cart-item__old-price">${cleanPrice(oldPrice)}</del>
                            </>
                        ) : (
                            <p className="cart-item__price">${precio.toLocaleString()}</p>
                        )}
                    </div>

                    <QuantityControls
                        quantity={cantidad}
                        onDecrease={() => updateQuantity(id, -1)}
                        onIncrease={() => updateQuantity(id, 1)}
                        ariaLabels={{
                            decrease: t('cart.decrease_qty'),
                            increase: t('cart.increase_qty')
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default memo(CartItem)
