import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/routing'
import HelpLayout from '@/features/help/components/HelpLayout'
import { HELP_CATEGORIES, isValidHelpCategory } from '@/features/help/help.content'
import Breadcrumb from '@/ui/Breadcrumb/Breadcrumb'

type Props = {
  params: Promise<{ locale: string; category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params
  if (!isValidHelpCategory(category)) {
    return { title: 'Not found', robots: { index: false, follow: false } }
  }
  const t = await getTranslations({ locale, namespace: 'help' })
  const catName = t(`categories.${category}`)
  const title = t('seo.category.title_template', { category: catName })
  const description = t('seo.category.description_template', { category: catName })
  const canonical = `https://www.hipermercadosuperior.com${locale === 'es' ? '' : '/en'}/help/${category}`
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: `https://www.hipermercadosuperior.com/help/${category}`,
        en: `https://www.hipermercadosuperior.com/en/help/${category}`,
      },
    },
  }
}

export default async function HelpCategoryPage({ params }: Props) {
  const { category, locale } = await params
  if (!isValidHelpCategory(category)) notFound()

  const t = await getTranslations({ locale, namespace: 'help' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const cat = HELP_CATEGORIES.find((c) => c.id === category)!
  const catName = t(`categories.${category}`)
  const catDesc = t(`category_descriptions.${category}`)

  return (
    <>
      <div className="help-breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: tCommon('breadcrumb.home'), to: '/' },
            { label: t('breadcrumb.help_center'), to: '/help' },
            { label: catName },
          ]}
        />
      </div>
      <HelpLayout title={catName} subtitle={catDesc}>
        <div className="help-topic-list">
          {cat.topics.map((topic) => {
            const topicTitle = t(`topics.${category}.${topic.id}.title`)
            return (
              <Link
                key={topic.id}
                href={`/help/${category}/${topic.id}`}
                className="help-topic-item"
              >
                <div>
                  <h3>{topicTitle}</h3>
                  <p>{t(`topics.${category}.${topic.id}.intro`)}</p>
                </div>
                <span className="help-topic-chevron">›</span>
              </Link>
            )
          })}
        </div>

        <div className="help-contact-cta">
          <p>{t('resolution.contact_hint')}</p>
          <Link href={`/contact?category=${encodeURIComponent(category)}`} className="help-pill">
            {t('actions.contact')}
          </Link>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link href="/help" className="help-pill help-pill-secondary">
            {t('actions.back_to_help')}
          </Link>
        </div>
      </HelpLayout>
    </>
  )
}
