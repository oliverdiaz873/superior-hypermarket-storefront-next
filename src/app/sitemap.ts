import { MetadataRoute } from 'next'
import { categories } from '@/services/catalog/categories'
import { products } from '@/services/catalog/products'
import { HELP_CATEGORIES } from '@/features/help/help.content'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.hipermercadosuperior.com'
  const locales = ['es', 'en']

  // Static pages con i18n
  const helpRoutes = [
    '/help',
    ...HELP_CATEGORIES.map((c) => `/help/${c.id}`),
    ...HELP_CATEGORIES.flatMap((c) => c.topics.map((t) => `/help/${c.id}/${t.id}`)),
  ]

  const staticPages = locales.flatMap((locale) =>
    [
      '',
      '/offers',
      '/contact',
      '/legal/privacy',
      '/legal/terms',
      ...helpRoutes,
    ].map((route) => {
      let priority = 0.8
      if (route === '') priority = 1
      else if (route === '/help') priority = 0.8
      else if (route.split('/').length === 3 && route.startsWith('/help/')) priority = 0.6
      else if (route.split('/').length === 4 && route.startsWith('/help/')) priority = 0.5
      return {
        url: `${baseUrl}${locale === 'es' ? '' : '/en'}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority,
        alternates: {
          languages: {
            es: `${baseUrl}${route}`,
            en: `${baseUrl}/en${route}`,
          },
        },
      }
    })
  )

  // Category pages con i18n
  const categoryPages = locales.flatMap((locale) =>
    categories.map((category) => ({
      url: `${baseUrl}${locale === 'es' ? '' : '/en'}/category/${category.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          es: `${baseUrl}/category/${category.id}`,
          en: `${baseUrl}/en/category/${category.id}`,
        },
      },
    }))
  )

  // Product pages con i18n
  const productPages = locales.flatMap((locale) =>
    products.map((product) => ({
      url: `${baseUrl}${locale === 'es' ? '' : '/en'}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
      alternates: {
        languages: {
          es: `${baseUrl}/product/${product.id}`,
          en: `${baseUrl}/en/product/${product.id}`,
        },
      },
    }))
  )

  return [...staticPages, ...categoryPages, ...productPages]
}
