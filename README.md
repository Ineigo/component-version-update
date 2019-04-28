# component-version-update

![build](https://travis-ci.com/Ineigo/component-version-update.svg?branch=master) ![node](https://img.shields.io/node/v/component-version-update.svg) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ineigo/component-version-update.svg) ![GitHub last commit](https://img.shields.io/github/last-commit/ineigo/component-version-update.svg)

## Install

```bash
npm install -g component-version-update
```

## Using

package.json:
```JSON
{
    "cvu": {
        "changelogFileName": "CHANGELOG.md",
        "onlyUnrealised": false,
        "pathsToComponents": [ "./" ],
        "pathToGlobalChangelog": "CHANGELOG.md",
        "globalChangelogFormat": "-   **[%name%:%version%]**: %msg%",
        "commitMessage": "[%name%:%version%]: Publish"
    }
}
```
console:
```bash
cd to/project/dir
cvu -h # Справка
cvu -u # Искать модули с записями в changelog
```

## TODO:

### Этап 2 (v0.1.0)
- [x] Сделать якоря при переходе от глобального changelog в changelog компонета
- [ ] Принимать название пакета из опций `-p --package` (не выводить вопрос с пакетом)
- [ ] Принимать версию пакета из опций `-n --version-number` (не выводить вопрос с пакетом)
- [ ] Пакетное обновление

### Этап 3 (v0.2.0)
- [ ] Обновление зависимостей обновляемого пакета (по ключу `-d --dependency`)
