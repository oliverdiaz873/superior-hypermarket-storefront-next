import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { getSession } from '@/features/auth/session'
import HelpLayout from '@/features/help/components/HelpLayout'
import { HELP_CATEGORIES } from '@/features/help/help.content'
import Breadcrumb from '@/ui/Breadcrumb/Breadcrumb'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('help')
  const seo = t.raw('seo.index') as { title: string; description: string; keywords: string }
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  }
}

export default async function HelpIndexPage() {
  const t = await getTranslations('help')
  const tCommon = await getTranslations('common')
  const session = await getSession()

  return (
    <>
      <div className="help-breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: tCommon('breadcrumb.home'), to: '/' },
            { label: t('breadcrumb.help_center') },
          ]}
        />
      </div>
      <HelpLayout title={t('hero.title')} subtitle={t('hero.subtitle')}>
        {session ? (
          <div className="help-contact-banner">
            <Link href="/orders">{t('actions.view_orders')} →</Link>
          </div>
        ) : (
          <div className="help-contact-banner">
            <Link href={`/login?returnUrl=${encodeURIComponent('/help')}`}>
              {t('actions.login')} {t('category_descriptions.orders').toLowerCase()} →
            </Link>
          </div>
        )}

        <div className="help-grid">
          {HELP_CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/help/${cat.id}`} className="help-card">
              <h3>{t(`categories.${cat.id}`)}</h3>
              <p>{t(`category_descriptions.${cat.id}`)}</p>
              <span className="help-card-cta">{t('actions.help')} →</span>
            </Link>
          ))}
        </div>

        <div className="help-contact-cta">
          <p>{t('resolution.contact_hint')}</p>
          <Link href="/contact" className="help-pill">
            {t('actions.contact')}
          </Link>
        </div>
      </HelpLayout>
    </>
  )
}
