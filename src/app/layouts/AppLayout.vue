<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const navigation = [
  { label: 'Overview', to: '/' },
  { label: 'Bookings', to: '/bookings' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Quality', to: '/quality' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Profile', to: '/profile' },
]
</script>

<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <RouterLink class="app-brand" to="/">
        <span class="app-brand__mark" aria-hidden="true">H</span>
        <span>
          <strong>Hospitality</strong>
          <small>Operations</small>
        </span>
      </RouterLink>

      <nav class="app-nav" aria-label="Main navigation">
        <RouterLink v-for="item in navigation" :key="item.to" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
