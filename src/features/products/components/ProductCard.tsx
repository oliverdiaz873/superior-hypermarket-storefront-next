"use client";
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { memo, ReactNode } from 'react'
import { Product } from '@/types/product'
import { cleanPrice } from '@/lib/priceUtils'
import { useProductTranslation } from '../hooks/useProductTranslation'
import './ProductCard.css'

interface ProductCardProps {
    product: Product
    isOffer?: boolean
    oldPrice?: string
    badge?: ReactNode
    action?: ReactNode
}

const ProductCard = ({ product, isOffer, oldPrice, badge, action }: ProductCardProps) => {
    const { name, labels } = useProductTranslation(product)

    return (
        <article className={`producto product-card ${isOffer ? 'offer-card' : ''} block shrink-0 snap-start`}>
            {badge}
            
            <Link href={`/product/${product.id}`}
                className="product-card__overlay-link"
                aria-label={labels.viewDetails}
            ></Link>

            <div className="producto-img-container">
                <Image 
                    src={product.imagen} 
                    alt={name} 
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                />
            </div>

            {/* Lógica de precio: Si es oferta y tiene precio antiguo, mostramos el bloque de descuento.
                De lo contrario, mostramos solo el precio normal. */}
            <div className="price-block-container">
                <div className="price-block">
                    {isOffer && oldPrice ? (
                        <>
                            <ins className="precio-nuevo">{cleanPrice(product.precioTexto)}</ins>
                            <del className="precio-antiguo">{cleanPrice(oldPrice)}</del>
                        </>
                    ) : (
                        <p className="producto-price">{cleanPrice(product.precioTexto)}</p>
                    )}
                </div>
                <p className="producto-unit-format">
                    ${product.precio.toLocaleString()} / {labels.unit}
                </p>
            </div>

            <h3 className="producto-title">{name}</h3>

            {action}
        </article>
    )
}

export default memo(ProductCard)

