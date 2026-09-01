<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{ open: boolean; title: string; size?: 'default' | 'large' }>(),
  { size: 'default' },
)
const emit = defineEmits<{ close: [] }>()
const titleId = `modal-title-${useId()}`
const dialog = ref<HTMLElement | null>(null)
let previousBodyOverflow = ''
let previouslyFocusedElement: HTMLElement | null = null
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function requestClose() {
  emit('close')
}
function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    requestClose()
    return
  }
  if (event.key !== 'Tab') return

  const focusableElements = [
    ...(dialog.value?.querySelectorAll<HTMLElement>(focusableSelector) ?? []),
  ]
  const firstFocusableElement = focusableElements[0]
  const lastFocusableElement = focusableElements[focusableElements.length - 1]

  if (!firstFocusableElement || !lastFocusableElement) {
    event.preventDefault()
    dialog.value?.focus()
    return
  }

  const activeElement = document.activeElement
  if (
    event.shiftKey &&
    (activeElement === firstFocusableElement || activeElement === dialog.value)
  ) {
    event.preventDefault()
    lastFocusableElement.focus()
  } else if (!event.shiftKey && activeElement === lastFocusableElement) {
    event.preventDefault()
    firstFocusableElement.focus()
  }
}
function updateBodyScroll(isOpen: boolean) {
  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    updateBodyScroll(isOpen)
    if (isOpen) {
      previouslyFocusedElement = document.activeElement as HTMLElement | null
      await nextTick()
      dialog.value?.focus()
    } else {
      previouslyFocusedElement?.focus()
      previouslyFocusedElement = null
    }
  },
  { immediate: true },
)
onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = previousBodyOverflow
  if (props.open) previouslyFocusedElement?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal" role="presentation" @click.self="requestClose">
      <section
        ref="dialog"
        class="modal__dialog"
        :class="`modal__dialog--${size}`"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <header class="modal__header">
          <h2 :id="titleId">{{ title }}</h2>
          <button type="button" aria-label="Close dialog" @click="requestClose">×</button>
        </header>
        <div class="modal__content"><slot /></div>
        <footer v-if="$slots.footer" class="modal__footer"><slot name="footer" /></footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background: var(--color-overlay);
}
.modal__dialog {
  width: min(100%, 32rem);
  max-height: calc(100vh - var(--space-8));
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}
.modal__dialog--large {
  width: min(100%, 52rem);
}
.modal__header,
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
}
.modal__header {
  border-bottom: 1px solid var(--color-border);
}
.modal__header h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-lg);
}
.modal__header button {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xl);
  line-height: 1;
  cursor: pointer;
}
.modal__content {
  padding: var(--space-5);
}
.modal__footer {
  justify-content: flex-end;
  border-top: 1px solid var(--color-border);
}
</style>
