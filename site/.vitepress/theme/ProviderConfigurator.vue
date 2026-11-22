<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'

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
  { name: 'Германия', flag: '🇩🇪', ping: 22 },
  { name: 'Нидерланды', flag: '🇳🇱', ping: 17 },
  { name: 'Финляндия', flag: '🇫🇮', ping: 14 },
  { name: 'Латвия', flag: '🇱🇻', ping: 8 },
]
const location = ref('Латвия')
const selected = computed(() => locations.find(item => item.name === location.value)!)
const customCard = computed(() => ['profile-title', 'profile-description', 'profile-web-page-url', 'support-url', 'announce', 'banner-text'].some(key => values[key]?.trim()) || !!logo.value)
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
        <div class="demo-phone" :class="{ connected }">
          <div class="native-top">
            <button type="button" class="native-power" :aria-pressed="connected" aria-label="Переключить подключение в демо" @click="connected = !connected"></button>
            <span v-if="connected" class="native-status" role="status">Подключено</span>
            <div class="native-picker">
              <span v-if="location !== 'Латвия'" class="native-pill">{{ selected.flag }} {{ location }} · {{ selected.ping }}</span>
              <select v-model="location" aria-label="Локация в демо"><option v-for="item in locations" :key="item.name">{{ item.name }}</option></select>
            </div>
          </div>
          <div v-if="!customCard" class="native-card" role="img" aria-label="Карточка Demo VPN с расходом трафика и объявлением"></div>
          <div v-else class="preview-card">
          <div class="provider-brand">
            <img v-if="showLogo && logo && !logoError" class="provider-initial" :src="logo" referrerpolicy="no-referrer" alt="" @error="logoError = true">
            <span v-else class="provider-initial" aria-hidden="true">{{ (values['profile-title']?.trim() || 'М').slice(0, 1).toUpperCase() }}</span>
            <div>
              <strong>{{ values['profile-title']?.trim() || 'Мой VPN' }}</strong>
              <small class="native-usage">23,50 ГБ из 100,00 ГБ<br>осталось 27 дней</small>
              <span v-if="values['profile-description']">{{ values['profile-description'] }}</span>
            </div>
          </div>
          <button v-if="logo && !showLogo" class="logo-preview" type="button" @click="showLogo = true">Показать логотип</button>
          <span v-if="logoError" class="field-error">Не удалось загрузить логотип.</span>
          <div v-if="values['profile-web-page-url'] || values['support-url']" class="preview-links">
            <span v-if="values['profile-web-page-url']">Сайт</span>
            <span v-if="values['support-url']">Поддержка</span>
          </div>
          <div v-if="values.announce" class="preview-note">
            {{ values.announce }}<small v-if="values['announce-url']">Подробнее</small>
          </div>
          <div v-if="values['banner-text']" class="preview-note banner-preview" :style="{ '--banner-color': configuration.headers['banner-bg-color'] }">
            {{ values['banner-text'] }}<small v-if="values['banner-button-text'] && values['banner-button-url']">{{ values['banner-button-text'] }}</small>
          </div>
        </div>
          <div class="native-list" aria-label="Локации">
            <button v-for="(item, i) in locations" type="button" :key="item.name" :aria-label="item.name" :aria-pressed="item.name === location" :style="{ top: (15.5 + 15.8 * i) + '%' }" @click="location = item.name">
              <span v-if="location !== 'Латвия' && (item.name === location || i === 3)" class="native-row" :class="{ chosen: item.name === location }"><span>{{ item.flag }}　{{ item.name }}</span><span>• {{ item.ping }} {{ item.name === location ? '✓' : '' }}</span></span>
            </button>
          </div>
        </div>
      </section>
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
</style>
