---
layout: home

hero:
  name: RVC
  text: VPN-клиент для Android, TV и Windows
  tagline: Одна кнопка, подписка провайдера и ничего лишнего.
  image:
    src: /logo.svg
    alt: RVC
  actions:
    - theme: alt
      text: Начало работы
      link: /guide/
    - theme: alt
      text: Для провайдеров
      link: /provider/
    - theme: alt
      text: Чат в Telegram
      link: https://t.me/rvcapp

features:
  - icon: ⚡
    title: Xray-core и AmneziaWG
    details: VLESS (Reality, Vision, xhttp), VMess, Trojan, Shadowsocks, Hysteria2, SOCKS5, HTTP, WireGuard и AmneziaWG. Полные XRAY_JSON с автовыбором.
  - icon: 🧭
    title: Всё от провайдера
    details: Имя и логотип, трафик и срок, объявления, профиль маршрутизации и настройки приходят вместе с подпиской. HWID для лимита устройств.
  - icon: 🛡️
    title: VPN без локального прокси
    details: Трафик идёт через TUN ядра, локальных прокси на 127.0.0.1 нет. DNS — внутри туннеля, kill switch, шифрование данных.
  - icon: 🟢
    title: Индикатор белых списков
    details: Бейдж «БС» сразу показывает, ограничил ли оператор интернет белыми списками.
  - icon: 🔋
    title: Бережёт батарею
    details: В покое не рисует ни одного кадра, реже опрашивает сеть в фоне. Сетевой слой на Rust.
  - icon: 🔄
    title: Обновляется сам
    details: Новая версия приходит из GitHub Releases; перед установкой сверяются SHA-256 и подпись APK.
  - icon: 🖥️
    title: Windows
    details: Окно с боковой навигацией, меню подключения в трее, горячие клавиши и запуск вместе с Windows. VPN на wintun без открытых портов.
---

<div class="home-section">

## Скачать {#download}

<DownloadList />

Перед установкой Android один раз попросит разрешить установку из браузера. Дальше RVC [обновляется сам](/guide/updates): о новой версии придёт уведомление, а перед установкой приложение сверит SHA-256 и подпись APK.

### Windows {#windows}

<WindowsDownload />

Windows 10 и 11, 64 бит. Режим VPN работает через адаптер wintun и требует прав администратора, режим прокси — без них. Трей, горячие клавиши, автозапуск и обновление из приложения — в разделе [RVC для Windows](/guide/windows).

<div class="shots">
  <figure><img src="/images/windows-home.jpg" alt="RVC для Windows"><figcaption>Главное окно</figcaption></figure>
  <figure><img src="/images/windows-tray.jpg" alt="Меню трея"><figcaption>Меню в трее</figcaption></figure>
</div>

### Android TV {#android-tv}

В RVC 1.1.1 есть отдельный интерфейс для пульта. Подписку можно передать с телефона:
откройте QR-код на телевизоре, отсканируйте его в RVC на телефоне и подтвердите добавление.
Подробности — в разделе [RVC для Android TV](/guide/android-tv).

<div class="tv-shots">
  <figure><img src="/images/android-tv-home-1.1.1.png" alt="Главный экран RVC 1.1.1 для Android TV с демонстрационной подпиской" loading="lazy"><figcaption>Android TV · управление пультом</figcaption></figure>
</div>

## Как выглядит

<div class="shots">
  <figure><img src="/images/home-dark-1.1.1.png" alt="Главный экран RVC 1.1.1 в эмуляторе"><figcaption>Android 1.1.1 · тёмная тема</figcaption></figure>
  <figure><img src="/images/locations.jpg" alt="Локации"><figcaption>Локации и пинг</figcaption></figure>
  <figure><img src="/images/routing.jpg" alt="Маршрутизация"><figcaption>Маршрутизация</figcaption></figure>
  <figure><img src="/images/settings.jpg" alt="Настройки"><figcaption>Настройки</figcaption></figure>
  <figure><img src="/images/home-light-1.1.1.png" alt="RVC 1.1.1 в светлой теме"><figcaption>Светлая тема</figcaption></figure>
  <figure><img src="/images/android-import-1.1.1.png" alt="Добавление подписки и сканирование QR"><figcaption>Добавление и QR</figcaption></figure>
  <figure><img src="/images/home-layout-1.1.1.png" alt="Изменение порядка блоков главного экрана"><figcaption>Порядок блоков</figcaption></figure>
</div>

Новые скриншоты Android и TV сняты в эмуляторе с демонстрационной подпиской.

## Три шага

1. Нажмите **«Скачать для Android»** вверху страницы и установите APK.
2. Скопируйте ссылку на подписку у провайдера и нажмите в RVC **«Из буфера»**.
3. Нажмите большую кнопку — готово.

Подробнее — в разделе [Начало работы](/guide/).

</div>
