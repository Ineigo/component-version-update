# component-version-update

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
