import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { HeaderSearchProduct } from '../hooks/useHeaderSearch'
import { SearchIcon, CloseIcon, CartIcon } from '@/ui/Icons'
import './MobileSearch.css'

/**
 * Props del componente MobileSearch.
 * 
 * @interface MobileSearchProps
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
interface MobileSearchProps {
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
 * Componente de búsqueda optimizado para mobile (< 768px).
 * 
 * CARACTERÍSTICAS:
 * - Input a pantalla completa: cuando activo, ocupa todo el ancho disponible
 * - Carrito oculto: se oculta al activar búsqueda para ahorrar espacio
 * - Dropdown contextual: resultados ajustados al ancho de pantalla
 * - Scroll automático: lista de resultados con scroll independiente
 * - Mayor área de toque: items con padding optimizado para dedos
 * - Búsqueda rápida: focus automático para empezar a escribir
 * 
 * LAYOUT MOBILE (< 768px):
 * [Menu] [Search Button]
 *          ↓ (cuando activo)
 * [Search Input (full width)]
 *    ↓
 * [Dropdown Resultados (responsive)]
 * 
 * ESTILOS:
 * - Buscador: flex layout con margin-left auto
 * - Resultados: min(320px, calc(100vw - 24px)) - adaptado a pantalla
 * - Carrito: ocultado con display:none cuando isActive
 * - Padding: 10px para mejor interacción táctil
 * 
 * @component
 * @returns {JSX.Element} UI del buscador para mobile
 */
const MobileSearch = ({
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
}: MobileSearchProps) => {
    const t = useTranslations('search');
    const tHeader = useTranslations('header');
    return (
        <div className={`mobile-search ${isActive ? 'is-active' : ''}`}>
            <div className={`mobile-search__field ${isActive ? 'is-active' : ''}`}>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('input.placeholder')}
                    className={`mobile-search__input search-input-modern bg-white text-black px-3 py-1.5 rounded-lg outline-none ${isActive ? 'is-active' : ''}`}
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
                    <ul ref={resultsRef} className="mobile-search__results">
                        {searchResults.map((product) => (
                            <li
                                key={product.id}
                                onClick={() => onResultClick(product.id)}
                                className="mobile-search__result"
                            >
                                <Image
                                    src={product.imagen}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="mobile-search__thumb"
                                />
                                <span className="mobile-search__label">{product.name}</span>
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

            <Link href="/cart" className="util-btn mobile-search__cart group" aria-label={tHeader('cart_label')}>
                <span className="relative inline-flex">
                    <CartIcon className="util-icon w-6 h-6" />
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

export default MobileSearch
