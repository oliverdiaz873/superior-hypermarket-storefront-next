import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import ProductPageClient from '../../_components/ProductPageClient';
import { getProduct, getProducts, mapApiProductToProduct, mapApiProductsToProducts, fetchOffers, fetchCategories, type ApiLang, type OfferProduct, ApiRequestError } from '@/lib/api-client';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';

type ProductPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { id } = await params;
    
    try {
        const locale = (await getLocale()) as ApiLang;
        const { data: product } = await getProduct(id, locale);

        if (!product) {
            const t = await getTranslations('common.product');
            return {
                title: t('not_found'),
                description: t('not_found_description'),
                robots: { index: false, follow: false },
            };
        }

        const mappedProduct = mapApiProductToProduct(product);
        const t = await getTranslations('common.product');
        const description = product.description ?? t('fallback_description', { name: mappedProduct.name });

        return {
            title: mappedProduct.name,
            description,
            openGraph: {
                title: mappedProduct.name,
                description,
                url: `https://www.hipermercadosuperior.com/product/${mappedProduct.id}`,
                type: 'website',
                siteName: 'Hipermercado Superior',
                locale: 'es_DO',
                images: [
                    {
                        url: mappedProduct.imagen.startsWith('http') 
                            ? mappedProduct.imagen 
                            : `https://www.hipermercadosuperior.com${mappedProduct.imagen}`,
                        width: 1200,
                        height: 630,
                        alt: mappedProduct.name,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: mappedProduct.name,
                description,
                images: [mappedProduct.imagen.startsWith('http') 
                    ? mappedProduct.imagen 
                    : `https://www.hipermercadosuperior.com${mappedProduct.imagen}`],
            },
        };
    } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
            const t = await getTranslations('common.product');
            return {
                title: t('not_found'),
                description: t('not_found_description'),
                robots: { index: false, follow: false },
            };
        }
        console.error('[ProductDetail] metadata pipeline failed', { id, error });
        throw error;
    }
}

/**
 * ProductPage - Server Component para la vista individual de un producto.
 * 
 * F5.2/F5.3: usa la API real (GET /products/:id?lang= y GET /categories).
 * Obtiene el producto, sus relacionados (misma categoría) y las categorías para el breadcrumb.
 * El fetch se envuelve en try/catch; el JSX se construye fuera para cumplir la regla de lint
 * react-hooks/error-boundaries (notFound() nunca retorna, por lo que no hay flujo no inicializado).
 */
export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    let mappedProduct: OfferProduct;
    let relatedProducts: Product[];
    let categories: Category[];
    let jsonLd: Record<string, unknown>;

    const locale = (await getLocale()) as ApiLang;
    let product;
    try {
        const response = await getProduct(id, locale);
        product = response.data;
    } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
            notFound();
        }
        console.error('[ProductDetail] getProduct failed', { id, locale, error });
        throw error;
    }

    if (!product) {
        notFound();
    }

    try {

        mappedProduct = mapApiProductToProduct(product);

        // F5.4: ofertas reales (GET /offers) para enriquecer el badge de precio del producto y sus relacionados.
        // H1: fetchOffers nunca lanza — un fallo de /offers no convierte la página en 404/500.
        const offers = await fetchOffers(locale);
        const offerMap = new Map(offers.map((offer) => [offer.id, offer]));

        const productOffer = offerMap.get(mappedProduct.id);
        if (productOffer) {
            mappedProduct = {
                ...mappedProduct,
                precio: productOffer.precio,
                precioTexto: productOffer.precioTexto,
                oldPrice: productOffer.oldPrice,
                discountPercentage: productOffer.discountPercentage,
            };
        }

        // F5.3: categorías reales para el breadcrumb (buscar la subcategoría que corresponde al producto)
        categories = await fetchCategories();

        // Obtener productos relacionados de la misma categoría (máx 8)
        const { data: relatedRaw } = await getProducts({ category: mappedProduct.categoria, limit: 50, lang: locale });
        relatedProducts = mapApiProductsToProducts(relatedRaw)
            .filter((item) => item.id !== mappedProduct.id)
            .slice(0, 8)
            .map((item) => {
                const offer = offerMap.get(item.id);
                return offer
                    ? {
                          ...item,
                          precio: offer.precio,
                          precioTexto: offer.precioTexto,
                          oldPrice: offer.oldPrice,
                          discountPercentage: offer.discountPercentage,
                      }
                    : item;
            });

        // Generar JSON-LD para SEO estructurado del producto
        jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: mappedProduct.name,
            description: product.description ?? `Compra ${mappedProduct.name} en Hipermercado Superior.`,
            image: mappedProduct.imagen.startsWith('http') 
                ? mappedProduct.imagen 
                : `https://www.hipermercadosuperior.com${mappedProduct.imagen}`,
            sku: mappedProduct.id,
            brand: {
                '@type': 'Brand',
                name: 'Hipermercado Superior',
            },
            offers: {
                '@type': 'Offer',
                url: `https://www.hipermercadosuperior.com/product/${mappedProduct.id}`,
                priceCurrency: 'DOP',
                price: mappedProduct.precio,
                itemCondition: 'https://schema.org/NewCondition',
                availability: 'https://schema.org/InStock',
            },
        };
    } catch (error) {
        console.error('[ProductDetail] post-product pipeline failed', { id, locale, error });
        throw error;
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductPageClient product={mappedProduct} relatedProducts={relatedProducts} categories={categories} />
        </>
    );
}
