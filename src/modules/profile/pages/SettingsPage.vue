<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { usePreferencesStore } from '@/app/stores/preferencesStore'
import { usePropertyStore } from '@/app/stores/propertyStore'
import { useProfileStore } from '@/modules/profile/stores/profileStore'
import type { DataDensity, MotionPreference } from '@/shared/types/preferences'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseSelect, { type SelectOption, type SelectValue } from '@/shared/ui/BaseSelect.vue'
import EmptyState from '@/shared/ui/EmptyState.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

const propertyStore = usePropertyStore()
const preferencesStore = usePreferencesStore()
const profileStore = useProfileStore()
const { profile, status, error, initials } = storeToRefs(profileStore)

const propertyOptions = computed<readonly SelectOption[]>(() =>
  propertyStore.properties.map((property) => ({ label: property.name, value: property.id })),
)
const preferredProperty = computed<SelectValue | null>({
  get: () => preferencesStore.preferences.preferredPropertyId,
  set: (value) => {
    if (typeof value !== 'string') return
    preferencesStore.setPreferredProperty(value)
    propertyStore.selectProperty(value)
  },
})

function setDensity(event: Event): void {
  preferencesStore.setDensity((event.target as HTMLInputElement).value as DataDensity)
}

function setMotion(event: Event): void {
  preferencesStore.setMotion((event.target as HTMLInputElement).value as MotionPreference)
}
</script>

<template>
  <section class="settings-page">
    <PageHeader
      eyebrow="Workspace"
      title="Settings"
      description="Profile details and local preferences for this demonstration workspace."
    />

    <BaseCard v-if="status === 'idle' || status === 'loading'" class="settings-state">
      <div role="status" aria-live="polite">Loading profile…</div>
    </BaseCard>
    <BaseCard v-else-if="status === 'failure'" class="settings-state">
      <EmptyState title="Profile could not be loaded" :description="error ?? 'Please try again.'">
        <template #action>
          <BaseButton @click="profileStore.loadProfile(true)">Try again</BaseButton>
        </template>
      </EmptyState>
    </BaseCard>

    <template v-else-if="profile">
      <BaseCard>
        <template #header>
          <div class="settings-heading">
            <h2>Profile</h2>
            <p>Read-only identity supplied by the demo data provider.</p>
          </div>
        </template>
        <div class="profile-summary">
          <div class="profile-summary__avatar" aria-hidden="true">{{ initials }}</div>
          <dl class="profile-summary__details">
            <div>
              <dt>Display name</dt>
              <dd>{{ profile.name }}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{{ profile.role }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ profile.email }}</dd>
            </div>
          </dl>
        </div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <div class="settings-heading">
            <h2>Workspace preferences</h2>
            <p>Changes apply immediately and are stored locally in this browser.</p>
          </div>
        </template>
        <div class="preferences-form">
          <div class="preference-row">
            <div>
              <h3>Preferred property</h3>
              <p>Also switches the active property throughout the workspace.</p>
            </div>
            <BaseSelect
              v-model="preferredProperty"
              aria-label="Preferred property"
              :options="propertyOptions"
              placeholder="Select property"
              :disabled="propertyStore.status !== 'success'"
            />
          </div>

          <fieldset class="preference-row">
            <legend>
              <span>Data density</span>
              <small>Choose the spacing used in data-heavy views.</small>
            </legend>
            <div class="preference-options">
              <label>
                <input
                  type="radio"
                  name="density"
                  value="comfortable"
                  :checked="preferencesStore.preferences.density === 'comfortable'"
                  @change="setDensity"
                />
                Comfortable
              </label>
              <label>
                <input
                  type="radio"
                  name="density"
                  value="compact"
                  :checked="preferencesStore.preferences.density === 'compact'"
                  @change="setDensity"
                />
                Compact
              </label>
            </div>
          </fieldset>

          <fieldset class="preference-row">
            <legend>
              <span>Motion</span>
              <small
                >Reduced motion removes application-owned transitions and loading pulses.</small
              >
            </legend>
            <div class="preference-options">
              <label>
                <input
                  type="radio"
                  name="motion"
                  value="system"
                  :checked="preferencesStore.preferences.motion === 'system'"
                  @change="setMotion"
                />
                Follow system
              </label>
              <label>
                <input
                  type="radio"
                  name="motion"
                  value="reduced"
                  :checked="preferencesStore.preferences.motion === 'reduced'"
                  @change="setMotion"
                />
                Reduce motion
              </label>
            </div>
          </fieldset>
        </div>
      </BaseCard>

      <p class="settings-note">
        Preferences are stored locally for this portfolio demo. No account or server settings are
        changed.
      </p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.settings-page {
  display: grid;
  max-width: 58rem;
  gap: var(--space-6);
}
.settings-page :deep(.page-header) {
  margin-bottom: 0;
}
.settings-heading h2,
.preference-row h3 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-md);
}
.settings-heading p,
.preference-row p,
.preference-row small {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.profile-summary {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
.profile-summary__avatar {
  display: grid;
  width: 4.5rem;
  flex: 0 0 auto;
  aspect-ratio: 1;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}
.profile-summary__details {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
  margin: 0;
}
.profile-summary__details dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
.profile-summary__details dd {
  overflow-wrap: anywhere;
  margin: var(--space-1) 0 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.preferences-form {
  display: grid;
  gap: var(--space-5);
}
.preference-row {
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) minmax(13rem, 18rem);
  align-items: center;
  gap: var(--space-6);
  margin: 0;
  padding: 0 0 var(--space-5);
  border: 0;
  border-bottom: 1px solid var(--color-border);
}
.preference-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.preference-row legend {
  display: contents;
}
.preference-row legend span,
.preference-row legend small {
  grid-column: 1;
}
.preference-row legend span {
  color: var(--color-text-strong);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.preference-options {
  display: flex;
  grid-column: 2;
  grid-row: 1 / span 2;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.preference-options label {
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  cursor: pointer;
}
.preference-options label:has(input:checked) {
  border-color: var(--color-primary-border);
  background: var(--color-primary-soft);
}
.settings-state {
  min-height: 20rem;
}
.settings-state > :deep(.card__content) {
  display: grid;
  min-height: 20rem;
  place-items: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
.settings-note {
  margin: calc(var(--space-2) * -1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
@media (max-width: 48rem) {
  .profile-summary {
    align-items: flex-start;
  }
  .profile-summary__details {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  .preference-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  .preference-options {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
