import { defineLoader } from 'vitepress'
import { LATEST_API, parseRelease, type Release } from './release-info'

declare const data: Release | null
export { data }

// Последний релиз на момент сборки. Сайт пересобирается при каждом новом релизе
// (workflow «Документация»), так что ссылки на APK сразу прямые.
export default defineLoader({
  async load(): Promise<Release | null> {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    try {
      const r = await fetch(LATEST_API, { headers })
      if (!r.ok) throw new Error(`GitHub API: ${r.status}`)
      return parseRelease(await r.json())
    } catch (e) {
      console.warn(`[release] не удалось получить релиз, кнопки поведут на страницу релизов: ${e}`)
      return null
    }
  },
})
