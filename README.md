# Superior Hypermarket Storefront - Next.js

Localized hypermarket storefront built with Next.js App Router, React, TypeScript, `next-intl`, Tailwind CSS, and local static catalog data.

## System Architecture

This repository is a **Customer Storefront** of the **Hipermercado Superior** ecosystem. It consumes the centralized REST API provided by the backend.

```
                    Hipermercado Superior Ecosystem

        superior-hypermarket-api
                         Express REST API
                                  |
        -----------------------------------------------------------------
        |                           |                            |
        |                           |                            |
superior-hypermarket-    superior-hypermarket-      superior-hypermarket-
storefront-next          storefront-angular         dashboard

   Next.js Storefront         Angular Storefront      Angular Admin Dashboard
      (Customer App)            (Customer App)              (Admin App)
                                  |
                                  ▼
                             MongoDB

                  superior-hypermarket-e2e (Playwright)
                  Central E2E infrastructure for the ecosystem
```

| Repository | Type | Technology | Purpose |
|------------|------|------------|---------|
| superior-hypermarket-api | Backend API | Express + MongoDB + JWT | Central system API |
| superior-hypermarket-storefront-next | Customer Frontend | Next.js + React | Public storefront |
| superior-hypermarket-storefront-angular | Customer Frontend | Angular | Alternative public storefront |
| superior-hypermarket-dashboard | Admin Frontend | Angular + Material + NgRx Signals | Admin dashboard |
| superior-hypermarket-e2e | E2E Harness | Playwright | Centralized end-to-end testing infrastructure |

**Backend Dependency** — This application requires the backend repository
`superior-hypermarket-api`, which provides the centralized REST API for the ecosystem.

### Centralized E2E Harness

`superior-hypermarket-e2e` is the ecosystem's independent **End-to-End testing
repository (Playwright)**. It contains no business logic: it is validation
infrastructure that orchestrates and validates several repositories at once,
exercising full flows (frontend → backend → persistence → dashboard) while
centralizing fixtures, helpers, configuration, and E2E specs.

[Centralized E2E Harness - superior-hypermarket-e2e](https://github.com/oliverdiaz873/superior-hypermarket-e2e)

```
Storefronts (Next · Angular) · Admin Dashboard
        │
        ▼
superior-hypermarket-api (Express REST API)
        │
        ▼
MongoDB
```

## Documentation

Start with [docs/getting-started.md](docs/getting-started.md).

Core documentation:

- [Architecture](docs/architecture.md)
- [Folder Structure](docs/folder-structure.md)
- [Cart](docs/features/cart.md)
- [Products](docs/features/products.md)
- [Offers](docs/features/offers.md)
- [Search](docs/features/search.md)
- [Contact](docs/features/contact.md)
- [Home](docs/features/home.md)
- [Layout](docs/features/layout.md)
- [Navigation](docs/features/navigation.md)
- [Legal](docs/features/legal.md)
- [Authentication](docs/features/auth.md)

## Project Overview

The project is a frontend storefront application. Product, category, offer, and product-detail data are currently stored in local TypeScript modules under `src/services/catalog/`.

This application consumes the centralized REST API provided by
`superior-hypermarket-api`.

## Main Features

- Locale-aware routing and messages with `next-intl`.
- Home page with hero carousel, offers carousel, featured products, category banners, and about section.
- Product detail pages with server-side metadata and JSON-LD.
- Category pages built from local category and product data.
- Offers page with category filtering and discount badges.
- Client-side search from header variants and search results page.
- Client-side cart using React Context and `localStorage`.
- Contact form with client-side validation and simulated submission.
- Legal terms and privacy pages from translation content.
- Responsive desktop, tablet, and mobile navigation.

## Tech Stack

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- `next-intl`
- `framer-motion`
- Tailwind CSS through `@tailwindcss/postcss`
- ESLint with Next.js Core Web Vitals and TypeScript rules

## Project Structure

```text
src/
|-- app/        # App Router route tree
|-- features/   # Feature-oriented modules
|-- hooks/      # Shared hooks directory, currently empty
|-- i18n/       # next-intl routing and request configuration
|-- lib/        # Shared utilities
|-- services/   # Local catalog data services
|-- types/      # Shared TypeScript types
|-- ui/         # Reusable UI components
`-- proxy.ts    # next-intl middleware/proxy
```

## Getting Started

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run build
npm run start
npm run lint
npm run validate
npm run check:i18n
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
