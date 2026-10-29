import { REPO } from './release-info'

/** Windows-версия выходит отдельными релизами `windows-vX.Y.Z`: «последним» остаётся Android-релиз. */
export const WINDOWS_TAG_PREFIX = 'windows-v'
export const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=30`
export const WINDOWS_RELEASES_URL = `https://github.com/${REPO}/releases?q=windows&expanded=true`

export interface WinFile {
  url: string
  size: number
  sha256?: string
}

export interface WindowsRelease {
  tag: string
  version: string
  date: string
  page: string
  msi?: WinFile
  exe?: WinFile
  source?: WinFile
}

function file(a: any): WinFile {
  return {
    url: a.browser_download_url,
    size: a.size,
    sha256: typeof a.digest === 'string' ? a.digest.replace(/^sha256:/, '') : undefined,
  }
}

/** Список релизов GitHub API → самый свежий опубликованный `windows-v…`. */
export function parseWindowsRelease(list: any): WindowsRelease | null {
  if (!Array.isArray(list)) return null
  const rel = list.find((r) => typeof r?.tag_name === 'string' && r.tag_name.startsWith(WINDOWS_TAG_PREFIX) && !r.draft && !r.prerelease)
  if (!rel || !Array.isArray(rel.assets)) return null
  const out: WindowsRelease = {
    tag: rel.tag_name,
    version: rel.tag_name.slice(WINDOWS_TAG_PREFIX.length),
    date: (rel.published_at ?? '').slice(0, 10),
    page: rel.html_url,
  }
  for (const a of rel.assets) {
    if (a.name.endsWith('.msi')) out.msi = file(a)
    else if (a.name.endsWith('.exe')) out.exe = file(a)
    else if (a.name.endsWith('-source.zip')) out.source = file(a)
  }
  return out.msi || out.exe ? out : null
}
