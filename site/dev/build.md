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

## Этот сайт

Документация лежит в папке `site/` репозитория и собирается [VitePress](https://vitepress.dev). При каждом изменении в `main` GitHub Actions пересобирает сайт и публикует его на GitHub Pages.

```sh
cd site
npm ci
npm run docs:dev     # локально на http://localhost:5173/RVC/
```
