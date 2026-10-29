import { defineConfig } from 'vitepress'

const repo = 'https://github.com/makdren/RVC'
const site = 'https://rvc.rowny.online'

export default defineConfig({
  lang: 'ru-RU',
  title: 'RVC',
  description: 'VPN-клиент для Android: подписки Remnawave, Xray-core, AmneziaWG.',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: site },
  appearance: 'dark',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#07070B' }],
    ['meta', { name: 'yandex-verification', content: '3691c7dbe36409ee' }],
    ['meta', { property: 'og:title', content: 'RVC — VPN-клиент для Android' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'ru_RU' }],
    ['meta', { property: 'og:description', content: 'VPN-клиент для Android: одна кнопка, подписка провайдера и ничего лишнего.' }],
  ],
  // Канонический адрес каждой страницы — тот же, что в sitemap.xml (без .html и index).
  transformPageData(pageData) {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    const url = `${site}/${path}`
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
    )
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'RVC',
    nav: [
      { text: 'Пользователям', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Провайдерам', link: '/provider/', activeMatch: '/provider/' },
      { text: 'Разработчикам', link: '/dev/build', activeMatch: '/dev/' },
      { text: 'Изменения', link: '/changelog', activeMatch: '/changelog' },
      { text: 'Скачать', link: '/#download' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Пользователям',
          items: [
            { text: 'Начало работы', link: '/guide/' },
            { text: 'RVC для Windows', link: '/guide/windows' },
            { text: 'Локации и пинг', link: '/guide/locations' },
            { text: 'Маршрутизация и приложения', link: '/guide/routing' },
            { text: 'Белые списки', link: '/guide/whitelist' },
            { text: 'Режим прокси', link: '/guide/proxy' },
            { text: 'Плитка, виджет, ярлыки', link: '/guide/quick-access' },
            { text: 'Обновление приложения', link: '/guide/updates' },
            { text: 'Частые вопросы', link: '/guide/faq' },
          ],
        },
      ],
      '/provider/': [
        {
          text: 'Провайдерам',
          items: [
            { text: 'Настройка Remnawave', link: '/provider/' },
            { text: 'Запрос подписки и HWID', link: '/provider/subscription' },
            { text: 'Заголовки ответа', link: '/provider/headers' },
            { text: 'Ссылки серверов', link: '/provider/links' },
            { text: 'Профили маршрутизации', link: '/provider/routing' },
            { text: 'Deep links', link: '/provider/deeplinks' },
            { text: 'Push-уведомления', link: '/provider/notifications' },
          ],
        },
      ],
      '/dev/': [
        {
          text: 'Разработчикам',
          items: [
            { text: 'Сборка и выпуск', link: '/dev/build' },
            { text: 'Устройство приложения', link: '/dev/architecture' },
            { text: 'Безопасность', link: '/dev/security' },
            { text: 'Ограничения', link: '/dev/limitations' },
            { text: 'Производительность и сравнение', link: '/dev/performance' },
            { text: 'Статистика', link: '/dev/stats' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'telegram', link: 'https://t.me/rvcapp', ariaLabel: 'Чат в Telegram' },
      { icon: 'github', link: repo },
    ],
    editLink: {
      pattern: `${repo}/edit/main/site/:path`,
      text: 'Предложить правку',
    },
    outline: { level: [2, 3], label: 'На этой странице' },
    docFooter: { prev: 'Назад', next: 'Дальше' },
    lastUpdated: { text: 'Обновлено' },
    darkModeSwitchLabel: 'Тема',
    lightModeSwitchTitle: 'Светлая тема',
    darkModeSwitchTitle: 'Тёмная тема',
    sidebarMenuLabel: 'Меню',
    returnToTopLabel: 'Наверх',
    langMenuLabel: 'Язык',
    notFound: {
      title: 'Страница не найдена',
      quote: 'Такой страницы нет — возможно, её переименовали.',
      linkText: 'На главную',
    },
    footer: {
      message: 'GPL-3.0 · Xray-core (MPL-2.0), amneziawg-go (MIT) · <a href="https://t.me/rvcapp">чат в Telegram</a>',
      copyright: 'RVC',
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Поиск', buttonAriaLabel: 'Поиск' },
          modal: {
            displayDetails: 'Подробнее',
            resetButtonTitle: 'Сбросить',
            backButtonTitle: 'Закрыть',
            noResultsText: 'Ничего не найдено',
            footer: { selectText: 'выбрать', navigateText: 'перейти', closeText: 'закрыть' },
          },
        },
      },
    },
  },
})
