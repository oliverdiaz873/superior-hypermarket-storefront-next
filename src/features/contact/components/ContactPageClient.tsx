"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ContactForm from '@/features/contact/components/ContactForm';
import Toast from '@/ui/Toast/Toast';
import type { Order } from '@/types/order';
import type { AuthUser } from '@/features/auth/types';
import '@/features/help/components/HelpLayout.css';

interface ContactPageClientProps {
  helpCategory?: string;
  helpTopic?: string;
  initialOrderId?: string;
  orders?: Order[];
  user?: AuthUser | null;
}

export default function ContactPageClient({ helpCategory, helpTopic, initialOrderId, orders = [], user = null }: ContactPageClientProps) {
    const t = useTranslations('contact');
    const tHelp = useTranslations('help');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        document.body.classList.add('dark-theme-body');
        return () => {
            document.body.classList.remove('dark-theme-body');
        };
    }, []);

    const showHelpBanner = !helpCategory;
    const isAuthenticated = Boolean(user);

    return (
        <section id="contacto" className="w-full px-4 py-1 md:py-1 lg:py-1 flex justify-center">
            <main className="contacto-container w-full max-w-[550px] md:max-w-[700px] lg:max-w-[750px] xl:max-w-[800px] mx-auto my-3 md:my-10 lg:my-5 p-5 md:p-8 lg:p-9 xl:p-10 rounded-lg bg-[#1a1a1c] border border-white/10 text-white shadow-2xl">
                {showHelpBanner && (
                    <div className="help-contact-banner" style={{ marginBottom: '20px' }}>
                        {tHelp('contact_context.banner')} <Link href="/help">{tHelp('actions.go_help')} →</Link>
                    </div>
                )}
                <ContactForm
                    onSuccess={() => setShowToast(true)}
                    helpCategory={helpCategory}
                    helpTopic={helpTopic}
                    initialOrderId={initialOrderId}
                    orders={orders}
                    isAuthenticated={isAuthenticated}
                    initialName={user?.name}
                    initialEmail={user?.email}
                />

                <section className="contacto-info mt-5 md:mt-5">
                    <h2 className="text-xl md:text-2xl text-center mb-6 md:mb-8 pt-4 md:pt-6">{t('info.title')}</h2>
                    <div className="info-item text-center mb-4">
                        <p className="text-white/90 text-[0.95rem] leading-normal"><strong className="mr-2">{t('info.email_label')}</strong> soporte@hipermercadosuperior.com</p>
                    </div>
                    <div className="info-item text-center mb-4">
                        <p className="text-white/90 text-[0.95rem] leading-normal"><strong className="mr-2">{t('info.phone_label')}</strong> +1 (809) 555-5555</p>
                    </div>
                    <div className="info-item text-center mb-4">
                        <p className="text-white/90 text-[0.95rem] leading-normal"><strong className="mr-2">{t('info.hours_label')}</strong> {t('info.hours_text')}</p>
                    </div>
                </section>
            </main>

            {showToast && (
                <Toast
                    message={t('form.success_toast')}
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    type="success"
                />
            )}
        </section>
    );
}
