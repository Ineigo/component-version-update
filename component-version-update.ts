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
import shelljs from 'shelljs';

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

        if (program.onlyUnrealised || settings.onlyUnrealised) {
            console.log(chalk.yellow('Run mode onlyUnrealised'));
            questionModule.components = questionModule.components.filter(component => {
                const changelogPath: string = `${component.path}/${changelogFileName}`;
                if (fs.existsSync(changelogPath)) {
                    const md: string = fs.readFileSync(changelogPath, 'utf8');
                    const rows: string[] = md.split(/\r?\n/g);
                    let isUnrelised = false;
                    const result: string[] = rows.reduce((unrealized: string[], line: string, i: number) => {
                        if (isUnrelised) {
                            const matches = line.match(/^### ([a-z]*)/i);
                            if (line.match(/^## (.*)/i)) {
                                isUnrelised = false;
                            } else if (!matches && line.length) {
                                const desc = line.replace(/^([^a-zа-яё])*/i, '');
                                if (desc.length) {
                                    unrealized.push(desc);
                                }
                            }
                        }
                        return unrealized;
                    }, []);
                    return result.length;
                }
                return false;
            });
        }

        if (!questionModule.components.length) {
            return console.log(chalk.grey('No components by publish'));
        }

        // Опрос пользователя
        const answer: Answers = await questionModule.ask();

        // Обновление версии в package.json
        // shelljs.exec(`npm version ${answer.version} --prefix ${answer.component.path}`);

        // Обновление версии в component/Changelog.md
        const changelogPath: string = `${answer.component.path}/${changelogFileName}`;
        if (fs.existsSync(changelogPath)) {
            const md: string = fs.readFileSync(changelogPath, 'utf8');
            const rows: string[] = md.split(/\r?\n/g);
            const unrelised: string[] = [];
            let isUnrelised = false;
            const result: string[] = rows.reduce((p: string[], line: string, i: number) => {
                if (isUnrelised) {
                    const matches = line.match(/^### ([a-z]*)/i);
                    if (line.match(/^## (.*)/i)) {
                        isUnrelised = false;
                    } else if (!matches && line.length) {
                        const desc = line.replace(/^([^a-zа-яё])*/i, '');
                        if (desc.length) {
                            unrelised.push(desc);
                        }
                    }
                }
                p.push(line);
                if (line.toLowerCase().includes('unreleased')) {
                    isUnrelised = true;
                    p.push('');
                    p.push('---');
                    const date: Date = new Date();
                    p.push(
                        `## [${answer.version}] - ${('0' + date.getDate()).slice(-2)}.${(
                            '0' +
                            (date.getMonth() + 1)
                        ).slice(-2)}.${date.getFullYear()}`
                    );
                }
                return p;
            }, []);

            // fs.writeFileSync(chlogPath, result.join('\r\n'));

            // Обновление Общего changelog.md
            console.log(unrelised.join(', '));
        }
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
