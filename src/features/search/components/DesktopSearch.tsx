import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { HeaderSearchProduct } from '../hooks/useHeaderSearch'
import { SearchIcon, CloseIcon, CartIcon } from '@/ui/Icons'
import './DesktopSearch.css'

/**
 * Props del componente DesktopSearch.
 * 
 * @interface DesktopSearchProps
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
interface DesktopSearchProps {
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
 * Componente de búsqueda optimizado para desktop.
 * 
 * CARACTERÍSTICAS:
 * - Input expandible: comienza oculto, se expande al activarse
 * - Dropdown de resultados: mostrado debajo del input con máximo 8 items
 * - Integración con carrito: botón de carrito con badge de cantidad
 * - Animaciones: cambios suaves de tamaño y color
 * - Responsive: se oculta en viewports menores a 1200px
 * - Accesibilidad: aria-labels con contexto (submit/open/close)
 * 
 * LAYOUT DESKTOP:
 * [Search Input (expandible)] [Cart Button] [Language Selector]
 *           ↓
 *   [Dropdown Resultados]
 * 
 * ESTILOS:
 * - Input: 400px cuando activo, flex automático
 * - Resultados: dropdown con scroll, max-height 250px
 * - Botón: tamaño 6x6, cambia color a rojo cuando activo
 * 
 * @component
 * @returns {JSX.Element} UI del buscador para desktop
 */
const DesktopSearch = ({
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
}: DesktopSearchProps) => {
    const t = useTranslations('search');
    const tHeader = useTranslations('header');
    return (
        <div className="desktop-search">
            <div className={`desktop-search__field ${isActive ? 'is-active' : ''}`}>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('input.placeholder')}
                    className={`desktop-search__input search-input-modern bg-white text-black px-3 py-1.5 rounded-lg outline-none ${isActive ? 'is-active' : ''}`}
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
                    <ul ref={resultsRef} className="desktop-search__results">
                        {searchResults.map((product) => (
                            <li
                                key={product.id}
                                onClick={() => onResultClick(product.id)}
                                className="desktop-search__result"
                            >
                                <Image
                                    src={product.imagen}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="desktop-search__thumb"
                                />
                                <span className="desktop-search__label">{product.name}</span>
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

            <Link href="/cart" className="util-btn group" aria-label={tHeader('cart_label')}>
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

export default DesktopSearch
