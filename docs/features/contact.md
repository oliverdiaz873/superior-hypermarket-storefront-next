# Contact

## Status

Implemented.

## Overview

The contact feature renders a localized contact form, client-side validation, contact information, and a success toast. The current submission flow is simulated unless a caller provides a custom `onSubmit` callback.

## Primary Files

- `src/app/[locale]/(shop)/contact/page.tsx`
- `src/features/contact/components/ContactPageClient.tsx`
- `src/features/contact/components/ContactForm.tsx`
- `src/features/contact/hooks/useFormValidation.ts`
- `src/ui/Toast/Toast.tsx`

## Route Flow

1. `contact/page.tsx` generates metadata from the `contact` translation namespace.
2. The page renders `ContactPageClient`.
3. `ContactPageClient` applies a temporary `dark-theme-body` class to `document.body`.
4. `ContactForm` renders localized fields and delegates state to `useFormValidation`.
5. On successful submission, `ContactPageClient` displays a success `Toast`.

## Form State

`useFormValidation` stores:

- `nombre`
- `email`
- `telefono`
- `mensaje`
- `errors`
- `isSubmitting`

Validation runs on input changes and on submit.

## Validation Rules

- Name is required, must be between 2 and 50 characters, and must match the configured alphabetic pattern.
- Email is required, limited to 254 characters, and checked with an email regex.
- Phone is optional, but if provided it must contain 8 to 15 digits after removing spaces, dashes, and parentheses.
- Message is required and must be between 10 and 500 characters.

## Contact Context (Help Center)

When accessed via `GET /contact?category={category}&topic={topic}&orderId={orderId}`, `contact/page.tsx` validates `isValidHelpTopic` and pre-fills help context. `ContactPageClient` shows chips (`category › topic` + `Order: #orderNumber`) and `ContactForm` handles `orderId` as technical ID (displays `orderNumber`), pre-fills `name/email` for authenticated users, and shows an order selector (authenticated, all orders) or generic input (anonymous). Message is sent via `POST /api/contact` (`src/lib/api-client.ts`) with prefix `[category/topic][pedido:orderId]` + user message; see `docs/features/help.md`.

## Submission Behavior

`ContactForm` passes an async callback into `useFormValidation`. The callback sends `POST /api/contact` via `sendContactMessage`, handles `429` rate limiting, and resets the form on success. `useFormValidation` supports `initialData` for pre-fill.

## Current Limitations

- Contact messages are persisted via backend but have no admin UI in this storefront.
- Rate limiting is backend-enforced (`429`).
