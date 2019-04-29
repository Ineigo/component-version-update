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

const version: string = (<any>pj).version;
const description: string = (<any>pj).description;
const logger: Logger = new Logger();

program
    .version(version)
    .usage('[options] <componentName>')
    .option('-u, --onlyUnreleased', 'Брать компонеты только при наличии в unreleased из changelog записей', false)
    .option('--verbose', 'Вывод подробной информации', false)
    .description(description)
    .action(async () => {
        if (!fs.existsSync('./package.json')) {
            return logger.error('Missing package.json');
        }

        init();

        // Получение конфигурации
        const userPackageJson = require(path.resolve('./package.json'));
        if (!userPackageJson.cvu) {
            return logger.error('Missing cvu key in package.json');
        }
        const settings: Settings = userPackageJson.cvu;
        settings.verbose = program.verbose || settings.verbose || false;
        settings.onlyUnreleased = program.onlyUnreleased || settings.onlyUnreleased || false;
        logger.verbose = settings.verbose || false;

        const changelogFileName: string = settings.changelogFileName || 'CHANGELOG.md';

        if (!settings.pathsToComponents || !settings.pathsToComponents.length) {
            return logger.error("pathsToComponents c'not empty");
        }

        logMods(settings, logger);

        const paths: string[] = settings.pathsToComponents;

        // Создание вопросника
        const componentsModule: ComponentsModule = new ComponentsModule(paths, logger);
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
            components = componentsModule.components.filter(component =>
                changelogModule.isUnreleased(component.path)
            );
        }

        if (!components.length) {
            return logger.error('No components by publish');
        }

        // Опрос пользователя
        const answer: Answers = await questionModule.ask(components);
        const pathComponent: string = answer.component.path;
        if (!changelogModule.isUnreleased(pathComponent)) {
            return logger.error(`Nothing unreleased changes in ${pathComponent}/${changelogModule.changelogFileName}`);
        }

        // Обновление версии в package.json
        shelljs.exec(`npm version ${answer.version} --prefix ${pathComponent}`);

        // Обновление версии в component/Changelog.md
        if (changelogModule.upVersion(pathComponent, answer.version)) {
            answer.component.data.version = answer.version;
            changelogModule.writeGlobalChangelog(pathComponent, answer.component);
            if (settings.commitMessage) {
                const message: string = settings.commitMessage
                    .replace(/%name%/g, answer.component.data.name)
                    .replace(/%version%/g, answer.component.data.version);
                shelljs.exec(
                    `git add ${pathComponent} ${settings.pathToGlobalChangelog} && git commit -m "${message}"`
                );
                logger.info(`Commited "${message}"`);
            }
        }

        // Обновление Общего changelog.md
        logger.log(changelogModule.get(pathComponent).unreleased.join(', '));
    })
    .parse(process.argv);

function logMods(settings: Settings, logger: Logger): void {
    logger.info(chalk.bold.yellow('Run with mode verbose'));

    if (settings.onlyUnreleased) {
        logger.info(chalk.bold.yellow('Run with mode onlyUnreleased'));
    }

    console.log();
}

function init(): void {
    console.log(chalk.bold.blue('component-version-updater', '- v' + version));
    console.log(
        chalk.cyan(
            figlet.textSync('Updater', {
                font: 'Stop',
                horizontalLayout: 'fitted',
                verticalLayout: 'default',
            })
        )
    );
    console.log();
}
