# component-version-update

## TODO:

### Этап 1

- [-] Получать настройки из package.json текущей дирректории
    - [ ] commintMessage (string) default null
    - [x] pathsToComponents (array) default empty array
    - [ ] pathToGlobalChangelog (string) default null
- [-] Обновлять версию в файлах
    - [x] component/package.json
    - [ ] component/CHANGELOG.md
    - [ ] ${pathToGlobalChangelog}