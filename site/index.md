---
layout: home

hero:
  name: RVC
  text: VPN-клиент для Android
  tagline: Одна кнопка, подписка провайдера и ничего лишнего. Для панели Remnawave.
  image:
    src: /logo.svg
    alt: RVC
  actions:
    - theme: brand
      text: Скачать
      link: https://github.com/makdren/RVC/releases/latest
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
    title: Без открытых портов
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
---

<div class="home-section">

## Как выглядит

<div class="shots">
  <figure><img src="/images/home-dark.jpg" alt="Главный экран"><figcaption>Главный экран</figcaption></figure>
  <figure><img src="/images/locations.jpg" alt="Локации"><figcaption>Локации и пинг</figcaption></figure>
  <figure><img src="/images/routing.jpg" alt="Маршрутизация"><figcaption>Маршрутизация</figcaption></figure>
  <figure><img src="/images/settings.jpg" alt="Настройки"><figcaption>Настройки</figcaption></figure>
  <figure><img src="/images/home-light.jpg" alt="Светлая тема"><figcaption>Светлая тема</figcaption></figure>
</div>

## Три шага

1. Скачайте `RVC-x.y.z-arm64-v8a.apk` из [последнего релиза](https://github.com/makdren/RVC/releases/latest) и установите.
2. Скопируйте ссылку на подписку у провайдера и нажмите в RVC **«Из буфера»**.
3. Нажмите большую кнопку — готово.

Подробнее — в разделе [Начало работы](/guide/).

</div>
