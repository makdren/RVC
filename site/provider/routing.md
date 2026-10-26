# Профили маршрутизации

RVC использует **формат профилей Happ и INCY** (тот же JSON, что генерирует [routing.happ.su](https://routing.happ.su)), поэтому профили, которые провайдер уже отдаёт для этих клиентов, работают без изменений.

## Где взять профиль

| Источник | Пример |
| :-- | :-- |
| Заголовок `autorouting` | `autorouting: happ://autorouting/onadd/https://example.com/profile.json` — с автообновлением |
| Строка в теле подписки | `://autorouting/onadd/https://…` или `happ://routing/onadd/<base64>` |
| Заголовок `routing` | `routing: happ://routing/onadd/<base64>`, просто `<base64>` или `off` |
| Deep link | `happ://routing/add/<base64>`, `incy://routing/onadd/<base64>` |
| Буфер обмена | «Маршрутизация» → «Вставить профиль или ссылку» |

Если источников несколько, применяется первый по приоритету: заголовок `autorouting` → URL в теле → заголовок `routing` → base64 в теле.

## Виды ссылок

| Ссылка | Действие |
| :-- | :-- |
| `://routing/add/{base64 или url}` | Добавить профиль |
| `://routing/onadd/{base64 или url}` | Добавить и сразу включить |
| `://autorouting/add/{url}`, `://autorouting/onadd/{url}` | Добавить с автообновлением по URL (раз в 24 часа) |
| `://onadd/{…}`, `://routing/{base64}` | Сокращённые формы |
| `://routing/add?data={base64}` | Данные в параметре |
| `://routing/off`, заголовок `routing: off` или `routing-enable: 0` | Выключить маршрутизацию |

Схема перед `://` может быть любой: `happ`, `incy`, `rvc` или пустой. Ссылки `github.com/…/blob/…` автоматически превращаются в `raw.githubusercontent.com`. Файл по URL может содержать JSON, base64 или вложенную ссылку `happ://routing/…`.

## Поля профиля

Имена полей нечувствительны к регистру (`GlobalProxy` = `globalProxy`).

| Поле | По умолчанию | Описание |
| :-- | :-- | :-- |
| `Name` | `Default` | Имя. Профиль с тем же именем от той же подписки обновляется, а не дублируется |
| `GlobalProxy` | `true` | Куда идёт трафик, не попавший в правила: `true` — через VPN, `false` — напрямую |
| `RemoteDNSType`, `RemoteDNSDomain`, `RemoteDNSIP` (`RemoteDns`) | `DoH`, `https://cloudflare-dns.com/dns-query`, `1.1.1.1` | DNS для ресурсов через VPN; запросы идут через туннель. Запасной сервер — `https://dns.google/dns-query` |
| `DomesticDNSType`, `DomesticDNSDomain`, `DomesticDNSIP` (`DomesticDns`) | `DoU`, —, `77.88.8.8` | DNS для `DirectSites`, запросы идут напрямую |
| `DnsHosts` | — | Свои записи `{"домен": "IP"}` |
| `DirectSites`, `DirectIp` | — | Напрямую |
| `ProxySites`, `ProxyIp` | — | Через VPN |
| `BlockSites`, `BlockIp` | — | Блокировать |
| `RouteOrder` | `block-proxy-direct` | Порядок проверки групп правил |
| `DomainStrategy` | `IPIfNonMatch` | `AsIs`, `IPIfNonMatch`, `IPOnDemand` |
| `FakeDNS` | `false` | Виртуальные IP для доменов |
| `Geoipurl`, `Geositeurl` | — | Свои геобазы |
| `LastUpdated` | — | Unix-время; более новое значение принудительно перекачивает геобазы |

В правилах можно использовать `geosite:тег`, `geoip:тег`, `domain:`, `full:`, `regexp:`, `keyword:`, CIDR и IP. Частные сети (`10/8`, `172.16/12`, `192.168/16` и т. д.) всегда идут напрямую.

## Геобазы

- В APK встроены урезанные базы (около 1 МБ) с популярными тегами: `ru`, `private`, `category-ru`, `category-gov-ru`, `category-bank-ru`, `category-ads`, `google`, `youtube`, `telegram`, `discord`, `openai`, `meta`, `netflix` и другие.
- Если профиль указывает свои `Geoipurl`/`Geositeurl`, они скачиваются с проверкой `<url>.sha256`, если сервер его публикует. Стандартные базы Loyalsoldier хранятся одной общей копией для всех профилей.
- Если нужного тега нет ни в одной базе, автоматически скачиваются полные базы Loyalsoldier. Если тега нет и там, правило с ним отбрасывается, чтобы ядро всё равно запустилось.
- Перед каждым подключением из баз вырезаются **только теги, на которые ссылается конфигурация**: ядро загружает маленький файл и тратит меньше памяти.
- Геобазы профиля перепроверяются по интервалу `routing-geo-update-interval` (часы, по умолчанию 168).

## Встроенные профили

- **Россия напрямую** (по умолчанию): `geosite:category-ru`, `category-gov-ru`, `category-bank-ru`, `tld-ru`, `geoip:ru` и частные сети — напрямую, `geosite:category-ads` — блокируется.
- **Весь трафик через VPN:** напрямую только частные сети.

Профиль из подписки привязан к ней («Имя [Провайдер]») и удаляется вместе с подпиской. Изменения маршрутизации применяются при переподключении — RVC делает его сам.
