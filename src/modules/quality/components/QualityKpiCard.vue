<script setup lang="ts">
defineProps<{ label: string; value: string; description: string; tone?: 'neutral' | 'warning' }>()
</script>

<template>
  <article class="quality-kpi" :class="{ 'is-warning': tone === 'warning' }">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small>{{ description }}</small>
  </article>
</template>

<style scoped lang="scss">
.quality-kpi {
  display: grid;
  min-width: 0;
  gap: var(--space-2);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.quality-kpi span,
.quality-kpi small {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.quality-kpi strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-2xl);
  line-height: 1;
}
.quality-kpi.is-warning strong {
  color: var(--color-danger);
}
</style>
