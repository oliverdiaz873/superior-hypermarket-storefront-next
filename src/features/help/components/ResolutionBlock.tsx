'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import Toast from '@/ui/Toast/Toast'

interface ResolutionBlockProps {
  category: string
  topic: string
  orderId?: string
}

export default function ResolutionBlock({ category, topic, orderId }: ResolutionBlockProps) {
  const t = useTranslations('help')
  const [showThanks, setShowThanks] = useState(false)

  const contactHref = orderId
    ? (`/contact?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&orderId=${encodeURIComponent(orderId)}` as const)
    : (`/contact?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}` as const)

  return (
    <>
      <div className="help-resolution">
        <p>{t('resolution.question')}</p>
        <div className="help-resolution-actions">
          <button type="button" className="help-pill" onClick={() => setShowThanks(true)}>
            {t('resolution.yes')}
          </button>
          <Link href={contactHref} className="help-pill help-pill-secondary">
            {t('resolution.no')}
          </Link>
        </div>
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '10px',
            fontWeight: 400,
          }}
        >
          {t('resolution.contact_hint')}
        </p>
      </div>
      {showThanks && (
        <Toast
          message={t('resolution.thanks')}
          show={showThanks}
          onClose={() => setShowThanks(false)}
          type="success"
        />
      )}
    </>
  )
}
