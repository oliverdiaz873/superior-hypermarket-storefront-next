# Help Center

## Status

Implemented.

## Overview

The Help Center is a public self-service hub available at `/{locale}/help`. It provides categorized help articles that guide users before contacting support. Content is static and defined in `help.content.ts` and `messages/{locale}.json` (no CMS or backend search).

Structure: 7 categories and 21 topics.
- `orders`: track, cancel, address, late-delivery
- `returns`: policy, damaged, refund
- `account`: create, login, data, logout
- `payments`: methods, pending, invoice
- `products`: availability, offers, search
- `stores`: contact, pickup
- `other`: privacy, other

Navigation flow follows an e-commerce pattern: `Footer → Help Center → Category → Topic → Resolution → Contact`.

## Primary Files

- `src/features/help/help.content.ts` — category/topic allowlist and helpers `isValidHelpCategory`, `isValidHelpTopic`
- `src/features/help/components/HelpLayout.tsx` — dark-theme shell (`dark-theme-body`) for help pages
- `src/features/help/components/HelpLayout.css` — grid, cards, article, resolution styles
- `src/features/help/components/ResolutionBlock.tsx` — `Was this helpful?` with `Yes` (Toast) / `No` (Contact)
- `src/app/[locale]/(shop)/help/page.tsx` — help index, public, session-aware banner
- `src/app/[locale]/(shop)/help/[category]/page.tsx` — category page, validates `isValidHelpCategory`
- `src/app/[locale]/(shop)/help/[category]/[topic]/page.tsx` — topic article, validates `isValidHelpTopic`
- `src/app/[locale]/(shop)/help/loading.tsx`, `[category]/loading.tsx`, `[category]/[topic]/loading.tsx` — skeletons
- `messages/es.json` / `messages/en.json` `help` namespace — titles, SEO, intros, steps, notes, actions

## Routes

| Route | File | Access | SEO |
| --- | --- | --- | --- |
| `/{locale}/help` | `src/app/[locale]/(shop)/help/page.tsx` | Public (session optional for banner) | `seo.index` + keywords |
| `/{locale}/help/[category]` | `src/app/[locale]/(shop)/help/[category]/page.tsx` | Public, `isValidHelpCategory` else `notFound()` + `robots noindex` | `seo.category` template + canonical + alternates `es/en` |
| `/{locale}/help/[category]/[topic]` | `src/app/[locale]/(shop)/help/[category]/[topic]/page.tsx` | Public, `isValidHelpTopic` else `notFound()` | `topics.*.seo` + canonical + alternates `es/en` |

Invalid categories or topics return `notFound()` and `robots: { index: false, follow: false }`.

## Page Flow

1. `help/page.tsx` loads `getSession()` only to show `View my orders` (authenticated) or `Sign in` (anonymous) banner — no redirect.
2. Category page renders `HelpLayout` with `Breadcrumb` (`Home > Help Center > Category`) and topic list.
3. Topic page renders article (`intro`, `steps` with numbered pills, `note`, `related`), quick actions (`Contact support`, `View my orders` for orders), `ResolutionBlock` (`Yes` → Toast `help.resolution.thanks`, `No` → `/contact?category&topic&orderId`), and back links.
4. Breadcrumbs use `src/ui/Breadcrumb/Breadcrumb.tsx` with localized labels `common.breadcrumb.home` and `help.breadcrumb.help_center`.

## Contact Context

Help articles link to the existing contact feature with context:

```
/contact?category={category}&topic={topic}&orderId={orderId}
```

- `src/app/[locale]/(shop)/contact/page.tsx` validates `isValidHelpTopic` — arbitrary values are ignored.
- `ContactPageClient` shows `help.contact_context.banner` when no help context, otherwise chips (`category › topic` + `Order: #orderNumber`) and order selector.
- `ContactForm` handles `orderId` as technical ID and displays `orderNumber` visible (`Order: #ORD-XXX`). Authenticated users see a select populated via `getServerOrders()` (all orders); anonymous users see a generic text input.
- Message is sent via `sendContactMessage` (`src/lib/api-client.ts`) with prefix `[category/topic][pedido:orderId] ` + user message — `ApiContactPayload` unchanged.

## i18n

Help is fully localized via `next-intl`:
- Locales `es` (default without prefix) and `en` (`/en` prefix) via `src/i18n/routing.ts` and `src/proxy.ts`.
- Namespace `help` in `messages/es.json` and `messages/en.json` maintains parity for 7 categories and 21 topics.
- Account help card uses `auth.account.help_cta` / `help_description` (ES/EN) and links to `href="/help"` (localized automatically).
- Footer Help section links to `help.links.help_center` and `help.links.contact`; navigation uses `Link` from `src/i18n/routing.ts`.

## Sitemap & SEO

- `src/app/sitemap.ts` generates `helpRoutes` from `HELP_CATEGORIES` (29 routes: `/help` + 7 categories + 21 topics) × 2 locales = 58 help URLs.
- Priorities: `/help` 0.8, `/help/[category]` 0.6, `/help/[category]/[topic]` 0.5, `weekly` + `alternates { es, en }`.
- `src/app/robots.ts` allows `allow: '/'` and `disallow: ['/cart','/api/']` — `/help` is indexable.
- Category/topic pages set `canonical` localized per locale and `alternates.languages`.

## Current Limitations

- Content is static in `messages` and `help.content.ts` — no CMS or admin editing.
- No search within Help Center (placeholder `help.hero.search_placeholder` exists but not implemented).
- No Help-specific tests (`help.content.test.ts` not present).
- Some i18n keys remain orphaned (`footer.links.help_orders`, `header.nav.help`, `help.empty`).
- `/help` index lacks explicit `canonical` in `generateMetadata` (subroutes have it).
