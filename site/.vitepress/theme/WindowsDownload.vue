<script setup lang="ts">
import { data as release } from './windows.data'
import { WINDOWS_RELEASES_URL } from './windows-info'
import { formatDate, formatSize } from './release-info'
</script>

<template>
  <div class="downloads">
    <template v-if="release">
      <p class="dl-version">
        RVC для Windows {{ release.version }} от {{ formatDate(release.date) }} ·
        <a href="/guide/windows">как установить</a>
      </p>
      <div class="dl-grid">
        <a v-if="release.msi" class="dl-card recommended" :href="release.msi.url">
          <span class="dl-title">Установщик MSI <span class="dl-badge">берите этот</span></span>
          <span class="dl-hint">Windows 10 и 11, 64 бит</span>
          <span class="dl-size">{{ formatSize(release.msi.size) }}</span>
          <code v-if="release.msi.sha256" class="dl-sha" :title="`SHA-256: ${release.msi.sha256}`">SHA-256 {{ release.msi.sha256.slice(0, 16) }}…</code>
        </a>
        <a v-if="release.exe" class="dl-card" :href="release.exe.url">
          <span class="dl-title">Установщик EXE</span>
          <span class="dl-hint">То же самое, если .msi не открывается</span>
          <span class="dl-size">{{ formatSize(release.exe.size) }}</span>
          <code v-if="release.exe.sha256" class="dl-sha" :title="`SHA-256: ${release.exe.sha256}`">SHA-256 {{ release.exe.sha256.slice(0, 16) }}…</code>
        </a>
      </div>
      <p class="dl-more">
        <a :href="release.page">Страница релиза</a>
        <template v-if="release.source"> · <a :href="release.source.url">исходный код ({{ formatSize(release.source.size) }})</a></template>
      </p>
    </template>
    <p v-else>
      Установщики лежат в <a :href="WINDOWS_RELEASES_URL">релизах windows-v…</a>: нужен <code>RVC-windows-x.y.z.msi</code>.
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
  font-weight: 600;
}

.dl-badge {
  margin-left: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.dl-hint,
.dl-size {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.dl-sha {
  font-size: 11px;
  align-self: flex-start;
}
</style>
