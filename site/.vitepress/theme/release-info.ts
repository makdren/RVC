export const REPO = 'makdren/RVC'
export const RELEASES_URL = `https://github.com/${REPO}/releases/latest`
export const LATEST_API = `https://api.github.com/repos/${REPO}/releases/latest`

export interface Apk {
  abi: string
  title: string
  hint: string
  size: number
  url: string
  sha256?: string
}

export interface Release {
  tag: string
  version: string
  date: string
  page: string
  apks: Apk[]
  source?: { url: string; size: number }
}

const ABIS: Record<string, { title: string; hint: string }> = {
  'arm64-v8a': { title: 'arm64', hint: 'Почти все современные телефоны' },
  'armeabi-v7a': { title: 'armv7', hint: 'Старые 32-битные телефоны' },
  universal: { title: 'Универсальный', hint: 'Подходит всем, но весит больше' },
  x86_64: { title: 'x86_64', hint: 'Эмуляторы и планшеты на Intel' },
  x86: { title: 'x86', hint: 'Старые эмуляторы на Intel' },
}
const ORDER = Object.keys(ABIS)

/** Ответ GitHub API `releases/latest` → то, что показывает сайт. */
export function parseRelease(json: any): Release | null {
  if (!json?.tag_name || !Array.isArray(json.assets)) return null
  const apks: Apk[] = []
  let source: Release['source']
  for (const a of json.assets) {
    if (a.name.endsWith('-source.zip')) source = { url: a.browser_download_url, size: a.size }
    // RVC-1.0.7-arm64-v8a.apk → arm64-v8a (в имени ABI тоже бывают дефисы).
    const abi = a.name.match(/^RVC-[^-]+-(.+)\.apk$/)?.[1]
    if (!abi || !ABIS[abi]) continue
    apks.push({
      abi,
      ...ABIS[abi],
      size: a.size,
      url: a.browser_download_url,
      sha256: typeof a.digest === 'string' ? a.digest.replace(/^sha256:/, '') : undefined,
    })
  }
  if (!apks.length) return null
  apks.sort((x, y) => ORDER.indexOf(x.abi) - ORDER.indexOf(y.abi))
  return {
    tag: json.tag_name,
    version: json.tag_name.replace(/^v/, ''),
    date: (json.published_at ?? '').slice(0, 10),
    page: json.html_url,
    apks,
    source,
  }
}

export const formatSize = (bytes: number) =>
  `${(bytes / 1048576).toFixed(1).replace('.', ',')} МБ`

export const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).replace(/\s*г\.$/, '')
    : ''
