<script setup lang="ts">
import { computed } from 'vue'
import { RELEASES_URL, formatDate, formatSize, useLatestRelease } from './release'

const props = defineProps<{ abi?: string }>()
const release = useLatestRelease()
const apks = computed(() => release.value?.apks.filter((apk) => !props.abi || apk.abi === props.abi) ?? [])
</script>

<template>
  <div class="downloads">
    <template v-if="release && apks.length">
      <p class="dl-version">
        RVC {{ release.version }} от {{ formatDate(release.date) }} ·
        <a href="/changelog">что нового</a>
      </p>
      <div class="dl-grid">
        <a
          v-for="apk in apks"
          :key="apk.abi"
          class="dl-card"
          :class="{ recommended: apk.abi === 'arm64-v8a' }"
          :href="apk.url"
        >
          <span class="dl-title">
            {{ apk.title }}
            <span v-if="apk.abi === 'arm64-v8a'" class="dl-badge">Рекомендуем</span>
          </span>
          <span class="dl-hint">{{ apk.hint }}</span>
          <span class="dl-size">{{ formatSize(apk.size) }}</span>
          <code v-if="apk.sha256" class="dl-sha" :title="`SHA-256: ${apk.sha256}`">SHA-256 {{ apk.sha256.slice(0, 16) }}…</code>
        </a>
      </div>
      <p class="dl-more">
        <a :href="release.page">Страница релиза</a>
        <template v-if="release.source"> · <a :href="release.source.url">исходный код ({{ formatSize(release.source.size) }})</a></template>
      </p>
    </template>
    <p v-else>
      Откройте <a :href="release?.page ?? RELEASES_URL">последний релиз на GitHub</a> и выберите
      <code>{{ abi === 'universal' ? 'RVC-x.y.z-universal.apk' : 'RVC-x.y.z-arm64-v8a.apk' }}</code>.
    </p>
  </div>
</template>

<style scoped>
.dl-version,
.dl-more {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.dl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
  gap: 12px;
  margin: 12px 0;
}

.dl-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 70%, transparent);
  color: var(--vp-c-text-1);
  text-decoration: none !important;
  transition: border-color 0.2s, transform 0.15s;
}

.dl-card:hover {
  border-color: var(--vp-c-brand-1);
}

.dl-card:active {
  transform: scale(0.98);
}

.dl-card.recommended {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
  background: var(--vp-c-brand-soft);
}

.dl-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.dl-badge {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-button-brand-text);
  background: var(--vp-button-brand-bg);
}

.dl-hint {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.dl-size {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.dl-sha {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: none !important;
  padding: 0 !important;
}
</style>
