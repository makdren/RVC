---
aside: false
description: Настройте карточку провайдера RVC и подготовьте заголовки подписки для Remnawave.
---

<script setup>
import ProviderConfigurator from '../.vitepress/theme/ProviderConfigurator.vue'
</script>

# Конфигуратор подписки

Настройте название, объявление и адреса подписки. Скопируйте заголовки в **Subscription → Settings → Response headers** в Remnawave. Конфигуратор работает в браузере.

<ProviderConfigurator />

Настройки подписки в RVC описаны в [справочнике заголовков](/provider/headers). Для выдачи полных конфигураций Xray настройте [Response Rules](/provider/#response-rules).
