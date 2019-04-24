import fs from 'fs';
import inquirer, { Question, Answers, PromptModule } from 'inquirer';
import chalk from 'chalk';
import { ComponentData, PJSON } from './types';

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export default class QuestionModule {
    components: ComponentData[];
    constructor(paths: string[]) {
        this.components = paths.reduce((components: ComponentData[], path: string) => {
            const folders: string[] = fs.readdirSync(path);

            const componentsInFolder: ComponentData[] = folders
                .filter(folder => fs.existsSync((path === '/' ? '/' : path + '/') + folder + '/package.json'))
                .map(folder => {
                    const location = (path === '/' ? '/' : path + '/') + folder;
                    const data: PJSON = JSON.parse(fs.readFileSync(location + '/package.json', 'utf8'));
                    return {
                        path: location,
                        data,
                    };
                });

            if (!componentsInFolder.length) {
                return components;
            }
            return components.concat(componentsInFolder);
        }, []);
    }

    createQuestions(): Question[] {
        const choices = this.components.map(c => ({
            name: `${c.data.name}@${c.data.version} - ${chalk.bold.grey(c.data.description)}`,
            value: c,
        }));

        return [
            {
                name: 'component',
                type: 'autocomplete',
                message: 'Название компонента?',
                source: (answersSoFar: any, input: string) => {
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
        ]
    }

    ask(): Promise<Answers> {
        const questions: Question[] = this.createQuestions();
        return inquirer.prompt(questions);
    }
}
