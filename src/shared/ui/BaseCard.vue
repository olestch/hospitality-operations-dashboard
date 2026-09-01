<script setup lang="ts">
withDefaults(defineProps<{ as?: 'article' | 'section' | 'div' }>(), { as: 'section' })
</script>

<template>
  <component :is="as" class="card">
    <header v-if="$slots.header" class="card__header"><slot name="header" /></header>
    <div class="card__content"><slot /></div>
  </component>
</template>

<style scoped lang="scss">
.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.card__header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.card__content {
  padding: var(--space-5);
}
</style>
