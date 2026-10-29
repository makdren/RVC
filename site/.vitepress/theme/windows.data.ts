import { defineLoader } from 'vitepress'
import { RELEASES_API, parseWindowsRelease, type WindowsRelease } from './windows-info'

declare const data: WindowsRelease | null
export { data }

// Последний Windows-релиз на момент сборки. Сайт пересобирается при каждом опубликованном релизе.
export default defineLoader({
  async load(): Promise<WindowsRelease | null> {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    try {
      const r = await fetch(RELEASES_API, { headers })
      if (!r.ok) throw new Error(`GitHub API: ${r.status}`)
      return parseWindowsRelease(await r.json())
    } catch (e) {
      console.warn(`[windows] не удалось получить релиз, кнопка поведёт на список релизов: ${e}`)
      return null
    }
  },
})
