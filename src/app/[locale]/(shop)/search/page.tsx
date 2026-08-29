import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import SearchPageClient from '@/features/search/components/SearchPageClient';
import { search, mapApiProductsToProducts, fetchOffers, type ApiLang, type OfferProduct } from '@/lib/api-client';

type SearchPageProps = {
    searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const params = await searchParams;
    const query = Array.isArray(params.q) ? params.q[0] : params.q;
    const t = await getTranslations('search');

    return {
        title: query
            ? t('seo.title_query', { query })
            : t('seo.title_empty'),
        description: query ? t('seo.desc_query', { query }) : t('seo.desc_empty'),
        keywords: t('seo.keywords'),
        robots: { index: false, follow: false },
    };
}

/**
 * SearchPage - Server Component de /search.
 *
 * F5.3.2: resultados desde la API real (GET /search?q=...&lang=...) en el
 * servidor. F5.4: los resultados se enriquecen con el badge de oferta real
 * (GET /offers) join por id, también en el servidor. El guard de query vacía
 * evita llamar al backend (que responde 400 cuando `q` llega vacío). El loading
 * lo cubre el skeleton de la ruta (`search/loading.tsx`) y el estado de error se
 * propaga al cliente para mostrar un empty-state de fallo sin tumbar la página.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';
    const cleanQuery = query.trim();

    let results: OfferProduct[] = [];
    let error = false;

    if (cleanQuery) {
        const locale = (await getLocale()) as ApiLang;
        try {
            // H2: fetchOffers nunca lanza — un fallo de /offers no debe ocultar los resultados
            // válidos de búsqueda; solo `search` es fatal y propaga error al cliente.
            const [{ data }, offers] = await Promise.all([
                search({ q: cleanQuery }, locale),
                fetchOffers(locale),
            ]);
            const offerMap = new Map(offers.map((offer) => [offer.id, offer]));
            results = mapApiProductsToProducts(data).map((product) => {
                const offer = offerMap.get(product.id);
                return offer
                    ? {
                          ...product,
                          precio: offer.precio,
                          precioTexto: offer.precioTexto,
                          oldPrice: offer.oldPrice,
                          discountPercentage: offer.discountPercentage,
                      }
                    : product;
            });
        } catch {
            error = true;
        }
    }

    return <SearchPageClient query={query} results={results} error={error} />;
}