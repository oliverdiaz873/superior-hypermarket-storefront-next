import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import type { Category } from '@/types/category'
import { ChevronDownIcon, ChevronRightIcon } from '@/ui/Icons'
import './DesktopNav.css'


const navLinkClass =
    'text-white no-underline text-base px-2.5 py-2 block text-left transition-colors duration-300 rounded-[10px] hover:bg-white/15'

const dropdownLinkClass =
    'text-white no-underline text-base px-4 py-2 block text-left transition-colors duration-300 hover:bg-white/15 flex justify-between items-center'

const subLinkClass =
    'text-white no-underline text-base px-4 py-1.5 block hover:bg-white/15'

/**
 * Componente: DesktopNav
 * Función: Renderiza la navegación principal diseñada para dispositivos de escritorio.
 * Muestra enlaces directos y un menú desplegable interactivo para las categorías.
 * Soporta interacción por hover y click para mejor accesibilidad.
 */
const DesktopNav = ({ categories }: { categories: Category[] }) => {
    const t = useTranslations('header');
    const tCategories = useTranslations('categories');
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

    return (
        <nav
            className="hidden md:flex justify-center nav-links desktop-nav"
            role="navigation"
            aria-label={t('nav_aria')}
        >
            <ul className="flex gap-5 items-center list-none p-0 m-0">
                <li>
                    <Link href="/" className={navLinkClass}>
                        {t('nav.home')}
                    </Link>
                </li>

                <li className="relative group">
                    <button
                        className={`${navLinkClass} bg-transparent border-none cursor-pointer w-full flex items-center justify-between gap-1`}
                        aria-haspopup="true"
                        aria-expanded={isCategoriesOpen}
                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setIsCategoriesOpen(!isCategoriesOpen)
                            }
                        }}
                    >
                        {t('nav.categories')}
                        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ease-in-out ${isCategoriesOpen || 'group-hover:rotate-180'} text-white opacity-85 shrink-0`} />
                    </button>

                    <ul className={`absolute top-full left-0 bg-black/90 rounded-lg min-w-[220px] ${isCategoriesOpen ? 'flex' : 'hidden group-hover:flex'} flex-col z-1000 list-none p-0 m-0 shadow-xl`}>
                        {categories.map((category) => (
                            <li key={category.id} className="relative group/sub">
                                <Link href={category.href} className={dropdownLinkClass}>
                                    {tCategories(category.id)}
                                    <ChevronRightIcon className="w-3 h-3 transition-transform duration-300 ease-in-out group-hover/sub:translate-x-1 text-white opacity-70 shrink-0" />
                                </Link>

                                <ul className="absolute top-0 left-full bg-black/90 rounded-lg min-w-[220px] hidden group-hover/sub:flex flex-col z-1000 list-none p-0 m-0 shadow-xl">
                                    {category.subcategories.map((sub) => {
                                        const subKey = sub.href.split('#')[1] ?? sub.href.split('/').filter(Boolean).pop()
                                        return (
                                            <li key={sub.name}>
                                                <Link href={sub.href} className={subLinkClass}>
                                                    {tCategories(`sub.${subKey}`)}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </li>

                <li>
                    <Link href="/offers" className={navLinkClass}>
                        {t('nav.offers')}
                    </Link>
                </li>
            </ul>
        </nav>
    )
}

export default DesktopNav
