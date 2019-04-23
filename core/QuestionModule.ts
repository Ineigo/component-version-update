import fs from 'fs';
import inquirer, { Question, Answers } from 'inquirer';
import chalk from 'chalk';
import { ComponentData, PJSON } from './types';

export default class QuestionModule {
    components: ComponentData[];
    constructor(paths: string[]) {
        this.components = paths.reduce((comps: ComponentData[], path: string) => {
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
    }

    ask(): Promise<Answers> {
        const questions: Question[] = [
            {
                name: 'component',
                type: 'list',
                message: 'Название компонента?',
                choices: this.components.map(c => ({
                    name: `${c.data.name}@${c.data.version} - ${chalk.bold.grey(c.data.description)}`,
                    value: c,
                })),
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
                            newVer.splice(i, 1, +n + 1);
                            return newVer.join('.');
                        })
                        .sort();
                },
            },
        ];

        return inquirer.prompt(questions);
    }
}