import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import DownloadList from './DownloadList.vue'
import HeroDownload from './HeroDownload.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // Кнопка «Скачать» с прямой ссылкой на APK — прямо в шапке главной страницы.
  Layout: () => h(DefaultTheme.Layout, null, { 'home-hero-info-after': () => h(HeroDownload) }),
  enhanceApp({ app }) {
    app.component('DownloadList', DownloadList)
  },
} satisfies Theme
