'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useSession } from './SessionContext'
import { logoutAction } from './actions'
import { DEFAULT_AUTH_REDIRECT } from './config'
import {
  ChevronDownIcon,
  LogInIcon,
  LogOutIcon,
  UserPlusIcon,
  UserRoundIcon,
} from '@/ui/Icons'

interface AccountMenuProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

const triggerClass =
  'flex h-11 items-center gap-2 rounded-xl px-2.5 transition-colors duration-200 hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60'

const line1Class = 'text-[11px] leading-tight text-white'
const line2Class =
  'max-w-[140px] truncate text-sm font-semibold leading-tight text-white'

const panelClass =
  'absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-2xl border border-white/10 bg-black/90 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.5)] transition-[opacity,transform,visibility] duration-150 motion-reduce:transition-none'

const primaryActionClass =
  'flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60'

const secondaryActionClass =
  'flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white/90 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60'

const menuItemClass =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60'

const mobileCardClass =
  'flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4'

const mobileLinkClass =
  'block rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors duration-200 hover:bg-white/10 hover:text-white'

/**
 * Zona de cuenta del header (patrón disclosure).
 * - loading     → skeleton (SSR y primer render pintan lo mismo ⇒ sin mismatch).
 * - anonymous   → trigger "Hola, bienvenido / Mi cuenta" + panel de bienvenida.
 * - authenticated → avatar + saludo con nombre + accesos reales de cuenta.
 * variant="mobile" renderiza una tarjeta inline dentro del drawer (MobileNav).
 */
export default function AccountMenu({ variant = 'desktop', onNavigate }: AccountMenuProps) {
  const t = useTranslations('auth')
  const tFooter = useTranslations('footer')
  const router = useRouter()
  const pathname = usePathname()
  const { status, user, refresh } = useSession()
  const [pending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const isMobile = variant === 'mobile'
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const firstName = user?.name.trim().split(/\s+/)[0] ?? ''
  const initials = user
    ? user.name
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  const close = () => setIsOpen(false)

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      await refresh()
      setIsOpen(false)
      onNavigate?.()
      router.refresh()
    })
  }

  // Cierra el panel al navegar o cambiar el estado de sesión
  // (patrón "adjusting state during render" de React).
  const sessionKey = `${pathname}|${status}`
  const [prevSessionKey, setPrevSessionKey] = useState(sessionKey)
  if (prevSessionKey !== sessionKey) {
    setPrevSessionKey(sessionKey)
    setIsOpen(false)
  }

  // Cierre por clic fuera y Escape (solo variante desktop).
  useEffect(() => {
    if (isMobile || !isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isMobile])

  const loginHref = `/login?returnUrl=${encodeURIComponent(DEFAULT_AUTH_REDIRECT)}`

  const avatar = (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
      {initials}
    </span>
  )

  if (status === 'loading') {
    if (isMobile) {
      return <div aria-hidden className="h-28 animate-pulse rounded-2xl bg-white/10" />
    }
    return <div aria-hidden className="h-11 w-44 animate-pulse rounded-xl bg-white/10" />
  }

  // ── Variante mobile: tarjeta inline dentro del drawer ──────────────────
  if (isMobile) {
    if (status === 'anonymous') {
      return (
        <div className={mobileCardClass}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
              <UserRoundIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{t('menu.welcome_title')}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                {t('menu.welcome_description')}
              </p>
            </div>
          </div>
          <Link href={loginHref} onClick={onNavigate} className={primaryActionClass}>
            <LogInIcon className="h-4 w-4" />
            {t('menu.sign_in')}
          </Link>
          <Link href="/register" onClick={onNavigate} className={secondaryActionClass}>
            <UserPlusIcon className="h-4 w-4" />
            {t('menu.create_account')}
          </Link>
        </div>
      )
    }

    return (
      <div className={mobileCardClass}>
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          {avatar}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {t('menu.greeting_named', { name: firstName })}
            </p>
            <p className="truncate text-xs text-white/60">{user?.email}</p>
          </div>
        </div>
        <Link href="/account" onClick={onNavigate} className={mobileLinkClass}>
          {t('menu.my_account')}
        </Link>
        <Link href="/orders" onClick={onNavigate} className={mobileLinkClass}>
          {tFooter('links.orders')}
        </Link>
        <Link href="/addresses" onClick={onNavigate} className={mobileLinkClass}>
          {tFooter('links.addresses')}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={pending}
          className={`${mobileLinkClass} flex items-center gap-3 text-red-400 hover:bg-white/10 hover:text-red-300 disabled:opacity-50`}
        >
          <LogOutIcon className="h-4 w-4" />
          {pending ? t('account.logging_out') : t('menu.logout')}
        </button>
      </div>
    )
  }

  // ── Variante desktop: trigger + dropdown disclosure ─────────────────────
  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={t('menu.open_account')}
        className={triggerClass}
      >
        {user ? avatar : <UserRoundIcon className="h-[26px] w-[26px] shrink-0 text-white" />}
        <span className="flex min-w-0 flex-col items-start">
          <span className={line1Class}>
            {user ? t('menu.greeting_named', { name: firstName }) : t('menu.greeting')}
          </span>
          <span className={line2Class}>{t('menu.my_account')}</span>
        </span>
        <ChevronDownIcon
          className={`h-3 w-3 shrink-0 text-white transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        id={panelId}
        className={`${panelClass} ${
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        {status === 'anonymous' ? (
          <>
            <div className="flex items-start gap-3 px-4 pb-3 pt-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
                <UserRoundIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-white">{t('menu.welcome_title')}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t('menu.welcome_description')}
                </p>
              </div>
            </div>
            <div className="mx-3 mb-3 h-px bg-white/10" />
            <div className="flex flex-col gap-2 p-2">
              <Link href={loginHref} onClick={close} className={primaryActionClass}>
                <LogInIcon className="h-4 w-4" />
                {t('menu.sign_in')}
              </Link>
              <Link href="/register" onClick={close} className={secondaryActionClass}>
                <UserPlusIcon className="h-4 w-4" />
                {t('menu.create_account')}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              {avatar}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {t('menu.greeting_named', { name: firstName })}
                </p>
                <p className="truncate text-xs text-white/60">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-col p-2">
              <Link href="/account" onClick={close} className={menuItemClass}>
                {t('menu.my_account')}
              </Link>
              <Link href="/orders" onClick={close} className={menuItemClass}>
                {tFooter('links.orders')}
              </Link>
              <Link href="/addresses" onClick={close} className={menuItemClass}>
                {tFooter('links.addresses')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={pending}
                className={`${menuItemClass} text-red-400 hover:bg-white/10 hover:text-red-300 disabled:opacity-50`}
              >
                <LogOutIcon className="h-4 w-4" />
                {pending ? t('account.logging_out') : t('menu.logout')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
