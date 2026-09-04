import type { Metadata } from "next";
import "../globals.css";
import { domine } from "../../fonts";

export const metadata: Metadata = {
  title: {
    default: "Hipermercado Superior | Calidad y Variedad",
    template: "%s | Hipermercado Superior",
  },
  description: "Tu hipermercado de confianza con la mejor selección de alimentos, tecnología, electrodomésticos y más.",
  keywords: ["hipermercado", "compras online", "ofertas", "supermercado", "tecnologia", "alimentos"],
  authors: [{ name: "Hipermercado Superior" }],
  creator: "Hipermercado Superior",
  publisher: "Hipermercado Superior",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.hipermercadosuperior.com"),
  alternates: {
    canonical: "https://www.hipermercadosuperior.com",
    languages: {
      "es": "https://www.hipermercadosuperior.com",
      "en": "https://www.hipermercadosuperior.com/en",
      "x-default": "https://www.hipermercadosuperior.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "https://www.hipermercadosuperior.com",
    siteName: "Hipermercado Superior",
    title: "Hipermercado Superior | Calidad y Variedad",
    description: "Tu hipermercado de confianza con la mejor selección de alimentos, tecnología, electrodomésticos y más.",
    images: [
      {
        url: "/assets/images/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Hipermercado Superior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hipermercado Superior | Calidad y Variedad",
    description: "Tu hipermercado de confianza con la mejor selección de alimentos, tecnología, electrodomésticos y más.",
    images: ["/assets/images/logo/logo.png"],
  },
  icons: {
    icon: [
      { url: "/assets/icons/favicons/icon-16x16.jpg", sizes: "16x16", type: "image/jpeg" },
      { url: "/assets/icons/favicons/icon-32x32.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/assets/icons/favicons/icon-48x48.jpg", sizes: "48x48", type: "image/jpeg" },
    ],
    apple: [
      { url: "/assets/icons/favicons/icon-48x48.jpg" },
    ],
  },
};

import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Footer from "@/features/layout/components/Footer";
import CartLayout from "./_components/CartLayout";
import { fetchCategories } from '@/lib/api-client';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
}>) {
  const { locale } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  // F5.3: categorías reales desde el backend (GET /categories), mapeadas al storefront.
  // Se fetchean en el servidor y se pasan como props al header (client components).
  const categories = await fetchCategories();

  return (
    <html lang={locale} className="h-full">
      <body className={`${domine.variable} min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <CartLayout categories={categories}>
            {children}
          </CartLayout>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
