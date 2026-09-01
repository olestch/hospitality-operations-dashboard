<script setup lang="ts">
import BaseCard from '@/shared/ui/BaseCard.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

defineProps<{ eyebrow: string; title: string; description: string }>()
</script>

<template>
  <section>
    <PageHeader :eyebrow :title :description />
    <BaseCard class="module-placeholder">
      <EmptyState
        title="Module foundation ready"
        description="Business functionality will be introduced in a later phase."
      />
    </BaseCard>
  </section>
</template>
