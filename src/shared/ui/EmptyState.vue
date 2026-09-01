<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon" aria-hidden="true">○</span>
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state__action"><slot name="action" /></div>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  display: grid;
  min-height: 17rem;
  place-items: center;
  align-content: center;
  padding: var(--space-8);
  text-align: center;
}
.empty-state__icon {
  display: grid;
  width: 2.75rem;
  aspect-ratio: 1;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: var(--font-size-xl);
}
h2 {
  margin: var(--space-4) 0 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-md);
}
p {
  max-width: 30rem;
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
.empty-state__action {
  margin-top: var(--space-5);
}
</style>
