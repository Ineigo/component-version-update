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

const version: string = (<any>pj).version;
const description: string = (<any>pj).description;
const logger: Logger = new Logger();

program
    .version(version)
    .usage('[options] <componentName>')
    .option('-u, --onlyUnrealised', 'Брать компонеты только при наличии в unrealised из changelog записей', false)
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
        settings.onlyUnrealised = program.onlyUnrealised || settings.onlyUnrealised || false;
        logger.verbose = settings.verbose || false;

        const changelogFileName: string = settings.changelogFileName || 'CHANGELOG.md';

        if (!settings.pathsToComponents || !settings.pathsToComponents.length) {
            return logger.error("pathsToComponents c'not empty");
        }

        logMods(settings, logger);

        const paths: string[] = settings.pathsToComponents;

        // Создание вопросника
        const questionModule: QuestionModule = new QuestionModule(paths, logger);
        const changelogModule: ChangelogModule = new ChangelogModule(changelogFileName);

        for (const component of questionModule.components) {
            if (changelogModule.isset(component.path)) {
                changelogModule.read(component.path);
            } else {
                logger.warn(
                    `Not found ${path.resolve(component.path + '/' + changelogFileName)} by ${component.data.name}`
                );
            }
        }

        if (settings.onlyUnrealised) {
            questionModule.components = questionModule.components.filter(component =>
                changelogModule.isUnrealized(component.path)
            );
        }

        if (!questionModule.components.length) {
            return logger.error('No components by publish');
        }

        // Опрос пользователя
        const answer: Answers = await questionModule.ask();
        const pathComponent: string = answer.component.path;
        if (!changelogModule.isUnrealized(pathComponent)) {
            return logger.error(`Nothing unrealized changes in ${pathComponent}/${changelogModule.changelogFileName}`);
        }

        // Обновление версии в package.json
        shelljs.exec(`npm version ${answer.version} --prefix ${pathComponent}`);

        // Обновление версии в component/Changelog.md
        changelogModule.upVersion(pathComponent, answer.version);

        // Обновление Общего changelog.md
        logger.log(changelogModule.get(pathComponent).unrealised.join(', '));
    })
    .parse(process.argv);

function logMods(settings: Settings, logger: Logger): void {
    logger.info('Run mode verbose');

    if (settings.onlyUnrealised) {
        logger.info(chalk.bold.yellow('Run mode onlyUnrealised'));
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
