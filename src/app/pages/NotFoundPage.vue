<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BaseCard from '@/shared/ui/BaseCard.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
</script>

<template>
  <PageHeader
    eyebrow="Navigation"
    title="Page not found"
    description="The page may have moved or the address may be incorrect."
  />
  <BaseCard>
    <EmptyState title="Nothing at this address" description="Return to the operations overview.">
      <template #action
        ><RouterLink class="not-found__link" to="/">Go to overview</RouterLink></template
      >
    </EmptyState>
  </BaseCard>
</template>

<style scoped lang="scss">
.not-found__link {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
}

.not-found__link:hover {
  background: var(--color-primary-hover);
}
</style>
