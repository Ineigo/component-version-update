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
        "pathsToComponents": [ "./" ]
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

### Этап 1 (v0.0.1)

- [-] Получать настройки из package.json текущей дирректории
    - [x] changelogFileName (string) default CHANGELOG.md
    - [x] onlyUnrealised (Boolean) default false
    - [ ] commitMessage (string) default null
    - [x] pathsToComponents (array) default empty array
    - [ ] pathToGlobalChangelog (string) default null
- [-] Обновлять версию в файлах
    - [x] component/package.json
    - [x] component/CHANGELOG.md
    - [ ] ${pathToGlobalChangelog}
- [x] Стандартизировать формат вывода логов
- [x] Добивить режим отладки `--verbose`
- [ ] Делать commit с изменениями с ${commitMessage} (если указан commitMessage)
- [ ] Принимать название пакета из опций `-p --package` (не выводить вопрос с пакетом)
- [ ] Принимать версию пакета из опций `-n --version-number` (не выводить вопрос с пакетом)

### Этап 2 (v0.1.0)
- [ ] Пакетное обновление

### Этап 3 (v0.2.0)
- [ ] Обновление зависимостей обновляемого пакета (по ключу `-d --dependency`)
