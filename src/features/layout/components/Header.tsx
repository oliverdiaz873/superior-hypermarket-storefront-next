"use client";
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { usePathname, useRouter } from '@/i18n/routing'
import DesktopNav from '../../navigation/components/DesktopNav'
// import TabletNav from '../../navigation/components/TabletNav'
import MobileNav from '../../navigation/components/MobileNav'
import { DesktopSearch, TabletSearch, MobileSearch, useHeaderSearch } from '../../search'

import { useCart } from '../../cart/hooks/useCart'
import { useTranslations } from 'next-intl'
import LanguageSelector from '@/ui/LanguageSelector/LanguageSelector'
import AccountMenu from '../../auth/AccountMenu'
import type { Category } from '@/types/category'
import './Header.css'
import '../../navigation/components/Navigation.css'

type ViewportMode = 'mobile' | 'tablet' | 'desktop'

const getViewportMode = (): ViewportMode => {
    if (typeof window === 'undefined') return 'desktop'

    const width = window.innerWidth

    if (width < 768) return 'mobile'
    if (width < 1200) return 'tablet'
    return 'desktop'
}

// Component: orquesta el header principal y decide, segun el viewport,
// que navegacion y que variante del buscador deben renderizarse para
// mantener separada la experiencia de desktop, tablet y mobile.
const Header = ({ categories }: { categories: Category[] }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop')
    const { totalItems } = useCart()
    const router = useRouter()
    const pathname = usePathname()
    const isHomePage = pathname === '/'

    const t = useTranslations('header');

    const {
        isSearchActive,
        searchInputRef,
        resultsRef,
        searchResults,
        searchTerm,
        setSearchTerm,
        handleResultClick,
        handleSearchSubmit,
        handleSearchToggle,
    } = useHeaderSearch(
        (id) => router.push(`/product/${id}`),
        (term) => router.push(`/search?q=${encodeURIComponent(term)}`)
    )

    useEffect(() => {
        const handleResize = () => {
            setViewportMode(getViewportMode())
        }

        // Debounce resize events para evitar múltiples rerenders
        let resizeTimeout: NodeJS.Timeout
        const debouncedResize = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(handleResize, 150)
        }

        handleResize()
        window.addEventListener('resize', debouncedResize)
        return () => {
            window.removeEventListener('resize', debouncedResize)
            clearTimeout(resizeTimeout)
        }
    }, [])

    const showBrand = viewportMode !== 'mobile' || !isSearchActive
    const showNavigation = !isSearchActive && viewportMode === 'desktop'

    return (
        <header className="fixed top-0 left-0 w-full rounded-none xl:top-[10px] xl:left-1/2 xl:-translate-x-1/2 xl:rounded-[15px] xl:w-max xl:max-w-[calc(100vw-40px)] bg-black/80 px-2.5 py-1.5 z-[1000] flex justify-center text-white border border-white/10 shadow-lg" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
            <div className="header-container flex items-center gap-1 md:gap-1 lg:gap-2 justify-between md:justify-center w-full px-0 md:px-1.5 lg:px-3.5">
                {viewportMode !== 'desktop' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
                        className="menu-btn bg-transparent border-none text-white cursor-pointer transition-colors duration-300 rounded hover:bg-white/15 p-2 flex flex-col justify-center items-center gap-1.5 w-10 h-10 relative z-[1000]"
                        aria-label={t(isMobileMenuOpen ? 'menu_close' : 'menu_open')}
                    >
                        <span className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                )}

                {showBrand && (
                    <Link href="/" className="brand flex items-center gap-1 text-white no-underline md:mr-2">
                        <Image
                            src="/assets/images/logo/logo.png"
                            alt="Logo"
                            width={34}
                            height={34}
                            className="w-[34px] h-[34px] object-contain"
                        />
                        {isHomePage ? (
                            <h1 suppressHydrationWarning className="font-bold whitespace-nowrap">
                                {t('brand')}
                            </h1>
                        ) : (
                            <span suppressHydrationWarning className="font-bold whitespace-nowrap">
                                {t('brand')}
                            </span>
                        )}
                    </Link>
                )}

                {showNavigation && viewportMode === 'desktop' && <DesktopNav categories={categories} />}
                {viewportMode === 'desktop' && (
                    <DesktopSearch
                        isActive={isSearchActive}
                        resultsRef={resultsRef}
                        searchInputRef={searchInputRef}
                        searchResults={searchResults}
                        searchTerm={searchTerm}
                        totalItems={totalItems}
                        onResultClick={handleResultClick}
                        onSearchChange={setSearchTerm}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchToggle={handleSearchToggle}
                    />
                )}

                {viewportMode === 'tablet' && (
                    <TabletSearch
                        isActive={isSearchActive}
                        resultsRef={resultsRef}
                        searchInputRef={searchInputRef}
                        searchResults={searchResults}
                        searchTerm={searchTerm}
                        totalItems={totalItems}
                        onResultClick={handleResultClick}
                        onSearchChange={setSearchTerm}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchToggle={handleSearchToggle}
                    />
                )}

                {viewportMode === 'mobile' && (
                    <MobileSearch
                        isActive={isSearchActive}
                        resultsRef={resultsRef}
                        searchInputRef={searchInputRef}
                        searchResults={searchResults}
                        searchTerm={searchTerm}
                        totalItems={totalItems}
                        onResultClick={handleResultClick}
                        onSearchChange={setSearchTerm}
                        onSearchSubmit={handleSearchSubmit}
                        onSearchToggle={handleSearchToggle}
                    />
                )}

                {viewportMode === 'desktop' && (
                    <AccountMenu />
                )}

                {viewportMode === 'desktop' && (
                    <LanguageSelector />
                )}
            </div>

            {viewportMode !== 'desktop' && (
                <MobileNav
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    showLanguage={true}
                    categories={categories}
                />
            )}
        </header>
    )
}

export default Header
