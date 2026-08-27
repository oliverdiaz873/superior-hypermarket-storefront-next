import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { IMAGE_REMOTE_PATTERNS } from './src/lib/image-remote-patterns.ts'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/category/carnes-pescados-mariscos',
        destination: '/es/category/alimentos/carnes-pescados-mariscos',
        permanent: true,
      },
      {
        source: '/:locale/category/carnes-pescados-mariscos',
        destination: '/:locale/category/alimentos/carnes-pescados-mariscos',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [{ source: '/uploads/:path*', destination: 'http://localhost:3000/uploads/:path*' }]
  },
  images: {
    remotePatterns: IMAGE_REMOTE_PATTERNS,
    // Next 16 bloquea por SSRF upstreams que resuelven a IP privada.
    // En dev el storage del backend es localhost, así que se permite solo en
    // desarrollo; en prod se exige CDN/bucket público y permanece prohibido.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
}

export default withNextIntl(nextConfig)
