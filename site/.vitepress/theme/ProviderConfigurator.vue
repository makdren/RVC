<script setup lang="ts">
import { computed, ref, reactive, watch, onBeforeUnmount, watchEffect, nextTick } from 'vue'

type Field = {
  key: string
  label: string
  kind?: 'text' | 'multiline' | 'https' | 'link' | 'domain' | 'color' | 'interval' | 'flag'
  hint?: string
}

const groups: { title: string, fields: Field[] }[] = [
  { title: 'Карточка провайдера', fields: [
    { key: 'profile-title', label: 'Название', hint: 'Мой VPN' },
    { key: 'profile-description', label: 'Описание', kind: 'multiline' },
    { key: 'profile-logo-url', label: 'Адрес логотипа', kind: 'https', hint: 'https://vpn.example/logo.png' },
    { key: 'profile-web-page-url', label: 'Сайт', kind: 'link', hint: 'https://vpn.example' },
    { key: 'support-url', label: 'Поддержка', kind: 'link', hint: 'https://t.me/my_support_bot' },
  ] },
  { title: 'Объявление и баннер', fields: [
    { key: 'announce', label: 'Объявление', kind: 'multiline' },
    { key: 'announce-url', label: 'Ссылка «Подробнее»', kind: 'link' },
    { key: 'banner-text', label: 'Текст баннера', kind: 'multiline' },
    { key: 'banner-bg-color', label: 'Цвет баннера', kind: 'color', hint: '#7C7CFF' },
    { key: 'banner-button-text', label: 'Подпись кнопки', hint: 'Личный кабинет' },
    { key: 'banner-button-url', label: 'Ссылка кнопки', kind: 'link' },
  ] },
  { title: 'Переезд и резервный адрес', fields: [
    { key: 'new-url', label: 'Новый адрес целиком', kind: 'https', hint: 'https://new.example/sub' },
    { key: 'new-domain', label: 'Новый домен', kind: 'domain', hint: 'new.example' },
    { key: 'fallback-url', label: 'Резервный адрес', kind: 'https', hint: 'https://backup.example/sub' },
  ] },
  { title: 'Обновление и подключение', fields: [
    { key: 'profile-update-interval', label: 'Интервал обновления, ч', kind: 'interval', hint: '12' },
    { key: 'subscription-auto-update-enable', label: 'Автообновление подписок', kind: 'flag' },
    { key: 'subscription-auto-update-open-enable', label: 'Обновлять при открытии', kind: 'flag' },
    { key: 'subscription-ping-onopen-enabled', label: 'Пинговать при открытии', kind: 'flag' },
    { key: 'subscription-autoconnect', label: 'Подключаться при открытии', kind: 'flag' },
    { key: 'hide-url', label: 'Скрыть адрес подписки', kind: 'flag' },
  ] },
]

const fields = groups.flatMap(group => group.fields)
const values = reactive<Record<string, string>>(Object.fromEntries(fields.map(field => [field.key, ''])))
const outputFormat = ref<'http' | 'json'>('http')
const outputField = ref<HTMLTextAreaElement>()
const status = ref('')
const showLogo = ref(false)
const logoError = ref(false)

function formatValue(field: Field, raw: string) {
  if (field.kind === 'https' || field.kind === 'link') {
    if (/\s|\\/.test(raw)) throw new Error('Проверьте адрес.')
    try {
      const url = new URL(raw)
      if (url.username || url.password) throw new Error()
      if (field.kind === 'https' && url.protocol === 'https:' && (!url.hash || field.key === 'profile-logo-url')) return url.href
      if (field.kind === 'link' && ['https:', 'http:', 'tg:', 'mailto:'].includes(url.protocol)) return url.href
    } catch { /* Show a field-specific error below. */ }
    throw new Error(field.kind === 'https' ? 'Введите адрес HTTPS без логина и пароля.' : 'Введите ссылку HTTP, HTTPS, Telegram или mailto.')
  }
  if (field.kind === 'domain') {
    if (raw.length > 253 || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.?$/i.test(raw)) {
      throw new Error('Введите домен без схемы, порта и пути. Для IDN используйте Punycode.')
    }
    return raw.toLowerCase()
  }
  if (field.kind === 'color' && !/^#[a-f0-9]{6}([a-f0-9]{2})?$/i.test(raw)) throw new Error('Введите #RRGGBB или #RRGGBBAA.')
  if (field.kind === 'interval' && (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 2147483647)) throw new Error('Введите целое число часов от 1 до 2 147 483 647.')
  if (/[^\x20-\x7e]/.test(raw)) {
    const bytes = new TextEncoder().encode(raw)
    return 'base64:' + btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
  }
  return raw
}

const configuration = computed(() => {
  const headers: Record<string, string> = {}
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const raw = values[field.key]?.trim()
    if (!raw) continue
    try {
      headers[field.key] = formatValue(field, raw)
    } catch (error) {
      errors[field.key] = error instanceof Error ? error.message : 'Проверьте значение.'
    }
  }
  return { headers, errors }
})
const count = computed(() => Object.keys(configuration.value.headers).length)
const logo = computed(() => configuration.value.headers['profile-logo-url'])
watch(logo, () => { showLogo.value = false; logoError.value = false })
const ready = computed(() => count.value > 0 && Object.keys(configuration.value.errors).length === 0)
const output = computed(() => outputFormat.value === 'json'
  ? (count.value ? JSON.stringify(configuration.value.headers, null, 2) : '')
  : Object.entries(configuration.value.headers).map(([key, value]) => key + ': ' + value).join('\n'))

async function copyHeaders() {
  try {
    await navigator.clipboard.writeText(output.value)
    status.value = 'Заголовки скопированы'
  } catch {
    outputField.value?.focus()
    outputField.value?.select()
    status.value = 'Текст выделен. Нажмите Ctrl+C или ⌘C.'
  }
}

function downloadHeaders() {
  const json = outputFormat.value === 'json'
  const blob = new Blob([output.value + '\n'], { type: json ? 'application/json' : 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = json ? 'rvc-headers.json' : 'rvc-headers.txt'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  status.value = 'Файл подготовлен'
}
const connected = ref(false)
const locations = [
  { name: 'Германия', flag: 'de', ping: 22 },
  { name: 'Нидерланды', flag: 'nl', ping: 17 },
  { name: 'Финляндия', flag: 'fi', ping: 14 },
  { name: 'Латвия', flag: 'lv', ping: 8 },
]
const location = ref('Латвия')
const selected = computed(() => locations.find(item => item.name === location.value)!)
const headers = computed(() => configuration.value.headers)
const connecting = ref(false)
const refreshing = ref(false)
const expanded = ref(false)
const clipped = ref(false)
const announcement = ref<HTMLElement>()
let connectTimer: ReturnType<typeof setTimeout>
let refreshTimer: ReturnType<typeof setTimeout>
function toggleConnection() {
  clearTimeout(connectTimer)
  if (connected.value || connecting.value) {
    connecting.value = connected.value = false
    return
  }
  connecting.value = true
  connectTimer = setTimeout(() => { connecting.value = false; connected.value = true }, 1100)
}
function refreshPreview() {
  refreshing.value = true
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => { refreshing.value = false }, 900)
}
onBeforeUnmount(() => { clearTimeout(connectTimer); clearTimeout(refreshTimer) })
watch(() => values.announce, () => { expanded.value = false })
watchEffect(cleanup => {
  const text = values.announce
  const el = announcement.value
  if (!text || !el || expanded.value) return
  const observer = new ResizeObserver(() => { clipped.value = el.scrollHeight > el.clientHeight + 1 })
  observer.observe(el)
  cleanup(() => observer.disconnect())
}, { flush: 'post' })
// Unit-mass critically damped spring used by RvcMotion.ui() and press().
function springEasing(stiffness: number, seconds: number) {
  const frequency = Math.sqrt(stiffness)
  const samples = Array.from({ length: 41 }, (_, index) => {
    const t = seconds * index / 40
    return index === 40 ? 1 : +(1 - (1 + frequency * t) * Math.exp(-frequency * t)).toFixed(5)
  })
  return 'linear(' + samples.join(',') + ')'
}
const pressEase = springEasing(1400, 0.24)
const sizeEase = springEasing(380, 0.45)
let noticeAnimation: Animation | undefined
async function toggleNotice() {
  const panel = announcement.value?.closest<HTMLElement>('.notice')
  if (!panel || (!clipped.value && !expanded.value)) return
  const before = panel.getBoundingClientRect().height
  noticeAnimation?.cancel()
  expanded.value = !expanded.value
  await nextTick()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const after = panel.getBoundingClientRect().height
  noticeAnimation = panel.animate([{ height: before + 'px' }, { height: after + 'px' }], {
    duration: 450, easing: CSS.supports('animation-timing-function', sizeEase) ? sizeEase : 'ease-out',
  })
}
const behavior = computed(() => groups.slice(2).flatMap(group => group.fields)
  .filter(field => headers.value[field.key])
  .map(field => ({ label: field.label, value: field.kind === 'flag'
    ? (values[field.key] === '1' ? 'Включено' : 'Выключено') : headers.value[field.key] })))
</script>

<template>
  <div class="provider-config" @input="status = ''">
    <div class="config-fields">
      <details v-for="(group, index) in groups" :key="group.title" class="config-panel" :open="index === 0">
        <summary>{{ group.title }}</summary>
        <p v-if="index === 2" class="field-note">При заполнении обоих полей новый адрес имеет приоритет над доменом.</p>
        <div v-for="field in group.fields" :key="field.key" class="config-field">
          <label :for="field.key">{{ field.label }}</label>
          <select v-if="field.kind === 'flag'" :id="field.key" v-model="values[field.key]">
            <option value="">По настройкам приложения</option>
            <option value="1">Включить</option>
            <option value="0">Выключить</option>
          </select>
          <textarea v-else-if="field.kind === 'multiline'" :id="field.key" v-model="values[field.key]" rows="2" maxlength="400" />
          <input v-else :id="field.key" v-model="values[field.key]" type="text" :inputmode="field.kind === 'interval' ? 'numeric' : undefined" :placeholder="field.hint" maxlength="2048" :aria-invalid="!!configuration.errors[field.key]" :aria-describedby="configuration.errors[field.key] ? field.key + '-error' : undefined">
          <span v-if="configuration.errors[field.key]" :id="field.key + '-error'" class="field-error">{{ configuration.errors[field.key] }}</span>
        </div>
      </details>
    </div>

    <div class="config-results">
      <section class="config-panel preview" aria-label="Предпросмотр карточки">
        <h2>Демо главного экрана</h2>
        <div class="demo-phone" :class="{ connected }" :style="{ '--press-ease': pressEase }">
          <div class="native-top">
            <button type="button" class="native-power" :class="{ connecting }" :aria-pressed="connected || connecting" aria-label="Переключить подключение в демо" @click="toggleConnection">
              <svg class="power-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 3h-2v10h2V3zm4.83 2.17-1.42 1.42A7 7 0 1 1 7.59 6.6L6.17 5.17a9 9 0 1 0 11.66 0z"/></svg>
              <svg v-if="connecting" class="arc" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" /></svg>
            </button>
            <span class="native-status" role="status">{{ connecting ? 'Подключение…' : connected ? 'Подключено' : 'Не подключено' }}</span>
            <div class="native-picker">
              <span class="native-pill"><img :src="'/images/provider-flags/'+selected.flag+'.webp'" alt=""> {{ location }} · {{ selected.ping }}</span>
              <select v-model="location" aria-label="Локация в демо"><option v-for="item in locations" :key="item.name">{{ item.name }}</option></select>
            </div>
          </div>
          <div class="preview-card">
            <div class="provider-brand">
              <img v-if="showLogo && logo && !logoError" class="provider-initial" :src="logo" referrerpolicy="no-referrer" alt="" @error="logoError = true">
              <span v-else class="provider-initial">{{ Array.from(values['profile-title']?.trim() || 'Demo VPN')[0].toUpperCase() }}</span>
              <div class="summary"><strong>{{ values['profile-title']?.trim() || 'Demo VPN' }}</strong><small class="native-usage">23,50 ГБ из 100,00 ГБ<br>осталось 27 дней</small><span>{{ values['profile-description'] }}</span></div>
              <a v-if="headers['profile-web-page-url']" class="action" aria-label="Сайт" :href="headers['profile-web-page-url']" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg></a>
              <a v-if="headers['support-url']" class="action" aria-label="Поддержка" :href="headers['support-url']" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path v-if="/t\.me|^tg:/.test(headers['support-url'])" d="m3 4 19 8-19 8 3-7 10-1-10-1z"/><path v-else d="M4 14v-2a8 8 0 0 1 16 0v6l-3 2h-4M4 12h3v6H4zm13 0h3v6h-3z"/></svg></a>
              <button v-if="!values.announce" class="action" :disabled="refreshing" :aria-label="refreshing ? 'Обновление подписки' : 'Обновить подписку в демо'" @click="refreshPreview"><svg v-if="refreshing" class="refresh-progress" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg><span class="refresh-arrow" :class="{ busy: refreshing }">↻</span></button>
            </div>
            <button v-if="logo && !showLogo" class="logo-preview" @click="showLogo = true">Показать логотип</button>
            <span v-if="logoError" class="field-error">Не удалось загрузить логотип.</span>
            <div v-if="values.announce" class="announce-row">
              <div class="notice"><span aria-hidden="true">◀</span><div>
                <button class="notice-text" :aria-expanded="expanded" @click="toggleNotice"><span ref="announcement" :class="{ clamp: !expanded }">{{ values.announce }}</span></button>
                <a v-if="headers['announce-url'] && (expanded || !clipped)" :href="headers['announce-url']" target="_blank" rel="noopener noreferrer">Подробнее</a></div>
                <button v-if="clipped || expanded" :aria-label="expanded ? 'Свернуть' : 'Показать полностью'" @click="toggleNotice">{{ expanded ? '⌃' : '⌄' }}</button></div>
              <button class="action" :disabled="refreshing" :aria-label="refreshing ? 'Обновление подписки' : 'Обновить подписку в демо'" @click="refreshPreview"><svg v-if="refreshing" class="refresh-progress" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg><span class="refresh-arrow" :class="{ busy: refreshing }">↻</span></button>
            </div>
            <a v-if="!values['banner-text']?.trim() && headers['banner-button-url']" class="banner-action" :href="headers['banner-button-url']" target="_blank" rel="noopener noreferrer">{{ values['banner-button-text'] || 'Подробнее' }}</a>
          </div>
          <div v-if="values['banner-text']?.trim()" class="preview-card banner" :style="{ '--banner': headers['banner-bg-color'] }"><span>{{ values['banner-text'] }}</span>
            <a v-if="headers['banner-button-url']" class="banner-action" :href="headers['banner-button-url']" target="_blank" rel="noopener noreferrer">{{ values['banner-button-text'] || 'Подробнее' }}</a>
          </div>
          <div class="native-list" aria-label="Локации">
            <button v-for="(item, i) in locations" type="button" :key="item.name" :aria-label="item.name" :aria-pressed="item.name === location" :style="{ top: (15.5 + 15.8 * i) + '%' }" @click="location = item.name">
              <span class="native-row" :class="{ chosen: item.name === location }"><span class="row-name"><img :src="'/images/provider-flags/'+item.flag+'.webp'" alt="">{{ item.name }}</span><span>• {{ item.ping }} {{ item.name === location ? '✓' : '' }}</span></span>
            </button>
          </div>
        </div>
      </section>
      <section v-if="behavior.length" class="config-panel behavior"><h2>Параметры подписки</h2><dl><template v-for="item in behavior" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></template></dl></section>
      <section class="config-panel export">
        <div class="export-heading">
          <h2>Заголовки</h2>
          <select v-model="outputFormat" aria-label="Формат заголовков" @change="status = ''">
            <option value="http">HTTP</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <textarea ref="outputField" :value="output" readonly rows="7" spellcheck="false" aria-label="Сгенерированные заголовки" placeholder="Здесь появятся значения из формы" />
        <div class="export-actions">
          <button type="button" class="copy" :disabled="!ready" @click="copyHeaders">Скопировать</button>
          <button type="button" :disabled="!ready" @click="downloadHeaders">Скачать</button>
        </div>
        <span class="export-status" role="status">{{ status }}</span>
      </section>
    </div>
  </div>
</template>

<style scoped>
.provider-config { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .9fr); gap: 16px; margin: 24px 0; }
.config-fields, .config-results { display: grid; align-content: start; gap: 12px; min-width: 0; }
.config-results { position: sticky; top: calc(var(--vp-nav-height) + 16px); align-self: start; }
.config-panel { border: 1px solid var(--vp-c-divider); border-radius: 16px; background: var(--vp-c-bg-elv); padding: 16px; min-width: 0; }
summary { cursor: pointer; font-weight: 650; }
.config-field { margin-top: 13px; display: grid; gap: 5px; }
.config-field label, .field-note { font-size: 13px; line-height: 1.4; color: var(--vp-c-text-2); }
.field-note { margin: 12px 0 0; }
input, select, textarea { box-sizing: border-box; width: 100%; min-width: 0; padding: 8px 10px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 8px; color: var(--vp-c-text-1); font: inherit; font-size: 14px; }
select { appearance: auto; }
textarea { resize: vertical; }
input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.field-error { color: var(--vp-c-danger-1); font-size: 12px; line-height: 1.45; }
.config-panel h2 { margin: 0 0 12px; padding: 0; border: 0; font-size: 16px; line-height: 1.4; }
.demo-phone { container-type: inline-size; max-width: 360px; margin: auto; overflow: hidden; border-radius: 20px; background: #100e18; color: #f6f5fa; --vp-c-bg: #1e1c26; --vp-c-divider: #ffffff26; --vp-c-text-2: #bdbac6; --vp-c-brand-1: #c6baff; --vp-c-brand-soft: #343041; }
.native-top, .native-card, .native-list { background-image: url('/images/android-home-dark-1.2.0.webp'); background-size: 100% auto; background-repeat: no-repeat; position: relative; }
.native-top { aspect-ratio: 360 / 325; background-position: top; }
.native-card { aspect-ratio: 360 / 146; background-position: center 49.694%; }
.native-list { aspect-ratio: 360 / 329; background-position: bottom; }
.native-power, .native-picker, .native-list button { position: absolute; }
.native-power { inset: 29.5% 29% auto; height: 46%; border-radius: 50%; }
.native-power[aria-pressed=true] { box-shadow: inset 0 0 0 2px #70dfbf; background: #48d49a22; }
.native-status, .native-pill { color: #fff; background: #1e1a29; text-align: center; font: 600 3.7cqw/1.4 system-ui; }
.native-status { position: absolute; inset: 78% 20% auto; padding: 1%; border-radius: 12px; }
.native-picker { inset: 87% 23% 2%; display: grid; place-items: center; }
.native-picker select { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.native-picker:focus-within { outline: 2px solid #b4a6ff; border-radius: 20px; }
.native-pill { padding: 3px 9px; border-radius: 16px; }
.native-list button { left: 4%; width: 92%; height: 15.6%; }
.native-row { display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 5%; background: #211e29; font-size: 3.7cqw; }
.native-row.chosen { background: #302a40; }
.native-list button:last-child { overflow: hidden; border-radius: 0 0 18px 18px; }
.native-usage { display: block; color: #bdbac6; font-size: 11px; line-height: 1.3; }
.demo-phone .preview-card { margin: 0 4%; background: linear-gradient(155deg,#29272e,#121117); }
.preview-card { border: 1px solid var(--vp-c-divider); border-radius: 13px; padding: 12px; background: var(--vp-c-bg); }
.provider-brand { display: flex; align-items: flex-start; gap: 10px; overflow-wrap: anywhere; }
.provider-brand div { min-width: 0; }
.provider-brand div span { display: block; white-space: pre-wrap; font-size: 13px; color: var(--vp-c-text-2); }
.provider-initial { display: grid; place-items: center; flex: 0 0 36px; width: 36px; height: 36px; object-fit: cover; border-radius: 10px; font-weight: 700; color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.logo-preview { margin-top: 8px; font-size: 12px; color: var(--vp-c-brand-1); text-decoration: underline; }
.preview-links, .export-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
.preview-links span, .preview-note small { border-radius: 8px; padding: 2px 7px; background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); font-size: 12px; }
.preview-note { display: grid; justify-items: start; gap: 7px; margin-top: 10px; padding: 8px; border: 1px solid var(--vp-c-divider); border-radius: 8px; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 13px; line-height: 1.45; }
.banner-preview { background: color-mix(in srgb, var(--banner-color, var(--vp-c-brand-1)) 15%, var(--vp-c-bg)); }
.export-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.export-heading h2 { margin: 0; }
.export-heading select { width: auto; }
.export textarea { font-family: var(--vp-font-family-mono); font-size: 12px; line-height: 1.5; }
.export-actions button { padding: 6px 10px; border: 1px solid var(--vp-c-divider); border-radius: 8px; font-size: 13px; font-weight: 600; }
.export-actions .copy { background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); }
.export-actions button:disabled { opacity: .55; cursor: default; }
.export-status { display: block; min-height: 1.5em; margin-top: 5px; font-size: 12px; color: var(--vp-c-text-2); }
@media (max-width: 700px) {
  .provider-config { grid-template-columns: minmax(0, 1fr); }
  .config-results { position: static; }
}
.provider-brand {align-items:center}
.action svg {width:55%;height:55%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}
.summary {flex:1;min-width:0}.summary strong,.summary span {display:block;white-space:nowrap!important;text-overflow:ellipsis;overflow:hidden}
.demo-phone .preview-card {border-radius:20px;padding:12px}
.native-pill,.row-name,.announce-row,.notice {display:flex;align-items:center;gap:8px}
.native-pill img,.row-name img {border-radius:50%;object-fit:cover;width:6cqw;height:6cqw}
.row-name img {width:8.5cqw;height:8.5cqw}.native-row {padding:0 3.5%;border-bottom:1px solid #ffffff09}
.native-pill {justify-content:center;min-width:66%}
.action {display:grid;place-items:center;background:#333042;color:#c6baff!important;text-decoration:none!important;border-radius:50%;width:9cqw;height:9cqw;flex:none}
.announce-row {margin-top:10px}.notice {align-items:flex-start;flex:1;min-width:0;background:#ffffff10;padding:9px;border-radius:12px;font-size:13px}.notice {overflow:hidden;box-sizing:border-box}.notice>div {min-width:0;flex:1}
.notice-text {display:block;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere}.clamp,.banner>span {display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.banner>span {-webkit-line-clamp:8;white-space:pre-wrap;overflow-wrap:anywhere}.demo-phone .banner {margin-top:10px;background:color-mix(in srgb,var(--banner,#302c38) 78%,#181420)}
.banner-action {display:block;text-align:center;padding:8px;margin-top:10px;border-radius:12px;background:#776bd8;color:white!important;text-decoration:none!important;overflow-wrap:anywhere}
.behavior dl {margin:0}.behavior dt {font-size:13px;color:var(--vp-c-text-2)}.behavior dd {margin:0 0 8px;overflow-wrap:anywhere}
.demo-phone {position:relative;isolation:isolate;background:#101018}
.demo-phone::before,.demo-phone::after {content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(circle closest-side at 22% 21%,#6366f14d,transparent),radial-gradient(circle closest-side at 87% 42%,#a855f74d,transparent),radial-gradient(circle closest-side at 58% 77%,#2563eb4d,transparent);transition:opacity 900ms cubic-bezier(.77,0,.175,1),transform 1400ms cubic-bezier(.77,0,.175,1)}
.demo-phone::after {opacity:0;transform:translate(-8%,5%);background:radial-gradient(circle at 45% 17%,#10b98180,transparent 40%),radial-gradient(circle at 72% 50%,#0ea5e980,transparent 40%),radial-gradient(circle at 36% 82%,#22c55e80,transparent 38%)}
.demo-phone.connected::before {opacity:0;transform:translate(8%,-5%)}.demo-phone.connected::after {opacity:1;transform:none}
.native-top {background:none}.native-top::before {content:"";position:absolute;inset:0;background:url('/images/android-home-dark-1.2.0.webp') top / 100% auto no-repeat;mask-image:linear-gradient(black 22%,transparent 29%)}
.native-status {background:none;color:#bcbac4}
.native-power,.native-power[aria-pressed=true] {display:grid;place-items:center;background:linear-gradient(140deg,#302d3b,#191820);color:#f5f5f7;border:1px solid #ffffff26;box-shadow:0 4px 14px #0003;transition:color 260ms cubic-bezier(.23,1,.32,1),transform 240ms var(--press-ease,ease-out)}
.native-power:active {transform:scale(.95)}
.native-power::before,.native-power::after {content:"";position:absolute;pointer-events:none;border-radius:50%}
.native-power::before {inset:-15%;z-index:-1;background:radial-gradient(circle,#34d39959,transparent 71%);opacity:0;transition:opacity 500ms cubic-bezier(.23,1,.32,1)}
.native-power::after {inset:5.5%;border:2px solid #f5f5f72e;transition:border-color 260ms cubic-bezier(.23,1,.32,1)}
.connected .native-power {color:#34d399}.connected .native-power::before {opacity:1}.connected .native-power::after {border:3px solid #34d399}.native-power.connecting::after {border-color:transparent}
.power-icon {width:32%;height:32%}
.arc {position:absolute;inset:0;width:100%;height:100%;animation:spin 1100ms linear infinite}.arc circle {fill:none;stroke:#7c7cff;stroke-width:1.65;stroke-linecap:round;animation:sweep 900ms cubic-bezier(.77,0,.175,1) infinite alternate}
.refresh-progress {animation:spin 1333ms linear infinite}.refresh-progress circle {stroke:#bcb5ff;stroke-linecap:round;animation:refresh-sweep 1333ms ease-in-out infinite}
.refresh-arrow.busy {display:none}@keyframes refresh-sweep {0%,100% {stroke-dasharray:3 57}50% {stroke-dasharray:42 57}}
@keyframes spin {to {transform:rotate(360deg)}}@keyframes sweep {from {stroke-dasharray:54 277}to {stroke-dasharray:115 277}}
.native-row {transition:background 260ms cubic-bezier(.23,1,.32,1)}
@media(prefers-reduced-motion:reduce){.demo-phone *, .demo-phone *::before {animation:none!important;transition:none!important}.arc {display:none}.native-power.connecting::after {border-color:#7c7cff}.refresh-progress {display:none}.refresh-arrow.busy {display:inline}}
</style>
