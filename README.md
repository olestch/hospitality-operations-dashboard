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
npm run build
```

## Project structure

The application uses feature-based modules. Application-wide layout and routing live in
`src/app`, feature entry pages live in `src/modules`, reusable building blocks live in
`src/shared`, and future development-only mock infrastructure belongs in `src/mocks`.
