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

const version: string = (<any>pj).version;
const description: string = (<any>pj).description;

program
    .version(version)
    .usage('[options] <componentName>')
    .option('-u, --onlyUnrealised', 'Брать компонеты только при наличии в unrealised из changelog записей', false)
    .description(description)
    .action(async () => {
        if (!fs.existsSync('./package.json')) {
            return console.log(chalk.gray('Missing package.json'));
        }
        init();

        // Получение конфигурации
        const userPackageJson = require(path.resolve('./package.json'));
        if (!userPackageJson.cvu) {
            return console.log(chalk.grey('Missing cvu key in package.json'));
        }
        const settings: Settings = userPackageJson.cvu;

        const changelogFileName: string = settings.changelogFileName || 'CHANGELOG.md';

        if (!settings.pathsToComponents || !settings.pathsToComponents.length) {
            return console.log(chalk.grey("pathsToComponents c'not empty"));
        }

        const paths: string[] = settings.pathsToComponents;

        // Создание вопросника
        const questionModule: QuestionModule = new QuestionModule(paths);
        const changelogModule: ChangelogModule = new ChangelogModule(changelogFileName);

        for (const component of questionModule.components) {
            if (changelogModule.isset(component.path)) {
                changelogModule.read(component.path);
            }
        }

        if (program.onlyUnrealised || settings.onlyUnrealised) {
            console.log(chalk.yellow('Run mode onlyUnrealised'));
            questionModule.components = questionModule.components.filter(component =>
                changelogModule.isUnrealized(component.path)
            );
        }

        if (!questionModule.components.length) {
            return console.log(chalk.grey('No components by publish'));
        }

        // Опрос пользователя
        const answer: Answers = await questionModule.ask();
        const pathComponent: string = answer.component.path;
        if (!changelogModule.isUnrealized(pathComponent)) {
            return console.log(
                chalk.red(`Nothing unrealized changes in ${pathComponent}/${changelogModule.changelogFileName}`)
            );
        }

        // Обновление версии в package.json
        shelljs.exec(`npm version ${answer.version} --prefix ${pathComponent}`);

        // Обновление версии в component/Changelog.md
        changelogModule.upVersion(pathComponent, answer.version);

        // Обновление Общего changelog.md
        // console.log(changelogModule.join(', '));
    })
    .parse(process.argv);

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
