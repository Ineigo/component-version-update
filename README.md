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
        "pathsToComponents": [ "./" ]
    }
}
```
console:
```bash
cd to/project/dir
cvu
```

## TODO:

### Этап 1

- [-] Получать настройки из package.json текущей дирректории
    - [ ] commintMessage (string) default null
    - [x] pathsToComponents (array) default empty array
    - [ ] pathToGlobalChangelog (string) default null
- [-] Обновлять версию в файлах
    - [x] component/package.json
    - [x] component/CHANGELOG.md
    - [ ] ${pathToGlobalChangelog}
