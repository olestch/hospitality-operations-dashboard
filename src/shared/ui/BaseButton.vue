<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'small' | 'medium'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'medium', disabled: false, type: 'button' },
)
</script>

<template>
  <button class="button" :class="[`button--${variant}`, `button--${size}`]" :disabled :type>
    <span v-if="$slots['icon-leading']" class="button__icon" aria-hidden="true"
      ><slot name="icon-leading"
    /></span>
    <slot />
    <span v-if="$slots['icon-trailing']" class="button__icon" aria-hidden="true"
      ><slot name="icon-trailing"
    /></span>
  </button>
</template>

<style scoped lang="scss">
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  cursor: pointer;
  transition: 140ms ease;
}
.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.button--small {
  min-height: 2rem;
  padding: 0 var(--space-3);
  font-size: var(--font-size-xs);
}
.button--medium {
  min-height: 2.5rem;
  padding: 0 var(--space-4);
  font-size: var(--font-size-sm);
}
.button--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}
.button--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.button--secondary {
  border-color: var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-strong);
}
.button--secondary:hover:not(:disabled),
.button--ghost:hover:not(:disabled) {
  background: var(--color-surface-subtle);
}
.button--ghost {
  background: transparent;
  color: var(--color-text);
}
.button__icon {
  display: inline-flex;
}
</style>
