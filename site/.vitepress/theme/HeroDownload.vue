<script setup lang="ts">
import { computed } from 'vue'
import { RELEASES_URL, formatSize, useLatestRelease } from './release'
import { data as windows } from './windows.data'

const release = useLatestRelease()
const main = computed(() => release.value?.apks.find((a) => a.abi === 'arm64-v8a'))
</script>

<template>
  <div class="hero-download">
    <a class="dl-button" :href="main?.url ?? RELEASES_URL">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Скачать для Android
    </a>
    <a class="dl-button alt" :href="windows?.msi?.url ?? '#windows'">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M3 5.5 10.5 4.5v7H3zM12 4.3 21 3v8.5h-9zM3 12.5h7.5v7L3 18.5zM12 12.5h9V21l-9-1.3z" fill="currentColor" />
      </svg>
      Windows
    </a>
    <p class="dl-meta">
      <template v-if="main">RVC {{ release!.version }} · {{ formatSize(main.size) }} · </template>Android 8.0+ ·
      <template v-if="windows">Windows {{ windows.version }} · 10/11 x64 ·{{ " " }}</template>
      <a href="#download">другие варианты</a>
    </p>
  </div>
</template>

<style scoped>
.dl-button.alt {
  margin-left: 10px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.dl-button.alt:hover {
  background: var(--vp-c-default-2);
}

.hero-download {
  padding-top: 28px;
}

.dl-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 26px;
  height: 52px;
  border-radius: 26px;
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-button-brand-text);
  background: var(--vp-button-brand-bg);
  text-decoration: none;
  transition: background-color 0.2s, transform 0.15s;
}

.dl-button:hover {
  color: var(--vp-button-brand-hover-text);
  background: var(--vp-button-brand-hover-bg);
}

.dl-button:active {
  background: var(--vp-button-brand-active-bg);
  transform: scale(0.98);
}

.dl-meta {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.dl-meta a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.dl-meta a:hover {
  text-decoration: underline;
}

@media (max-width: 959px) {
  .hero-download {
    text-align: center;
  }
}
</style>
