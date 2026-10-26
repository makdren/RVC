<script setup>
import { computed, onMounted, ref } from 'vue'

const REPO = 'makdren/RVC'
const releases = ref([])
const history = ref([])
const error = ref('')
const loading = ref(true)

const ABIS = ['arm64-v8a', 'armeabi-v7a', 'universal', 'x86_64', 'x86']

onMounted(async () => {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`)
    if (!r.ok) throw new Error(`GitHub API: ${r.status}`)
    releases.value = (await r.json()).map((rel) => {
      const counts = {}
      for (const a of rel.assets) {
        if (a.name === 'update.json') counts.update = a.download_count
        else if (a.name.endsWith('.apk')) {
          // RVC-1.0.3-arm64-v8a.apk → arm64-v8a (в имени ABI тоже бывают дефисы).
          const abi = a.name.match(/^RVC-[^-]+-(.+)\.apk$/)?.[1]
          if (abi) counts[abi] = a.download_count
        }
      }
      return { tag: rel.tag_name, date: rel.published_at?.slice(0, 10), counts }
    })
  } catch (e) {
    error.value = String(e.message || e)
  }
  try {
    const h = await fetch(`https://raw.githubusercontent.com/${REPO}/stats/stats.json`, { cache: 'no-store' })
    if (h.ok) history.value = await h.json()
  } catch {
    // Истории ещё нет — первый снимок появится после ночного запуска workflow «Статистика».
  }
  loading.value = false
})

const sum = (o, keys) => keys.reduce((s, k) => s + (o[k] || 0), 0)
const totalApk = computed(() => releases.value.reduce((s, r) => s + sum(r.counts, ABIS), 0))
const totalChecks = computed(() => releases.value.reduce((s, r) => s + (r.counts.update || 0), 0))

/** Суточные приросты: проверки обновлений (≈ активные установки) и скачивания APK. */
const days = computed(() => {
  const totals = history.value.map((snap) => {
    let checks = 0
    let apk = 0
    for (const c of Object.values(snap.releases)) {
      checks += c['update.json'] || 0
      apk += sum(c, ABIS)
    }
    return { date: snap.date, checks, apk }
  })
  const out = []
  for (let i = 1; i < totals.length; i++) {
    out.push({
      date: totals[i].date,
      checks: Math.max(0, totals[i].checks - totals[i - 1].checks),
      apk: Math.max(0, totals[i].apk - totals[i - 1].apk),
    })
  }
  return out.slice(-60)
})

const active = computed(() => (days.value.length ? days.value[days.value.length - 1].checks : null))
const maxBar = computed(() => Math.max(1, ...days.value.map((d) => Math.max(d.checks, d.apk))))
</script>

<template>
  <div class="stats">
    <p v-if="loading" class="muted">Загружаю счётчики GitHub…</p>
    <p v-else-if="error" class="muted">Не удалось получить данные: {{ error }}</p>
    <template v-else>
      <div class="tiles">
        <div class="tile">
          <div class="value">{{ active ?? '—' }}</div>
          <div class="label">активных установок<br><span>проверок обновлений за последние сутки</span></div>
        </div>
        <div class="tile">
          <div class="value">{{ totalApk.toLocaleString('ru-RU') }}</div>
          <div class="label">скачиваний APK<br><span>за всё время, все версии</span></div>
        </div>
        <div class="tile">
          <div class="value">{{ totalChecks.toLocaleString('ru-RU') }}</div>
          <div class="label">проверок обновлений<br><span>за всё время</span></div>
        </div>
      </div>

      <h3>По дням</h3>
      <p v-if="days.length === 0" class="muted">
        История копится раз в сутки (workflow «Статистика»). График появится после двух снимков.
      </p>
      <div v-else class="chart" role="img" aria-label="Проверки обновлений и скачивания по дням">
        <div v-for="d in days" :key="d.date" class="day" :title="`${d.date}: ${d.checks} проверок, ${d.apk} скачиваний`">
          <div class="bar checks" :style="{ height: (d.checks / maxBar) * 100 + '%' }" />
          <div class="bar apk" :style="{ height: (d.apk / maxBar) * 100 + '%' }" />
        </div>
      </div>
      <p v-if="days.length" class="legend"><i class="checks" /> проверки обновлений <i class="apk" /> скачивания APK</p>

      <h3>По версиям</h3>
      <div class="table">
        <table>
          <thead>
            <tr><th>Версия</th><th>Дата</th><th v-for="a in ABIS" :key="a">{{ a }}</th><th>Проверки</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in releases" :key="r.tag">
              <td>{{ r.tag }}</td>
              <td>{{ r.date }}</td>
              <td v-for="a in ABIS" :key="a">{{ r.counts[a] ?? '—' }}</td>
              <td>{{ r.counts.update ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0; }
.tile { border: 1px solid var(--vp-c-divider); border-radius: 16px; padding: 16px; background: var(--vp-c-bg-soft); }
.value { font-size: 32px; font-weight: 700; color: var(--vp-c-brand-1); line-height: 1.1; }
.label { margin-top: 6px; font-size: 14px; }
.label span, .muted { color: var(--vp-c-text-2); font-size: 13px; }
.chart { display: flex; align-items: flex-end; gap: 3px; height: 160px; padding: 8px; border: 1px solid var(--vp-c-divider); border-radius: 12px; }
.day { flex: 1; display: flex; align-items: flex-end; gap: 1px; height: 100%; min-width: 4px; }
.bar { flex: 1; border-radius: 3px 3px 0 0; min-height: 1px; }
.checks { background: var(--vp-c-brand-1); }
.apk { background: #34d399; }
.legend { font-size: 13px; color: var(--vp-c-text-2); }
.legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin: 0 4px 0 12px; vertical-align: middle; }
.legend i:first-child { margin-left: 0; }
.table { overflow-x: auto; }
</style>
