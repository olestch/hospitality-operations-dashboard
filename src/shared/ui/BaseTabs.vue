<script setup lang="ts">
export interface TabItem {
  id: string
  label: string
  disabled?: boolean
}
defineProps<{ tabs: readonly TabItem[]; modelValue: string; ariaLabel?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="tabs" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :id="`tab-${tab.id}`"
      :key="tab.id"
      class="tabs__tab"
      :class="{ 'is-active': tab.id === modelValue }"
      type="button"
      role="tab"
      :aria-selected="tab.id === modelValue"
      :tabindex="tab.id === modelValue ? 0 : -1"
      :disabled="tab.disabled"
      @click="emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  display: flex;
  gap: var(--space-1);
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);
  scrollbar-width: thin;
}
.tabs__tab {
  flex: 0 0 auto;
  padding: var(--space-3) var(--space-4);
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}
.tabs__tab:hover:not(:disabled),
.tabs__tab.is-active {
  color: var(--color-text-strong);
}
.tabs__tab.is-active {
  border-bottom-color: var(--color-primary);
}
.tabs__tab:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
