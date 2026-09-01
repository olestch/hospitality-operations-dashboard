<script setup lang="ts">
import { onBeforeUnmount, onMounted, useId, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const titleId = `modal-title-${useId()}`
let previousBodyOverflow = ''

function requestClose() {
  emit('close')
}
function handleKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape') requestClose()
}
function updateBodyScroll(isOpen: boolean) {
  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = previousBodyOverflow
  }
}

watch(() => props.open, updateBodyScroll, { immediate: true })
onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal" role="presentation" @click.self="requestClose">
      <section class="modal__dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
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
