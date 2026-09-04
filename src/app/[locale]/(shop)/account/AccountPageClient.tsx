'use client'

import { useTransition } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import type { AuthUser } from '@/features/auth/types'
import { logoutAction } from '@/features/auth/actions'
import { useSession } from '@/features/auth/SessionContext'

export default function AccountPageClient({ user }: { user: AuthUser }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const { refresh } = useSession()
  const [pending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      await refresh()
      router.replace(`/login?returnUrl=${encodeURIComponent('/account')}`)
      router.refresh()
    })
  }

  const rowClass = 'flex justify-between items-center py-3 border-b border-white/10'

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 dark:bg-black/40 rounded-2xl p-6 md:p-8 shadow-2xl text-gray-900">
      <h1 className="text-2xl font-bold mb-6">{t('account.title')}</h1>

      <div className="flex flex-col gap-0 text-sm">
        <div className={rowClass}>
          <span className="opacity-70">{t('account.name')}</span>
          <span className="font-medium">{user.name}</span>
        </div>
        <div className={rowClass}>
          <span className="opacity-70">{t('account.email')}</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div className={rowClass}>
          <span className="opacity-70">{t('account.role')}</span>
          <span className="font-medium">{user.role}</span>
        </div>
      </div>

      <Link
        href="/orders"
        className="mt-6 block w-full rounded-lg bg-orange-500 text-white font-semibold py-3 text-sm text-center transition-colors duration-200 hover:bg-orange-600"
      >
        {t('account.my_orders')}
      </Link>

      <Link
        href="/help"
        className="mt-4 block w-full rounded-lg border border-orange-500 bg-white text-orange-600 dark:bg-transparent dark:text-orange-300 font-semibold py-3 text-sm text-center transition-colors duration-200 hover:bg-orange-50 dark:hover:bg-white/10"
      >
        {t('account.help_cta')}
      </Link>
      <p className="mt-2 text-xs text-center opacity-60 dark:text-white/60">{t('account.help_description')}</p>

      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-red-600 text-white font-semibold py-3 text-sm transition-colors duration-200 hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? t('account.logging_out') : t('account.logout')}
      </button>
    </div>
  )
}