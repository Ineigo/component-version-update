#!/usr/bin/env node

import chalk from 'chalk';
import path from 'path';
import * as figlet from 'figlet';
import program from 'commander';
import * as pj from './package.json';
import fs from 'fs';

import QuestionModule from './core/QuestionModule.js';
import { Settings } from './core/types.js';
import { Answers } from 'inquirer';
import shelljs from 'shelljs';
import ChangelogModule from './core/ChangelogModule.js';
import Logger from './core/Logger.js';
import ComponentsModule from './core/ComponentsModule.js';
import SettingsModule from './core/SettingsModule.js';

const version: string = (<any>pj).version;
const description: string = (<any>pj).description;
const logger: Logger = new Logger();

program
    .version(version)
    .usage('[options] <componentName>')
    .option('-u, --onlyUnreleased', 'Брать компонеты только при наличии в unreleased из changelog записей', false)
    .option('-s, --settings [path]', 'Путь до настроек package.json', './package.json')
    .option('-p, --package [package]', 'Название пакета для обновления')
    .option('--verbose', 'Вывод подробной информации', false)
    .description(description)
    .action(async () => {
        logger.verbose = program.verbose || false;
        init();

        // Получение конфигурации
        let settingsModule: SettingsModule;
        try {
            logger.info(`Path to settings: ${program.settings}`);
            settingsModule = new SettingsModule(program.settings || './package.json', logger);
        } catch (e) {
            return 1;
        }

        const settings: Settings = settingsModule.settings;
        const changelogFileName: string = settings.changelogFileName;

        // Создание вопросника
        const componentsModule: ComponentsModule = new ComponentsModule(settings.pathsToComponents, logger);
        const questionModule: QuestionModule = new QuestionModule();
        const changelogModule: ChangelogModule = new ChangelogModule(
            {
                changelogFileName,
                pathToGlobalChangelog: settings.pathToGlobalChangelog,
                globalChangelogFormat: settings.globalChangelogFormat,
            },
            logger
        );

        for (const component of componentsModule.components) {
            if (changelogModule.isset(component.path)) {
                changelogModule.read(component.path);
            } else {
                logger.warn(
                    `Not found ${path.resolve(component.path + '/' + changelogFileName)} by ${component.data.name}`
                );
            }
        }
        let components = componentsModule.components;
        if (settings.onlyUnreleased) {
            components = componentsModule.components.filter(component => changelogModule.isUnreleased(component.path));
        }

        if (!components.length) {
            return logger.error('No components by publish');
        }

        const selected = components.find(item => item.data.name === settings.packageName);
        if (!selected && settings.packageName) {
            return logger.error('Not found component', settings.packageName);
        }

        if (selected) {
            logger.message('Выбран компонет:', selected.data.name + '\n\n');
        }

        // Опрос пользователя
        const answer: Answers = await questionModule.ask(components, selected);
        const pickedComponent = answer.component || selected;
        const pathComponent: string = pickedComponent.path;
        if (!changelogModule.isUnreleased(pathComponent)) {
            return logger.error(`Nothing unreleased changes in ${pathComponent}/${changelogModule.changelogFileName}`);
        }

        // Обновление версии в package.json
        shelljs.exec(`npm version ${answer.version} --prefix ${pathComponent} --no-git-tag-version`);
        // Обновление версии в component/Changelog.md
        if (changelogModule.upVersion(pathComponent, answer.version)) {
            pickedComponent.data.version = answer.version;
            
            // Обновление Общего changelog.md
            changelogModule.writeGlobalChangelog(pathComponent, pickedComponent);
            if (settings.commitMessage) {
                const message: string = settings.commitMessage
                    .replace(/%name%/g, pickedComponent.data.name)
                    .replace(/%version%/g, pickedComponent.data.version);
                shelljs.exec(
                    `git add ${pathComponent} ${settings.pathToGlobalChangelog} && git commit -m "${message}"`
                );
                logger.info(`Commited "${message}"`);
            }
        }

        logger.message('\n\nСписок изменений для версии', answer.version);
        logger.log(changelogModule.get(pathComponent).unreleased.join('\n'));
    })
    .parse(process.argv);

function init(): void {
    console.log(chalk.bold.blue('component-version-update', '- v' + version));
    console.log(
        chalk.cyan(
            figlet.textSync('CVUpdater', {
                font: 'Stop',
                horizontalLayout: 'fitted',
                verticalLayout: 'default',
            })
        )
    );
    console.log();
}
