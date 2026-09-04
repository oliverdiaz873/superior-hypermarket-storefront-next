"use client";

import { ReactNode, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { ProductPageData } from '@/services/catalog/productPageData'
import { useProductTranslation } from '../hooks/useProductTranslation'
import { cleanPrice } from '@/lib/priceUtils'
import './ProductDetailSection.css'

interface ProductDetailSectionProps {
    product: Product
    pageData?: ProductPageData
    action?: ReactNode
}

/**
 * Componente que renderiza la sección principal de detalles de un producto.
 * 
 * Se encarga de mostrar la información detallada (imagen con lightbox, nombre,
 * precio, descripción enriquecida, viñetas de detalles técnicos) y de proveer 
 * el botón para agregar dicho producto al carrito de compras utilizando el componente AddToCartButton.
 * 
 * @param {ProductDetailSectionProps} props - Las propiedades del componente.
 * @param {Product} props.product - Objeto con la información básica del producto (id, nombre, precio, imagen, etc).
 * @param {ProductPageData} [props.pageData] - Objeto opcional (diccionario) con los datos extendidos del producto (descripción larga y detalles/especificaciones). Si no se provee, muestra valores por defecto.
 */
const ProductDetailSection = ({ product, pageData, action }: ProductDetailSectionProps) => {
    const { name, description, specs, priceText, labels } = useProductTranslation(product, pageData)
    const oldPrice = (product as unknown as { oldPrice?: string }).oldPrice
    const discountPercentage = (product as unknown as { discountPercentage?: number }).discountPercentage
    const isOffer = Boolean(oldPrice)
    const [modalOpen, setModalOpen] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    // Trapfoco y manejo de ESC en modal
    useEffect(() => {
        if (!modalOpen) return

        // Restablecer foco cuando el modal abre
        closeButtonRef.current?.focus()

        const handleKeyDown = (e: KeyboardEvent) => {
            // Cerrar modal con ESC
            if (e.key === 'Escape') {
                setModalOpen(false)
            }

            // Trapfoco: TAB dentro del modal
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                const firstElement = focusableElements[0] as HTMLElement
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement?.focus()
                        e.preventDefault()
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        firstElement?.focus()
                        e.preventDefault()
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [modalOpen])

    // Guardar elemento que tenía foco antes del modal
    const previousFocusRef = useRef<HTMLElement | null>(null)

    return (
        <section className="producto-detalle">
            <div className="contenedor-producto">

                {/* Imagen con modal lightbox */}
                <figure className="imagen-producto">
                    <Image
                        src={product.imagen}
                        alt={name}
                        width={600}
                        height={600}
                        onClick={() => {
                            previousFocusRef.current = document.activeElement as HTMLElement
                            setModalOpen(true)
                        }}
                        title={labels.clickToEnlarge}
                    />
                </figure>

                {/* Modal lightbox con trapfoco */}
                <div
                    ref={modalRef}
                    className={`modal-imagen${modalOpen ? ' modal-activo' : ''}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={labels.expandedImage}
                    onClick={() => setModalOpen(false)}
                >
                    <button
                        ref={closeButtonRef}
                        aria-label={labels.closeModal}
                        className="modal-close-button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setModalOpen(false)
                        }}
                        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
                    >
                        ✕
                    </button>
                    {/* El div completo sirve de área de cierre */}
                    <Image
                        src={product.imagen}
                        alt={labels.expandedImage}
                        width={1200}
                        height={1200}
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Información del producto */}
                <div className="info-producto">
                    <h1>{name}</h1>
                    {isOffer && oldPrice ? (
                        <div className="price-block" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            <ins className="precio-nuevo" style={{ textDecoration: 'none', fontSize: '1.6em', fontWeight: 700, color: '#ffcc00' }}>
                                {cleanPrice(priceText)}
                            </ins>
                            <del className="precio-antiguo" style={{ fontSize: '1.1em', color: '#a1a1aa', textDecoration: 'line-through' }}>
                                {cleanPrice(oldPrice)}
                            </del>
                            {typeof discountPercentage === 'number' && (
                                <span
                                    style={{
                                        background: '#ffcc00',
                                        color: '#000',
                                        fontWeight: 700,
                                        borderRadius: '9999px',
                                        padding: '2px 8px',
                                        fontSize: '0.9em',
                                    }}
                                >
                                    -{discountPercentage}%
                                </span>
                            )}
                        </div>
                    ) : (
                        <p className="precio">{priceText}</p>
                    )}

                    <p className="descripcion">
                        {description}
                    </p>

                    {specs.length > 0 && (
                        <ul className="detalles">
                            {specs.map((detalle: string, i: number) => (
                                <li key={i}>{detalle}</li>
                            ))}
                        </ul>
                    )}

                    {action && (
                        <div style={{ marginTop: '20px' }}>
                            {action}
                        </div>
                    )}
                </div>

            </div>
        </section>
    )
}

export default ProductDetailSection
