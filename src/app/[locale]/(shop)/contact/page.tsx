import type { Metadata } from 'next';
import ContactPageClient from '@/features/contact/components/ContactPageClient';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/features/auth/session';
import { getServerOrders } from '@/features/orders/server/get-server-orders';
import { isValidHelpTopic } from '@/features/help/help.content';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('contact');
    return {
        title: t('seo.title'),
        description: t('seo.description'),
        keywords: t('seo.keywords'),
    };
}

type ContactPageProps = {
    searchParams: Promise<{ category?: string; topic?: string; orderId?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
    const { category, topic, orderId } = await searchParams;

    let helpCategory: string | undefined;
    let helpTopic: string | undefined;
    if (category && topic && isValidHelpTopic(category, topic)) {
        helpCategory = category;
        helpTopic = topic;
    }

    const user = await getSession();
    const orders = user ? await getServerOrders() : [];

    const initialOrderId = helpCategory && orderId?.trim() ? orderId.trim() : undefined;

    return (
        <ContactPageClient
            helpCategory={helpCategory}
            helpTopic={helpTopic}
            initialOrderId={initialOrderId}
            orders={orders}
            user={user}
        />
    );
}
