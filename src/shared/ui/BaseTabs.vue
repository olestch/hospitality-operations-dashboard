<script setup lang="ts">
import { nextTick } from 'vue'
import type { ComponentPublicInstance } from 'vue'

export interface TabItem {
  id: string
  label: string
  disabled?: boolean
}
const props = defineProps<{ tabs: readonly TabItem[]; modelValue: string; ariaLabel?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const tabButtons = new Map<string, HTMLButtonElement>()

function setTabButton(id: string, element: Element | ComponentPublicInstance | null): void {
  if (element instanceof HTMLButtonElement) tabButtons.set(id, element)
  else tabButtons.delete(id)
}

async function activateAndFocus(id: string): Promise<void> {
  emit('update:modelValue', id)
  await nextTick()
  tabButtons.get(id)?.focus()
}

function handleKeydown(event: KeyboardEvent, currentId: string): void {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  const enabledTabs = props.tabs.filter((tab) => !tab.disabled)
  const currentIndex = enabledTabs.findIndex((tab) => tab.id === currentId)
  if (currentIndex < 0 || enabledTabs.length === 0) return

  event.preventDefault()
  let targetIndex = currentIndex
  if (event.key === 'Home') targetIndex = 0
  if (event.key === 'End') targetIndex = enabledTabs.length - 1
  if (event.key === 'ArrowLeft')
    targetIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length
  if (event.key === 'ArrowRight') targetIndex = (currentIndex + 1) % enabledTabs.length
  const target = enabledTabs[targetIndex]
  if (target) void activateAndFocus(target.id)
}
</script>

<template>
  <div class="tabs" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :id="`tab-${tab.id}`"
      :ref="(element) => setTabButton(tab.id, element)"
      :key="tab.id"
      class="tabs__tab"
      :class="{ 'is-active': tab.id === modelValue }"
      type="button"
      role="tab"
      :aria-selected="tab.id === modelValue"
      :tabindex="tab.id === modelValue ? 0 : -1"
      :disabled="tab.disabled"
      @click="emit('update:modelValue', tab.id)"
      @keydown="handleKeydown($event, tab.id)"
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
