# Заголовки ответа

Все заголовки регистронезависимы. Текстовые значения можно передавать как `base64:…` (обязательно для кириллицы в HTTP-заголовках), а также `base64:gzip:…`, `gzip:base64:…`. Флаги: `1`, `true`, `yes` — включено, любое другое непустое значение — выключено.

## Карточка провайдера

| Заголовок | Значение |
| :-- | :-- |
| `profile-title` | Имя подписки. В `base64:` первая строка — имя, остальные — описание. Запасные варианты: `subscription-name`, имя файла из `content-disposition` |
| `profile-description` | Описание под именем |
| `profile-logo-url` (`profile-logo`, `logo-url`) | Логотип провайдера, только `https://`. PNG/JPEG/WebP до 1 МБ и 8192×8192; без логотипа показывается первая буква имени |
| `subscription-userinfo` | `upload=…; download=…; total=…; expire=…`. `total=0` — безлимит. `expire` в секундах (значение больше 32 000 000 000 считается миллисекундами). Значение `0` скрывает блок трафика |
| `support-url` | Кнопка поддержки; для `t.me` — иконка Telegram |
| `support-email` | Кнопка «Email» |
| `profile-web-page-url` (`homepage`) | Кнопка сайта |
| `premium-url` | Кнопка «Премиум» |

## Объявления и баннеры

Объявление `announce` всегда показывается на главном экране отдельной карточкой под карточкой провайдера. Видны первые четыре строки, «Показать полностью» раскрывает остальное, а при наличии `announce-url` есть ссылка «Подробнее». В уведомления объявление не попадает.

Под объявлением показывается **один** баннер по приоритету:

1. баннер окончания подписки — за 3 дня до `expire` и после него, если есть `expiry-banner-text` или `sub-expire: 1`;
2. баннер провайдера `banner-*`;
3. инфо-блок `sub-info-*`.

Если текст баннера совпадает с объявлением, он показывается один раз. Невидимые символы (`⠀`, пробелы нулевой ширины), которыми панели заполняют «пустой» текст, считаются пустотой: от такого баннера остаётся только кнопка.

| Заголовок | Значение |
| :-- | :-- |
| `announce` | Текст объявления |
| `announce-url` | Ссылка «Подробнее» |
| `banner-text`, `banner-button-text` | Текст баннера и кнопки |
| `banner-button-url` (`banner-url`) | Ссылка кнопки; `premium-url` приоритетнее |
| `banner-bg-color`, `banner-button-color` | Цвета `#RRGGBB` (или `#RRGGBBAA`) |
| `expiry-banner-text`, `expiry-banner-button-text`, `expiry-banner-button-url` (`expiry-banner-url`) | Баннер окончания подписки |
| `expiry-banner-bg-color`, `expiry-banner-button-color`, `expiry-banner-text-color`, `expiry-banner-button-text-color` | Его цвета |
| `sub-info-text`, `sub-info-button-text`, `sub-info-button-link`, `sub-info-color` (`red`/`green`/`blue`) | Инфо-блок. Значение `0` отключает |
| `sub-expire`, `notification-subs-expire` | Включить баннер и уведомления об окончании подписки |

Ссылки кнопок открываются только со схемами `https`, `http`, `tg`, `mailto`: остальные (например, `intent://`) игнорируются ради безопасности.

## Поведение приложения

| Заголовок | Значение |
| :-- | :-- |
| `profile-update-interval` | Интервал автообновления подписки, часы |
| `subscription-auto-update-enable` | Глобально включить/выключить автообновление |
| `subscription-auto-update-open-enable` | Обновлять подписки при каждом открытии приложения |
| `subscription-ping-onopen-enabled` | Пинговать серверы при открытии |
| `subscription-autoconnect` | Подключаться при открытии приложения |
| `subscription-autoconnect-type` | `lastused` (по умолчанию), `lowestdelay`, `random` |
| `sort-order` / `subscriptions-sort-type` | `none`/`without`, `ping`, `name`/`alphabet` |
| `ping-type` | `proxy`, `proxy-head`, `tcp`, `icmp`. Многие Wi-Fi-роутеры и операторы режут ICMP целиком; если не ответил ни один сервер, RVC подскажет выбрать TCP или «через прокси» |
| `check-url-via-proxy` | URL для пинга через прокси и кнопки «Проверить» (по умолчанию `https://www.gstatic.com/generate_204`) |
| `hide-check` | Скрыть кнопку «Проверить» |
| `hide-url` | Не показывать и не давать скопировать адрес подписки |
| `dont-use-filter` | Не фильтровать серверы по меткам `only Wi-Fi` / `only Mobile` в имени |
| `subscription-request-timeout` | Таймаут запроса подписки, секунды (5–30, по умолчанию 12) |
| `new-url` | Перенести подписку на новый адрес целиком (только `https`) |
| `new-domain` | Заменить только домен, сохранив путь и токен |
| `fallback-url` | Запасной адрес, если основной недоступен |
| `notifications-url` (`push-url`) | Адрес push-сообщений, см. [Уведомления](/provider/notifications) |

## Сеть и туннель

| Заголовок | Значение |
| :-- | :-- |
| `routing`, `autorouting`, `routing-enable`, `routing-geo-update-interval` | См. [Маршрутизация](/provider/routing) |
| `per-app-proxy-enable` | `1`/`0` — включить или выключить раздельное туннелирование |
| `per-app-proxy-mode` | `bypass` — выбранные приложения мимо VPN; `proxy`/`on` — только они через VPN; `off` |
| `per-app-proxy-list` | Пакеты через запятую, `base64:…` или `https://` ссылка на текстовый список — добавляются к списку |
| `per-app-proxy-list-set` | Заменить список целиком |
| `per-app-proxy-list-invert` | «Все, кроме перечисленных» |
| `fragmentation-enable`, `fragmentation-packets`, `fragmentation-length`, `fragmentation-interval`, `fragmentation-maxsplit` | Фрагментация TLS ClientHello (для VLESS/VMess/Trojan с TLS или Reality) |
| `noises-enable`, `noises-type` (`noises-packet-type`), `noises-packet` (`noises-rand`), `noises-delay` | Шумовые UDP-пакеты (Hysteria2, WireGuard) |
| `mux-enable`, `mux-tcp-connections`, `mux-xudp-connections`, `mux-quic` | Мультиплексирование (кроме Vision и xhttp) |
| `sniffing-enable` | Определение доменов по трафику для правил маршрутизации |
| `server-address-resolve-enable`, `server-address-resolve-dns-domain`, `server-address-resolve-dns-ip` | Разрешать адрес сервера через DoH до подключения (защита от подмены DNS) |
| `exclude-routes`, `exclude-routes-set` | Подсети мимо туннеля (Android 13+) |
| `xray-tun-mtu` | MTU туннеля (576–65535) |
| `hide-vpn-icon` | Попытка скрыть значок VPN (Android 13+, работает не везде) |
| `providerid` (`provider-id`) | Сохраняется; на сторонние серверы ничего не отправляется |

## Ответы Remnawave о лимите устройств

| Заголовок | Что увидит пользователь |
| :-- | :-- |
| `x-hwid-active: true` | Отметка «Лимит устройств» в карточке подписки |
| `x-hwid-max-devices-reached: true` | Ошибка «Достигнут лимит устройств для подписки» + текст `announce`, если панель его прислала |
| `x-hwid-not-supported: true` | «Провайдер требует HWID» |
