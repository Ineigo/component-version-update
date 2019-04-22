#!/usr/bin/env node

import chalk from 'chalk';
import * as figlet from 'figlet';
import program from 'commander';
import * as pj from './package.json';
import fs from 'fs';

import inquirer, { Question } from 'inquirer';

const version: string = (<any>pj).version;
const description: string = (<any>pj).description;

interface PJSON {
    version: string;
    description: string;
    name: string;
}

interface ComponentData {
    path: string;
    data: PJSON;
}

program
    .version(version)
    .usage('[options] <componentName>')
    .description(description)
    .action(file => {
        init();
        const paths: string[] = ['./temp']; // Как-то получать пути до компонентов
        const components: ComponentData[] = paths.reduce((comps: ComponentData[], path: string) => {
            const folders: string[] = fs.readdirSync(path);

            const arr: ComponentData[] = folders
                .filter(folder => fs.existsSync(path + '/' + folder + '/package.json'))
                .map(folder => {
                    const location = path + '/' + folder;
                    const data: PJSON = JSON.parse(fs.readFileSync(location + '/package.json', 'utf8'));
                    return {
                        path: location,
                        data,
                    };
                });

            if (!arr.length) {
                return comps;
            }
            return comps.concat(arr);
        }, []);

        const questions: Question[] = [
            {
                name: 'component',
                type: 'list',
                message: 'Название компонента?',
                choices: components.map(c => ({
                    name: `${c.data.name}@${c.data.version} - ${chalk.bold.grey(c.data.description)}`,
                    value: c,
                })),
            },
            {
                name: 'version',
                type: 'list',
                message: 'Новая версия?',
                choices: (answer: inquirer.Answers) => {
                    const version = answer.component.data.version.split('.');
                    return version
                        .map((n: string, i: number) => {
                            const newVer = Array.from(version);
                            newVer.splice(i, 1, +n + 1);
                            return newVer.join('.');
                        })
                        .sort();
                },
            },
        ];

        inquirer.prompt(questions).then(res => {
            console.log(res.component.data.name, res.version);
        });
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
