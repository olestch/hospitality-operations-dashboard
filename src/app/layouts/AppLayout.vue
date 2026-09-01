<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { primaryNavigation } from '@/app/navigation'
import BaseSelect, { type SelectOption, type SelectValue } from '@/shared/ui/BaseSelect.vue'

const route = useRoute()
const isNavigationOpen = ref(false)
const selectedProperty = ref<SelectValue | null>(null)
const propertyOptions: readonly SelectOption[] = []
const pageTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Dashboard',
)

function closeNavigation() {
  isNavigationOpen.value = false
}
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') closeNavigation()
}

watch(() => route.fullPath, closeNavigation)
onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div class="app-shell">
    <aside id="primary-navigation" class="app-sidebar" :class="{ 'is-open': isNavigationOpen }">
      <RouterLink class="app-brand" to="/" @click="closeNavigation">
        <span class="app-brand__mark" aria-hidden="true">H</span>
        <span><strong>Hospitality Operations</strong><small>Management workspace</small></span>
      </RouterLink>

      <nav class="app-nav" aria-label="Main navigation">
        <p class="app-nav__label">Workspace</p>
        <RouterLink
          v-for="item in primaryNavigation"
          :key="item.to"
          class="app-nav__link"
          :to="item.to"
          @click="closeNavigation"
          >{{ item.label }}</RouterLink
        >
      </nav>
      <div class="app-sidebar__footer">Portfolio foundation · Phase 2</div>
    </aside>

    <button
      class="app-backdrop"
      :class="{ 'is-visible': isNavigationOpen }"
      type="button"
      aria-label="Close navigation"
      :tabindex="isNavigationOpen ? 0 : -1"
      @click="closeNavigation"
    />

    <div class="app-body">
      <header class="app-header">
        <div class="app-header__leading">
          <button
            class="app-menu-button"
            type="button"
            aria-label="Open navigation"
            aria-controls="primary-navigation"
            :aria-expanded="isNavigationOpen"
            @click="isNavigationOpen = true"
          >
            <span aria-hidden="true" />
          </button>
          <p class="app-header__title">{{ pageTitle }}</p>
        </div>

        <div class="app-header__actions">
          <div class="app-header__property">
            <BaseSelect
              v-model="selectedProperty"
              aria-label="Property"
              :options="propertyOptions"
              placeholder="Select property"
            />
          </div>
          <RouterLink class="app-header__profile" to="/profile" aria-label="Open profile">
            <span class="app-header__avatar" aria-hidden="true">OP</span><span>Profile</span>
          </RouterLink>
        </div>
      </header>

      <main class="app-main"><RouterView /></main>
    </div>
  </div>
</template>
