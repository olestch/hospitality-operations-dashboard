# Hospitality Operations Dashboard

A clean application foundation for a portfolio project focused on hospitality operations.

## Stack

- Vue 3 with the Composition API and `<script setup lang="ts">`
- TypeScript
- Vite
- Pinia
- Vue Router
- SCSS
- ESLint
- Prettier

## Development

```sh
npm install
npm run dev
```

## Quality checks

```sh
npm run lint
npm run format:check
npm run test
npm run build
```

## Project structure

The application uses feature-based modules. Application-wide layout and routing live in
`src/app`, feature entry pages and feature-specific domain types live in `src/modules`, and
reusable UI, API utilities, and shared domain concepts live in `src/shared`.

The data layer is split into three boundaries:

1. Typed domain models describe the application concepts.
2. Feature repositories expose focused asynchronous query functions.
3. A data-provider contract is currently implemented by the deterministic mock provider in
   `src/mocks` and can later be replaced by an HTTP implementation.

Vue components do not import raw mock arrays. Loading and error state belong to stores or
features; the first implementation is the Pinia property workspace store.

The Settings route exposes the current demo profile and a deliberately small set of browser-local
workspace preferences. Preferred property is shared with the global property store; density and
motion settings affect the application shell without simulating server-side account management.

## Demo data

All names, identifiers, locations, and operational values are fictional. The fixed demo period
is **2025-01-01 through 2025-03-31**, so results remain stable regardless of the current date.
Daily metrics are derived deterministically from this fixed period; no runtime randomness or
real backend connection is used.

Chart-heavy routes are lazy-loaded and ApexCharts is imported asynchronously inside chart
components. Its separate production chunk remains intentionally larger than Vite's default warning
threshold; keeping the established accessible chart implementation is preferable to hiding the
warning or replacing the library during this polish phase.
