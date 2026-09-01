<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'neutral' | 'success' | 'warning' | 'danger' }>(), {
  variant: 'neutral',
})
</script>

<template>
  <span class="badge" :class="`badge--${variant}`"><slot /></span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
.badge--neutral {
  background: var(--color-surface-subtle);
  color: var(--color-text-muted);
}
.badge--success {
  background: var(--color-success-soft);
  color: var(--color-success);
}
.badge--warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}
.badge--danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
</style>
