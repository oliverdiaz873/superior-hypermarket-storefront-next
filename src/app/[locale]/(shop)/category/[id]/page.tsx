import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import CategoryPageClient from '../../_components/CategoryPageClient';
import { fetchCategories, getAllCategoryProducts, mapApiProductsToProducts, fetchOffers, type ApiLang } from '@/lib/api-client';
import type { Category } from '@/types/category';
import { getCategoryName, getSubcategoryName } from '@/lib';

const subcategorySlugFromHref = (href: string): string => href.split('/').filter(Boolean).pop() ?? '';

/**
 * Hypermarket category page.
 * F5.3: categorías desde la API real (GET /categories) identificadas por slug;
 * los productos por subcategoría se obtienen respetando la paginación del backend.
 */
type CategoryPageProps = {
    params: Promise<{ id: string; subcategory?: string }>;
};

async function getCategoryBySlug(id: string): Promise<Category | undefined> {
    const categories = await fetchCategories();
    if (categories.length === 0) {
        console.error('[getCategoryBySlug] fetchCategories returned empty — possible API failure', { id, apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api' });
        // No silenciar: si la API falló, propagar error observable en lugar de 404
        throw new Error('Failed to fetch categories');
    }
    const found = categories.find((category) => category.id === id);
    if (!found) {
        console.error('[getCategoryBySlug] category not found', { id, availableIds: categories.map((c) => c.id) });
    }
    return found;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { id } = await params;
    const category = await getCategoryBySlug(id);

    if (!category) {
        const t = await getTranslations('categories');
        return {
            title: t('not_found'),
            description: t('not_found_description'),
            robots: { index: false, follow: false },
        };
    }

    const canonicalUrl = `https://www.hipermercadosuperior.com/category/${category.id}`;
    const t = await getTranslations('categories');
    const catName = getCategoryName(category, t);
    const subcategoryNames = category.subcategories.map(s => getSubcategoryName(s, t)).join(', ');
    const description = t('seo.description', { name: catName, subcategories: subcategoryNames });

    return {
        title: catName,
        description,
        keywords: [category.id.toLowerCase(), ...subcategoryNames.toLowerCase().split(', ')],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${catName} | Hipermercado Superior`,
            description,
            url: canonicalUrl,
            type: 'website',
            siteName: 'Hipermercado Superior',
            locale: 'es_DO',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${catName} | Hipermercado Superior`,
            description,
        },
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { id, subcategory } = await params;const category = await getCategoryBySlug(id);

    if (!category) {
        notFound();
    }

    const t = await getTranslations('categories');
    const catName = getCategoryName(category, t);
    const description = t('seo.description', { name: catName, subcategories: category.subcategories.map((s) => getSubcategoryName(s, t)).join(', ') });

    // F5.4: ofertas reales (GET /offers) para enriquecer los badges de los grids.
    // H1: fetchOffers nunca lanza — un fallo de /offers degrada a "sin badges" sin romper la página.
    const locale = (await getLocale()) as ApiLang;
    const offers = await fetchOffers(locale);
    const offerMap = new Map(offers.map((offer) => [offer.id, offer]));
    const withOffer = <T extends { id: string }>(product: T) => {
        const offer = offerMap.get(product.id);
        return offer
            ? { ...product, oldPrice: offer.oldPrice, discountPercentage: offer.discountPercentage }
            : product;
    };

    // F5.3: obtener todos los productos por subcategoría respetando la paginación del backend
    const visibleSubcategories = subcategory
        ? category.subcategories.filter((item) => subcategorySlugFromHref(item.href) === subcategory)
        : category.subcategories;
    if (subcategory && visibleSubcategories.length === 0) notFound();

    const sections = await Promise.all(
        visibleSubcategories.map(async (subcategory) => {
            const slug = subcategorySlugFromHref(subcategory.href);
            const rawProducts = await getAllCategoryProducts(slug, 100, locale);
            const sectionProducts = mapApiProductsToProducts(rawProducts).map(withOffer);

            return {
                slug,
                title: getSubcategoryName(subcategory, t),
                products: sectionProducts,
            };
        })
    );

    const filteredSections = sections.filter((section) => section.products.length > 0);

    // Generar JSON-LD para SEO estructurado
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: catName,
        description,
        url: `https://www.hipermercadosuperior.com/category/${category.id}`,
        mainEntity: {
            '@type': 'ItemList',
            name: catName,
            numberOfItems: filteredSections.reduce((acc, s) => acc + s.products.length, 0),
            itemListElement: category.subcategories.map((subcategory, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: getSubcategoryName(subcategory, t),
                url: `https://www.hipermercadosuperior.com/category/${category.id}/${subcategorySlugFromHref(subcategory.href)}`,
            })),
        },
        provider: {
            '@type': 'Organization',
            name: 'Hipermercado Superior',
            url: 'https://www.hipermercadosuperior.com',
        },
    };

    return (
        <>
            {/* JSON-LD para Google Search Console */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CategoryPageClient category={category} sections={filteredSections} />
        </>
    );
}

