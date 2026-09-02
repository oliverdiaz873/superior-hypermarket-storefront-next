'use client'

import { useTransition } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useSession } from './SessionContext'
import { logoutAction } from './actions'
import { DEFAULT_AUTH_REDIRECT } from './config'

const linkClass = 'text-white no-underline text-sm px-2.5 py-1.5 transition-colors duration-200 hover:text-orange-500'

interface AccountMenuProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

/**
 * Zona de cuenta del header. Reacciona al SessionProvider:
 * - loading  → skeleton (SSR y primer render pintan lo mismo ⇒ sin mismatch).
 * - anónimo  → enlaces a /login y /register.
 * - logged   → avatar con iniciales → /account, nombre y botón logout.
 */
export default function AccountMenu({ variant = 'desktop', onNavigate }: AccountMenuProps) {
  const t = useTranslations('auth')
  const tFooter = useTranslations('footer')
  const router = useRouter()
  const { status, user, refresh } = useSession()
  const [pending, startTransition] = useTransition()

  const initials = user
    ? user.name
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      await refresh()
      router.refresh()
    })
  }

  const loginHref = `/login?returnUrl=${encodeURIComponent(DEFAULT_AUTH_REDIRECT)}`

  if (status === 'loading') {
    return (
      <div
        aria-hidden
        className="h-9 w-9 rounded-full bg-white/10 animate-pulse"
      />
    )
  }

  if (status === 'anonymous') {
    if (variant === 'mobile') {
      return (
        <div className="flex flex-col gap-1">
          <Link href={loginHref} className={linkClass} onClick={onNavigate}>
            {t('menu.sign_in')}
          </Link>
          <Link href="/register" className={linkClass} onClick={onNavigate}>
            {t('menu.sign_up')}
          </Link>
        </div>
      )
    }
    return (
      <div className="flex items-center">
        <Link href={loginHref} className={linkClass}>
          {t('menu.sign_in')}
        </Link>
        <Link href="/register" className={linkClass}>
          {t('menu.sign_up')}
        </Link>
      </div>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-1">
        <Link href="/account" className={linkClass} onClick={onNavigate}>
          {t('menu.my_account')}
        </Link>
        <Link href="/orders" className={linkClass} onClick={onNavigate}>
          {tFooter('links.orders')}
        </Link>
        <Link href="/addresses" className={linkClass} onClick={onNavigate}>
          {tFooter('links.addresses')}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={pending}
          className={`${linkClass} bg-transparent border-none text-left cursor-pointer disabled:opacity-50`}
        >
          {t('menu.logout')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/account"
        onClick={onNavigate}
        className="flex items-center gap-2 text-white no-underline px-2 py-1 rounded-lg transition-colors duration-200 hover:bg-white/10"
        title={user ? user.name : undefined}
      >
        <span className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
          {initials}
        </span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="bg-transparent border-none text-white/80 text-sm cursor-pointer px-2 py-1.5 rounded-md transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:opacity-50"
      >
        {t('menu.logout')}
      </button>
    </div>
  )
}