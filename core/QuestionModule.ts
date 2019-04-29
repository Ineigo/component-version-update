import inquirer, { Question, Answers } from 'inquirer';
import chalk from 'chalk';
import { ComponentData } from './types';

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export default class QuestionModule {
    createQuestions(components: ComponentData[]): Question[] {
        const choices = components.map(component => ({
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

    ask(components: ComponentData[]): Promise<Answers> {
        const questions: Question[] = this.createQuestions(components);
        return inquirer.prompt(questions);
    }
}
