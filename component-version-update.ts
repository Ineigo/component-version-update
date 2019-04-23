#!/usr/bin/env node

import chalk from 'chalk';
import path from 'path';
import * as figlet from 'figlet';
import program from 'commander';
import * as pj from './package.json';
import fs from 'fs';

import QuestionModule from './core/QuestionModule.js';
import { ComponentData, PJSON, Settings } from './core/types.js';
import { Answers } from 'inquirer';

const version: string = (<any>pj).version;
const description: string = (<any>pj).description;

program
    .version(version)
    .usage('[options] <componentName>')
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
        
        if (!settings.pathsToComponents || !settings.pathsToComponents.length) {
            return console.log(chalk.grey('pathsToComponents c\'not empty'));
        }

        const paths: string[] = settings.pathsToComponents;

        // Создание вопросника
        const questionModule: QuestionModule = new QuestionModule(paths);

        // Опрос пользователя
        const answer: Answers = await questionModule.ask();
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
