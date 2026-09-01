<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <section class="page-placeholder">
    <p class="page-placeholder__eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <div class="page-placeholder__surface">
      <span>Module foundation ready</span>
    </div>
  </section>
</template>
