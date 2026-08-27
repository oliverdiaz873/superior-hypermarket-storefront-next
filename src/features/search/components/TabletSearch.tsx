import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { HeaderSearchProduct } from '../hooks/useHeaderSearch'
import { SearchIcon, CloseIcon, CartIcon } from '@/ui/Icons'
import './TabletSearch.css'

/**
 * Props del componente TabletSearch.
 * 
 * @interface TabletSearchProps
 * @property {boolean} isActive - Indica si el buscador está activo (input expandido)
 * @property {React.RefObject<HTMLUListElement>} resultsRef - Referencia al DOM para detectar clicks fuera
 * @property {React.RefObject<HTMLInputElement>} searchInputRef - Referencia al input para focus automático
 * @property {HeaderSearchProduct[]} searchResults - Array de productos encontrados
 * @property {string} searchTerm - Término actual de búsqueda
 * @property {number} totalItems - Total de items en carrito (para badge)
 * @property {Function} onResultClick - Callback al hacer click en un resultado
 * @property {Function} onSearchChange - Callback al escribir en el input
 * @property {Function} onSearchSubmit - Callback al presionar Enter o botón submit
 * @property {Function} onSearchToggle - Callback para abrir/cerrar buscador
 */
interface TabletSearchProps {
    isActive: boolean
    resultsRef: React.RefObject<HTMLUListElement | null>
    searchInputRef: React.RefObject<HTMLInputElement | null>
    searchResults: HeaderSearchProduct[]
    searchTerm: string
    totalItems: number
    onResultClick: (id: string) => void
    onSearchChange: (value: string) => void
    onSearchSubmit: () => void
    onSearchToggle: () => void
}

/**
 * Componente de búsqueda optimizado para tablet (768px - 1199px).
 * 
 * CARACTERÍSTICAS:
 * - Balance logo-search: mantiene logo visible mientras hay espacio
 * - Input flexible: expande usando el espacio disponible al activarse
 * - Carrito oculto: se oculta cuando la búsqueda está activa
 * - Breakpoint específico: solo se renderiza en 768px - 1199px (CSS media query)
 * - Dropdown 400px: ancho máximo aprovechando el espacio de tablet
 * - Enfoque UX: mantiene marca visible pero prioriza búsqueda
 * 
 * LAYOUT TABLET (768px - 1199px):
 * [Logo] [Search Field (flexible)] [Cart]
 *                    ↓ (cuando activo)
 *       [Search Input (expand)] [Search Results]
 * 
 * ESTILOS:
 * - Display: flex con flex: 1 1 auto para crecer
 * - Search field activo: width: 100% tomando todo el espacio
 * - Resultados: min(400px, 100%) - máximo 400px pero responsivo
 * - Media query: @media (min-width: 768px) and (max-width: 1199px)
 * - Carrito: display: none cuando tablet-search.is-active
 * 
 * DIFERENCIAS CON DESKTOP/MOBILE:
 * - Vs Desktop: menos espacio, logo obligatorio visible
 * - Vs Mobile: más espacio, carrito visible cuando no busca
 * 
 * @component
 * @returns {JSX.Element} UI del buscador para tablet
 */
const TabletSearch = ({
    isActive,
    resultsRef,
    searchInputRef,
    searchResults,
    searchTerm,
    totalItems,
    onResultClick,
    onSearchChange,
    onSearchSubmit,
    onSearchToggle,
}: TabletSearchProps) => {
    const t = useTranslations('search');
    const tHeader = useTranslations('header');
    const tProducts = useTranslations('products');
    return (
        <div className={`tablet-search ${isActive ? 'is-active' : ''}`}>
            <div className={`tablet-search__field ${isActive ? 'is-active' : ''}`}>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('input.placeholder')}
                    className={`tablet-search__input search-input-modern bg-white text-black px-3 py-1.5 rounded-lg outline-none ${isActive ? 'is-active' : ''}`}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            onSearchSubmit()
                        }
                    }}
                />

                {searchResults.length > 0 && (
                    <ul ref={resultsRef} className="tablet-search__results">
                        {searchResults.map((product) => (
                            <li
                                key={product.id}
                                onClick={() => onResultClick(product.id)}
                                className="tablet-search__result"
                            >
                                <Image
                                    src={product.imagen}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    alt={tProducts.has(`${product.id}.name` as any) ? tProducts(`${product.id}.name` as any) : product.name}
                                    width={40}
                                    height={40}
                                    className="tablet-search__thumb"
                                />
                                <div className="tablet-search__item-content">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <span className="tablet-search__label">{tProducts.has(`${product.id}.name` as any) ? tProducts(`${product.id}.name` as any) : product.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button
                onClick={isActive ? onSearchSubmit : onSearchToggle}
                className="util-btn group relative"
                aria-label={isActive ? t('button.submit') : t('button.open')}
            >
                {isActive ? (
                    <CloseIcon className="util-icon w-6 h-6 transition-all duration-300 text-red-500 scale-[2]" />
                ) : (
                    <SearchIcon className="util-icon w-6 h-6 transition-all duration-300" />
                )}
            </button>

            <Link href="/cart" className="util-btn tablet-search__cart group" aria-label={tHeader('cart_label')}>
                <span className="relative inline-flex">
                    <CartIcon className="util-icon w-6 h-6 md:w-[27px] md:h-[27px]" />
                    {totalItems > 0 && (
                        <span className="cart-badge absolute -top-1.5 -right-1.5 bg-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {totalItems}
                        </span>
                    )}
                </span>
            </Link>
        </div>
    )
}

export default TabletSearch
