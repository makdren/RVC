# Настройка Remnawave

Чтобы RVC получал от Remnawave полную конфигурацию, нужно одно правило в Response Rules. Остальное — имя провайдера, объявления, маршрутизация, настройки приложения — задаётся заголовками подписки.

## Response Rules

RVC всегда представляется как `RVC/<версия>` (например, `RVC/1.0.3`). Добавьте в **Subscription → Response Rules** правило выше стандартного `Fallback Base64` (правила проверяются сверху вниз до первого совпадения):

```json
{
  "name": "RVC",
  "description": "Xray JSON для клиента RVC",
  "enabled": true,
  "operator": "AND",
  "conditions": [
    { "headerName": "user-agent", "operator": "REGEX", "value": "^RVC", "caseSensitive": false }
  ],
  "responseType": "XRAY_JSON",
  "responseModifications": {
    "additionalExtendedClientsRegex": ["^RVC/"]
  }
}
```

Или допишите `^RVC` в регулярку существующего правила — и туда же `responseModifications`. При `caseSensitive: false` панель сравнивает значения в нижнем регистре, поэтому `^RVC` совпадёт с `RVC/1.0.5`.

::: tip Описание серверов
Remnawave отдаёт «Описание сервера» хостов (`serverDescription`) только «расширенным клиентам»: встроенный список панели RVC не содержит, поэтому его нужно добавить через `additionalExtendedClientsRegex`, как в примере выше. Без этого под именем локации будет только протокол (`VLESS`).
:::

С `XRAY_JSON` клиент получает ваш шаблон целиком: маршрутизацию, DNS и балансировщики. Если в шаблоне виртуального хоста есть балансировщик (например, `leastLoad` с `burstObservatory`, см. [Xray JSON Advanced](https://docs.rw/learn/xray-json-advanced)), RVC покажет его как «Автовыбор».

::: warning Без правила
RVC попадёт под стандартное правило `Fallback Base64` и получит `XRAY_BASE64`. Подписка будет работать, но без балансировщиков из шаблона и без описаний серверов. Настройка «Serve JSON at base subscription» тут не поможет: панель применяет её только к своему встроенному списку клиентов.
:::

## Лимит устройств

Включите **Subscription → Settings → HWID Device Limit**: RVC всегда присылает `x-hwid`, отключить это нельзя. Без `x-hwid` панель с включённым лимитом отвечает 404. Как считается HWID — в разделе [Запрос подписки](/provider/subscription#как-считается-hwid).

## Дополнительные заголовки

В **Subscription → Settings → Response headers** добавьте нужные заголовки из [справочника](/provider/headers):

```
profile-title: base64:<base64 от "Мой VPN\nБыстрые серверы в Европе">
support-url: https://t.me/my_support_bot
profile-web-page-url: https://my-vpn.example
profile-logo-url: https://my-vpn.example/logo.png
announce: rwEncodeBase64:Текст объявления
routing: rvc://routing/onadd/<base64 JSON профиля>
```

::: tip Кириллица в заголовках
HTTP-заголовки не могут содержать кириллицу напрямую. Префикс `rwEncodeBase64:` просит Remnawave закодировать значение само — клиент получит `base64:…`. Можно передать и готовое `base64:…`, например когда в `profile-title` нужна вторая строка с описанием.
:::

## Шаблон XRAY_JSON

Шаблон используется почти без изменений: `routing`, `dns`, балансировщики и `observatory` работают как есть. RVC меняет только то, что нужно для безопасности:

- SOCKS/HTTP-входы шаблона (`10808`, `10809`) заменяются встроенным TUN — локальных портов нет;
- секции `api`, `metrics` и правила для служебных входов удаляются;
- геотеги, которых нет во встроенных базах, докачиваются из Loyalsoldier, а неизвестные — отбрасываются, чтобы ядро всё равно запустилось.

Имя локации берётся из `remarks`, описание — из `meta.serverDescription`. Флаг — из эмодзи в начале `remarks`.
