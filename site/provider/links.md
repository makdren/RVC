# Ссылки серверов

| Схема | Формат |
| :-- | :-- |
| VLESS | `vless://uuid@host:port?type=tcp\|ws\|grpc\|xhttp\|httpupgrade\|kcp&security=none\|tls\|reality&sni=&fp=&pbk=&sid=&spx=&flow=&path=&host=&mode=&extra=&alpn=&pcs=&ech=&vcn=&pqv=&fm=#Имя` |
| VMess | `vmess://base64(JSON v2rayN)` |
| Trojan | `trojan://password@host:port?security=tls&sni=…#Имя` |
| Shadowsocks | `ss://base64(method:password)@host:port#Имя` или SIP002 целиком в base64 |
| Hysteria2 | `hysteria2://` или `hy2://password@host:443,5000-6000?sni=&obfs=salamander&obfs-password=&mport=&mportHopInt=#Имя` |
| SOCKS5 | `socks://user:pass@host:port`, `socks://base64(user:pass)@host:port`, `socks://base64(всё)` |
| HTTP-прокси | `http://user:pass@host:port` (`https://` — с TLS). Без `@` строка считается адресом подписки |
| WireGuard | `wireguard://privateKey@host:port?publickey=&address=&mtu=&reserved=1,2,3&presharedkey=#Имя` |
| AmneziaWG | `amneziawg://` или `awg://<base64url .conf>#Имя` |
| AmneziaVPN | `vpn://…` — ссылка AmneziaVPN и совместимых панелей (3x-ui): AmneziaWG, WireGuard или Xray из контейнера по умолчанию |

**Описание сервера** под именем: `#Имя?serverDescription=<base64>` (для VMess — поле `serverDescription`, для JSON — `meta.serverDescription`).

**Метки сети в имени:** `only Wi-Fi` — сервер виден только на Wi-Fi и Ethernet, `only Mobile` — только в мобильной сети.

**Флаг в начале имени** (`🇩🇪 Германия`) показывается круглым флагом страны слева от имени. Без эмодзи страна угадывается по названию (`Germany`, `Нидерланды`).

WireGuard работает через ядро Xray, поэтому для него действует маршрутизация. AmneziaWG работает на отдельном движке (amneziawg-go) и маршрутизацию не поддерживает: через него идёт весь трафик, кроме исключённых приложений.
