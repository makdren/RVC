# Сборка и выпуск

Исходники каждой версии приложены к релизу (`RVC-x.y.z-source.zip`).

## Что нужно

- JDK 17+;
- Android SDK (platform 36, build-tools 36) и NDK 27.2.12479018;
- Rust (stable) с целями `aarch64-linux-android`, `armv7-linux-androideabi`, `x86_64-linux-android`, `i686-linux-android` и [`cargo-ndk`](https://github.com/bbqsrc/cargo-ndk);
- Python 3 и GitHub CLI — для выпуска.

## Сборка

```sh
./scripts/fetch-natives.sh   # libv2ray.aar (Xray) и libwg-go.so (AmneziaWG) с проверкой SHA-256, урезанные геобазы
./scripts/build-rust.sh      # librvcnet.so для четырёх ABI
./gradlew :app:testDebugUnitTest :app:assembleRelease -PrvcVersion=1.0.3
```

APK появятся в `app/build/outputs/apk/release/`: по одному на ABI и `universal`.

## Подпись

`keystore.properties` в корне проекта (`storeFile`, `storePassword`, `keyAlias`, `keyPassword`) или переменные окружения `RVC_KEYSTORE`, `RVC_KEYSTORE_PASSWORD`, `RVC_KEY_ALIAS`, `RVC_KEY_PASSWORD`.

::: danger Один ключ на все версии
Обновление из приложения сверяет сертификат подписи с установленным. APK, подписанный другим ключом, не установится поверх.
:::

## Выпуск версии

```sh
# APK переименовываются в RVC-<версия>-<abi>.apk и кладутся в dist/
python scripts/make-update-json.py 1.0.3 dist makdren/RVC notes.txt   # update.json
sha256sum dist/RVC-1.0.3-*.apk > dist/SHA256SUMS
gh release create v1.0.3 -R makdren/RVC dist/RVC-1.0.3-*.apk dist/update.json dist/SHA256SUMS
```

В `notes.txt` строки, начинающиеся с `- `, попадают в окно обновления (первые три — в баннер на главном экране). На Windows запускайте скрипт с `PYTHONIOENCODING=utf-8`.

`versionCode` = `MAJOR × 10000 + MINOR × 100 + PATCH`.

## Формат update.json

RVC раз в сутки читает `https://github.com/makdren/RVC/releases/latest/download/update.json`:

```json
{
  "versionCode": 10003,
  "versionName": "1.0.3",
  "notes": ["Что изменилось"],
  "assets": {
    "arm64-v8a": {"url": "https://github.com/makdren/RVC/releases/download/v1.0.3/RVC-1.0.3-arm64-v8a.apk", "sha256": "…", "size": 17187568},
    "universal": {"url": "…", "sha256": "…", "size": 64036138}
  }
}
```

## Windows {#windows}

Нужны JDK 21, Go 1.27 и Rust с целью `x86_64-pc-windows-gnu` (MinGW-w64). Модуль `desktop/` — Compose Multiplatform поверх общего модуля `shared`.

```sh
desktop/scripts/build-natives.sh    # rvc-core.exe (Go + Xray-core), rvcnet.dll, wintun.dll и геобазы → desktop/resources/windows
./gradlew :desktop:test :desktop:createReleaseDistributable -PrvcDesktopVersion=1.1.0
powershell -File desktop/installer/build-cds.ps1 -AppDir desktop/build/compose/binaries/main-release/app/RVC
powershell -File desktop/installer/build-portable.ps1 -Version 1.1.0 -OutDir dist
```

`build-cds.ps1` добавляет архив классов (быстрее запуск), `build-portable.ps1` кладёт `portable.txt` и упаковывает папку в `dist/RVC-windows-<версия>-portable.zip`. Скрипт проверяет, что `RVC.cfg` записан без BOM: с ним лаунчер падает с «Failed to launch JVM».

Выпуск — отдельным релизом `windows-vX.Y.Z`, **не** «последним», чтобы `releases/latest` по-прежнему вёл к Android и его `update.json`:

```sh
python scripts/make-windows-update.py 1.1.0 dist makdren/RVC notes-windows.txt   # update-windows.json
gh release create windows-v1.1.0 -R makdren/RVC --latest=false dist/RVC-windows-1.1.0-portable.zip dist/RVC-windows-1.1.0-source.zip dist/update-windows.json
```

RVC для Windows находит самый свежий релиз `windows-v…` через GitHub API и читает из него `update-windows.json`:

```json
{
  "version": "1.1.0",
  "notes": ["Что изменилось"],
  "portable": {"url": "https://github.com/makdren/RVC/releases/download/windows-v1.1.0/RVC-windows-1.1.0-portable.zip", "sha256": "…", "size": 87469407}
}
```

Архив принимается только с `github.com/makdren/RVC/releases/download/windows-v…` и только при совпадении размера и SHA-256. RVC распаковывает его, заменяет файлы в своей папке (кроме `data` и `portable.txt`) и перезапускается; номер версии должен расти.

## Этот сайт

Документация лежит в папке `site/` репозитория и собирается [VitePress](https://vitepress.dev). При каждом изменении в `main` GitHub Actions пересобирает сайт и публикует его на GitHub Pages.

```sh
cd site
npm ci
npm run docs:dev     # локально на http://localhost:5173/RVC/
```
