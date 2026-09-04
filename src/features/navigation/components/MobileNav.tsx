import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import type { Category } from '@/types/category'
import LanguageSelector from '@/ui/LanguageSelector/LanguageSelector'
import AccountMenu from '../../auth/AccountMenu'
import { ChevronDownIcon, ChevronRightIcon, WorldIcon } from '@/ui/Icons'
import './MobileNav.css'

interface MobileNavProps {
    isOpen: boolean
    onClose?: () => void
    showLanguage?: boolean
    categories: Category[]
}

/**
 * Componente: MobileNav
 * Función: Construye y renderiza el menú hamburguesa optimizado para dispositivos móviles.
 * Soporta un diseño de menú tipo acordeón con submenús emergentes y selector de idioma integrado.
 */
const MobileNav = ({ isOpen, onClose, showLanguage, categories }: MobileNavProps) => {
    const t = useTranslations('header');
    const tCategories = useTranslations('categories');
    const [openCategory, setOpenCategory] = useState<string | null>(null)
    const [openSubcategories, setOpenSubcategories] = useState<string[]>([])

    // Bloquear scroll del body al estar abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const toggleCategory = (name: string) => {
        setOpenCategory((prev) => (prev === name ? null : name))
        setOpenSubcategories([])
    }

    const toggleSubcategory = (name: string) => {
        setOpenSubcategories((prev) =>
            prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
        )
    }

    const handleLinkClick = () => {
        if (onClose) onClose()
    }

    return (
        <>
            {/* Dark overlay backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 z-[998] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={handleLinkClick}
            />

            {/* Mobile Menu Panel */}
            <nav
                id="mobile-menu"
                className={`fixed top-[49px] left-0 w-[280px] sm:w-[320px] h-[calc(100vh-49px)] bg-black/95 text-white z-[999] overflow-y-auto py-5 shadow-2xl transition-all duration-300 ease-in-out border-r border-white/10 ${
                    isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                }`}
                aria-label={t('nav_aria')}
            >
                <ul className="list-none p-0 m-0">
                    <li className="px-5 py-2.5 border-b border-white/10">
                        <Link href="/" className="block py-1 hover:text-orange-500 transition-colors duration-200" onClick={handleLinkClick}>
                            {t('nav.home')}
                        </Link>
                    </li>

                    <li className="px-5 py-2.5 border-b border-white/10">
                        <button
                            onClick={() => toggleCategory('categorias')}
                            className="w-full text-left flex justify-between items-center py-1 hover:text-orange-500 transition-colors duration-200"
                        >
                            {t('nav.categories')}{' '}
                            <ChevronDownIcon 
                                className={`w-3 h-3 transition-transform duration-300 ease-in-out text-white shrink-0 ${
                                    openCategory === 'categorias' ? 'rotate-180 !text-orange-500' : 'opacity-70'
                                }`} 
                            />
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                openCategory === 'categorias' ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <ul className="pl-4 list-none p-0">
                                {categories.map((category) => (
                                    <li key={category.id} className="border-b border-white/5">
                                        <button
                                            onClick={() => toggleSubcategory(category.id)}
                                            className="w-full text-left py-2.5 flex justify-between items-center text-sm hover:text-orange-400 transition-colors duration-200"
                                        >
                                            {tCategories(category.id)}
                                            <ChevronRightIcon 
                                                className={`w-3 h-3 transition-transform duration-300 ease-in-out text-white shrink-0 ${
                                                    openSubcategories.includes(category.id) ? 'rotate-90 !text-orange-400' : 'opacity-50'
                                                }`} 
                                            />
                                        </button>

                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                openSubcategories.includes(category.id) ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <ul className="pl-4 text-[13px] list-none p-0">
                                                {category.subcategories.map((sub) => {
                                                    const subKey = sub.href.split('#')[1] ?? sub.href.split('/').filter(Boolean).pop()
                                                    return (
                                                        <li key={sub.name}>
                                                            <Link
                                                                href={sub.href}
                                                                className="block py-1.5 hover:text-orange-400 transition-colors duration-200"
                                                                onClick={handleLinkClick}
                                                            >
                                                                {tCategories(`sub.${subKey}`)}
                                                            </Link>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>

                    <li className="px-5 py-2.5 border-b border-white/10">
                        <Link href="/offers" className="block py-1 hover:text-orange-500 transition-colors duration-200" onClick={handleLinkClick}>
                            {t('nav.offers')}
                        </Link>
                    </li>

                    {showLanguage !== false && (
                    <li className="px-5 py-2.5 border-b border-white/10">
                        <AccountMenu variant="mobile" onNavigate={handleLinkClick} />
                    </li>
                    )}

                    {showLanguage !== false && (
                    <li className="px-5 py-2.5 border-b border-white/10">
                        <div className="flex items-center justify-between min-h-[44px]">
                            <div className="flex items-center gap-3">
                                <WorldIcon className="w-5 h-5 text-white shrink-0" />
                                <span className="text-base text-white">
                                    {t('language')}
                                </span>
                            </div>
                            
                            <LanguageSelector variant="inline" />
                        </div>
                    </li>
                    )}
                </ul>
            </nav>
        </>
    )
}

export default MobileNav
