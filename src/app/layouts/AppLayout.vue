<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { primaryNavigation } from '@/app/navigation'
import { usePreferencesStore } from '@/app/stores/preferencesStore'
import { usePropertyStore } from '@/app/stores/propertyStore'
import { useProfileStore } from '@/modules/profile/stores/profileStore'
import BaseSelect, { type SelectOption, type SelectValue } from '@/shared/ui/BaseSelect.vue'

const route = useRoute()
const propertyStore = usePropertyStore()
const preferencesStore = usePreferencesStore()
const profileStore = useProfileStore()
const isNavigationOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const sidebar = ref<HTMLElement | null>(null)
const propertyOptions = computed<readonly SelectOption[]>(() =>
  propertyStore.properties.map((property) => ({ label: property.name, value: property.id })),
)
const selectedProperty = computed<SelectValue | null>({
  get: () => propertyStore.selectedPropertyId,
  set: (value) => {
    if (typeof value === 'string') propertyStore.selectProperty(value)
  },
})
const pageTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Dashboard',
)

function closeNavigation(restoreFocus = false) {
  isNavigationOpen.value = false
  if (restoreFocus) void nextTick(() => menuButton.value?.focus())
}
function openNavigation() {
  isNavigationOpen.value = true
  void nextTick(() => sidebar.value?.querySelector<HTMLElement>('a')?.focus())
}
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isNavigationOpen.value) closeNavigation(true)
}

watch(
  () => route.fullPath,
  () => closeNavigation(),
)
onMounted(() => {
  window.addEventListener('keydown', handleEscape)
  void (async () => {
    await profileStore.loadProfile()
    preferencesStore.initializePreferredProperty(profileStore.profile?.preferredPropertyId ?? null)
    await propertyStore.loadProperties(preferencesStore.preferences.preferredPropertyId)
  })()
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div
    class="app-shell"
    :data-density="preferencesStore.preferences.density"
    :data-motion="preferencesStore.preferences.motion"
  >
    <aside
      id="primary-navigation"
      ref="sidebar"
      class="app-sidebar"
      :class="{ 'is-open': isNavigationOpen }"
    >
      <RouterLink class="app-brand" to="/" @click="closeNavigation()">
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
          @click="closeNavigation()"
          >{{ item.label }}</RouterLink
        >
      </nav>
      <div class="app-sidebar__property">
        <BaseSelect
          v-model="selectedProperty"
          label="Active property"
          :options="propertyOptions"
          placeholder="Select property"
          :disabled="propertyStore.status === 'loading'"
        />
      </div>
      <div class="app-sidebar__footer">Portfolio demonstration · Local data</div>
    </aside>

    <button
      class="app-backdrop"
      :class="{ 'is-visible': isNavigationOpen }"
      type="button"
      aria-label="Close navigation"
      :tabindex="isNavigationOpen ? 0 : -1"
      @click="closeNavigation(true)"
    />

    <div class="app-body">
      <header class="app-header">
        <div class="app-header__leading">
          <button
            ref="menuButton"
            class="app-menu-button"
            type="button"
            aria-label="Open navigation"
            aria-controls="primary-navigation"
            :aria-expanded="isNavigationOpen"
            @click="openNavigation"
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
              :disabled="propertyStore.status === 'loading'"
            />
          </div>
          <RouterLink
            class="app-header__profile"
            to="/settings"
            aria-label="Open settings and profile"
          >
            <span class="app-header__avatar" aria-hidden="true">{{ profileStore.initials }}</span
            ><span>{{ profileStore.profile?.name ?? 'Settings' }}</span>
          </RouterLink>
        </div>
      </header>

      <main class="app-main"><RouterView /></main>
    </div>
  </div>
</template>
