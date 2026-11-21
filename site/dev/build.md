# Сборка и выпуск

Скачайте исходники нужной версии со страницы [релиза GitHub](https://github.com/makdren/RVC/releases). Для Android архив называется `RVC-x.y.z-source.zip`, для Windows — `RVC-windows-x.y.z-source.zip`. Требования и команды относятся к исходникам из выбранного архива.

## Что нужно

- JDK 21 для сборки. Для исходников с Gradle 8.14.3 подойдёт и JDK 17.
- Для Android 1.2.2 нужны Android SDK Platform 37.2, Build Tools 37.0.0, NDK 27.2.12479018 и Go 1.27.
- Rust (stable) с целями `aarch64-linux-android`, `armv7-linux-androideabi`, `x86_64-linux-android`, `i686-linux-android` и [`cargo-ndk`](https://github.com/bbqsrc/cargo-ndk);
- Python 3.11 или новее, GitHub CLI, `unzip` и `sha256sum` для подготовки нативных компонентов.

## Сборка

```sh
./scripts/fetch-natives.sh   # собирает Xray и AmneziaWG из зафиксированных исходников, проверяет и урезает геобазы
./scripts/build-rust.sh      # librvcnet.so для четырёх ABI
./gradlew :app:testDebugUnitTest :app:assembleRelease -PrvcVersion=1.2.2
```

APK появятся в `app/build/outputs/apk/release/`. Будут отдельные файлы для каждой архитектуры и универсальный APK. В Windows вместо `./gradlew` можно вызвать `.\gradlew.bat`. В PowerShell берите целиком в кавычки аргументы с версией, например `"-PrvcVersion=1.2.2"`.

## Подпись

`keystore.properties` в корне проекта (`storeFile`, `storePassword`, `keyAlias`, `keyPassword`) или переменные окружения `RVC_KEYSTORE`, `RVC_KEYSTORE_PASSWORD`, `RVC_KEY_ALIAS`, `RVC_KEY_PASSWORD`.

::: danger Один ключ на все версии
Обновление из приложения сверяет сертификат подписи с установленным. APK, подписанный другим ключом, не установится поверх.
:::

## Выпуск версии

В примере использован номер 1.2.1. При подготовке нового выпуска подставьте его номер во все команды.

```sh
# APK переименовываются в RVC-<версия>-<abi>.apk и кладутся в dist/
python scripts/make-update-json.py 1.2.1 dist makdren/RVC notes.txt   # update.json
sha256sum dist/RVC-1.2.1-*.apk > dist/SHA256SUMS
gh release create v1.2.1 -R makdren/RVC dist/RVC-1.2.1-*.apk dist/RVC-1.2.1-source.zip dist/update.json dist/SHA256SUMS
```

В `notes.txt` строки, начинающиеся с `- `, попадают в окно подробностей обновления. На Windows запускайте скрипт с `PYTHONIOENCODING=utf-8`.

`versionCode` = `MAJOR × 10000 + MINOR × 100 + PATCH`.

## Формат update.json

RVC читает `update.json` из последнего Android-релиза при открытии приложения и при ручной проверке. Фоновая задача дополнительно проверяет обновление примерно раз в сутки. Если GitHub недоступен, клиент пробует копию манифеста из ветки `updates` через jsDelivr.

```json
{
  "versionCode": 10201,
  "versionName": "1.2.1",
  "notes": ["Что изменилось"],
  "assets": {
    "arm64-v8a": {"url": "https://github.com/makdren/RVC/releases/download/v1.2.1/RVC-1.2.1-arm64-v8a.apk", "sha256": "…", "size": 17535484},
    "universal": {"url": "https://github.com/makdren/RVC/releases/download/v1.2.1/RVC-1.2.1-universal.apk", "sha256": "…", "size": 64374274}
  }
}
```

## Windows {#windows}

В Git Bash нужны JDK 21, Go 1.27 и Rust с целью `x86_64-pc-windows-gnu` (MinGW-w64). Модуль `desktop/` — Compose Multiplatform поверх общего модуля `shared`.

```sh
desktop/scripts/build-natives.sh    # rvc-core.exe (Go + Xray-core), rvcnet.dll, wintun.dll и геобазы → desktop/resources/windows
./gradlew :desktop:test :desktop:createReleaseDistributable -PrvcDesktopVersion=1.1.4
powershell -File desktop/installer/build-cds.ps1 -AppDir desktop/build/compose/binaries/main-release/app/RVC
powershell -File desktop/installer/build-portable.ps1 -Version 1.1.4 -OutDir dist
```

`build-cds.ps1` добавляет архив классов (быстрее запуск), `build-portable.ps1` кладёт `portable.txt` и упаковывает папку в `dist/RVC-windows-<версия>-portable.zip`. Скрипт проверяет, что `RVC.cfg` записан без BOM: с ним лаунчер падает с «Failed to launch JVM».

Выпуск — отдельным релизом `windows-vX.Y.Z`, **не** «последним», чтобы `releases/latest` по-прежнему вёл к Android и его `update.json`:

```sh
python scripts/make-windows-update.py 1.1.4 dist makdren/RVC notes-windows.txt   # update-windows.json
gh release create windows-v1.1.4 -R makdren/RVC --latest=false dist/RVC-windows-1.1.4-portable.zip dist/RVC-windows-1.1.4-source.zip dist/update-windows.json
```

RVC для Windows находит самый свежий релиз `windows-v…` через GitHub API и читает из него `update-windows.json`:

```json
{
  "version": "1.1.4",
  "notes": ["Что изменилось"],
  "portable": {"url": "https://github.com/makdren/RVC/releases/download/windows-v1.1.4/RVC-windows-1.1.4-portable.zip", "sha256": "…", "size": 76782151}
}
```

Архив принимается только с `github.com/makdren/RVC/releases/download/windows-v…` и только при совпадении размера и SHA-256. RVC распаковывает его, заменяет файлы в своей папке (кроме `data` и `portable.txt`) и перезапускается; номер версии должен расти.

## Этот сайт

Документация лежит в папке `site/` репозитория и собирается [VitePress](https://vitepress.dev). GitHub Actions публикует сайт на GitHub Pages при изменениях в `site/` или в `.github/workflows/docs.yml` ветки `main`, а также после публикации релиза.

```sh
cd site
npm ci
npm run docs:dev     # адрес появится в терминале, обычно http://localhost:5173/
```
