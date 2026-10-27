import { onMounted, shallowRef } from 'vue'
import { data as buildRelease } from './release.data'
import { LATEST_API, parseRelease, type Release } from './release-info'

export * from './release-info'

// Одна копия на страницу: сайт собран с релизом на момент сборки, а в браузере
// один раз сверяется с GitHub — если вышла новая версия, ссылки ведут на неё.
const latest = shallowRef<Release | null>(buildRelease)
let checked = false

export function useLatestRelease() {
  onMounted(async () => {
    if (checked) return
    checked = true
    try {
      const r = await fetch(LATEST_API)
      if (!r.ok) return
      const fresh = parseRelease(await r.json())
      if (fresh && fresh.tag !== latest.value?.tag) latest.value = fresh
    } catch {
      // Лимит GitHub API или нет сети — остаются ссылки на момент сборки.
    }
  })
  return latest
}
