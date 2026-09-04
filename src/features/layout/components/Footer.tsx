import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { FacebookIcon, XIcon, InstagramIcon } from '@/ui/Icons'
import './Footer.css'

export default async function Footer() {
    const t = await getTranslations('footer');
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer-global">
            <div className="footer-content">
                <div className="footer-grid">
                    <div className="footer-section">
                        <h4 className="footer-section-title">{t('sections.help')}</h4>
                        <Link href="/help" title={t('links.help_center')}>
                            {t('links.help_center')}
                        </Link>
                        <Link href="/contact" title={t('links.contact')}>
                            {t('links.contact')}
                        </Link>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-section-title">{t('sections.account')}</h4>
                        <Link href="/account" title={t('links.account')}>
                            {t('links.account')}
                        </Link>
                        <Link href="/orders" title={t('links.orders')}>
                            {t('links.orders')}
                        </Link>
                        <Link href="/addresses" title={t('links.addresses')}>
                            {t('links.addresses')}
                        </Link>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-section-title">{t('sections.legal')}</h4>
                        <Link href="/legal/privacy" title={t('links.privacy')}>
                            {t('links.privacy')}
                        </Link>
                        <Link href="/legal/terms" title={t('links.terms')}>
                            {t('links.terms')}
                        </Link>
                    </div>
                </div>

                <div className="social-icons">
                    <a
                        href="#"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        aria-label={t('social.facebook')}
                        className="social-link"
                        title="Facebook"
                    >
                        <FacebookIcon />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        aria-label={t('social.x')}
                        className="social-link"
                        title="X (Twitter)"
                    >
                        <XIcon />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        aria-label={t('social.instagram')}
                        className="social-link"
                        title="Instagram"
                    >
                        <InstagramIcon />
                    </a>
                </div>

                <small>
                    &copy; {currentYear} {t('company_name')}. {t('rights_reserved')}
                </small>
            </div>
        </footer>
    )
}


