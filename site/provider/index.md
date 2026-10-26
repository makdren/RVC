# Настройка Remnawave

RVC понимает те же заголовки и форматы, что Happ и INCY. Если панель уже настроена для них, для RVC нужно одно правило.

## Response Rules

RVC всегда представляется как `RVC/<версия>` (например, `RVC/1.0.3`). Добавьте в **Subscription → Response Rules** правило выше системного Fallback:

```json
{
  "name": "RVC",
  "description": "Xray JSON для клиента RVC",
  "enabled": true,
  "operator": "AND",
  "conditions": [
    { "headerName": "user-agent", "operator": "REGEX", "value": "^RVC", "caseSensitive": false }
  ],
  "responseType": "XRAY_JSON"
}
```

Или допишите `^RVC` в регулярку существующего правила.

С `XRAY_JSON` клиент получает шаблон целиком: автовыбор (балансировщик `leastLoad`), `burstObservatory`, вашу маршрутизацию и DNS.

::: warning Без правила
Remnawave отдаст ответ по умолчанию, обычно `XRAY_BASE64`. Подписка будет работать, но «Автовыбор» из шаблона превратится в обычный одиночный сервер.
:::

## Лимит устройств

Включите **HWID Device Limit** в настройках подписок: RVC всегда присылает `x-hwid`, отключить это нельзя. Как считается HWID — в разделе [Запрос подписки](/provider/subscription#как-считается-hwid).

## Дополнительные заголовки

В **Additional Response Headers** добавьте нужные заголовки из [справочника](/provider/headers):

```
profile-title: base64:<base64 от "Мой VPN\nБыстрые серверы в Европе">
support-url: https://t.me/my_support_bot
profile-web-page-url: https://my-vpn.example
profile-logo-url: https://my-vpn.example/logo.png
announce: base64:<base64 текста объявления>
routing: happ://routing/onadd/<base64 JSON профиля>
```

::: tip Кириллица в заголовках
HTTP-заголовки не могут содержать кириллицу напрямую — передавайте такие значения как `base64:…`.
:::

## Шаблон XRAY_JSON

Шаблон используется почти без изменений: `routing`, `dns`, балансировщики и `observatory` работают как есть. RVC меняет только то, что нужно для безопасности:

- SOCKS/HTTP-входы шаблона (`10808`, `10809`) заменяются встроенным TUN — локальных портов нет;
- секции `api`, `metrics` и правила для служебных входов удаляются;
- геотеги, которых нет во встроенных базах, докачиваются из Loyalsoldier, а неизвестные — отбрасываются, чтобы ядро всё равно запустилось.

Имя локации берётся из `remarks`, описание — из `meta.serverDescription`. Флаг — из эмодзи в начале `remarks`.
