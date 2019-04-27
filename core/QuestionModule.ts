import fs from 'fs';
import path from 'path';
import inquirer, { Question, Answers } from 'inquirer';
import chalk from 'chalk';
import { ComponentData, PJSON } from './types';
import Logger from './Logger';

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export default class QuestionModule {
    components: ComponentData[];
    constructor(paths: string[], logger: Logger) {
        this.components = paths.reduce((components: ComponentData[], componentPath: string) => {
            const folders: string[] = fs.readdirSync(componentPath);

            const componentsInFolder: ComponentData[] = folders
                .filter(folder =>
                    fs.existsSync((componentPath === '/' ? '/' : componentPath + '/') + folder + '/package.json')
                )
                .map(folder => {
                    const location = (componentPath === '/' ? '/' : componentPath + '/') + folder;
                    const data: PJSON = JSON.parse(fs.readFileSync(location + '/package.json', 'utf8'));
                    return {
                        path: location,
                        data,
                    };
                });

            if (!componentsInFolder.length) {
                logger.warn(`Not found components in ${path.resolve(componentPath)}`);
                return components;
            }
            logger.info(
                `Found ` +
                    chalk.bold(`${componentsInFolder.length} `) +
                    chalk.bold(`(${componentPath})`) +
                    ` components in`,
                path.resolve(componentPath)
            );
            return components.concat(componentsInFolder);
        }, []);
        logger.info('Total: ' + chalk.bold.white(`${this.components.length}`) + ' found components');
    }

    createQuestions(): Question[] {
        const choices = this.components.map(component => ({
            name: `${component.data.name}@${component.data.version} - ${chalk.bold.grey(component.data.description)}`,
            value: component,
        }));

        return [
            {
                name: 'component',
                type: 'autocomplete',
                message: 'Название компонента?',
                source: (answer: Answers, input: string) => {
                    return Promise.resolve(input ? choices.filter(c => c.name.includes(input)) : choices);
                },
            },
            {
                name: 'version',
                type: 'list',
                message: 'Новая версия?',
                choices: (answer: Answers) => {
                    const version = answer.component.data.version.split('.');
                    return version
                        .map((n: string, i: number) => {
                            const newVer = Array.from(version);
                            newVer.splice(i, 3 - i, ...[+n + 1, 0, 0].splice(0, 3 - i));
                            return newVer.join('.');
                        })
                        .sort();
                },
            },
        ];
    }

    ask(): Promise<Answers> {
        const questions: Question[] = this.createQuestions();
        return inquirer.prompt(questions);
    }
}
