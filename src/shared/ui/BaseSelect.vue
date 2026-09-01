<script setup lang="ts">
export type SelectValue = string | number
export interface SelectOption {
  label: string
  value: SelectValue
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: readonly SelectOption[]
    modelValue: SelectValue | null
    label?: string
    ariaLabel?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  { label: undefined, ariaLabel: undefined, placeholder: undefined, disabled: false },
)
const emit = defineEmits<{ 'update:modelValue': [value: SelectValue | null] }>()

function handleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit(
    'update:modelValue',
    props.options.find((item) => String(item.value) === value)?.value ?? null,
  )
}
</script>

<template>
  <label class="select">
    <span v-if="label" class="select__label">{{ label }}</span>
    <span class="select__control">
      <select
        :value="modelValue ?? ''"
        :disabled
        :aria-label="ariaLabel ?? label"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
    </span>
  </label>
</template>

<style scoped lang="scss">
.select {
  display: grid;
  gap: var(--space-2);
}
.select__label {
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.select__control {
  position: relative;
}
.select__control::after {
  position: absolute;
  top: 50%;
  right: var(--space-3);
  width: 0.4rem;
  height: 0.4rem;
  border-right: 1px solid;
  border-bottom: 1px solid;
  content: '';
  pointer-events: none;
  transform: translateY(-70%) rotate(45deg);
}
select {
  width: 100%;
  min-height: 2.5rem;
  appearance: none;
  padding: 0 calc(var(--space-8) + var(--space-1)) 0 var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  cursor: pointer;
}
select:disabled {
  background: var(--color-surface-subtle);
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
