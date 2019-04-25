import { Question } from 'inquirer';
import QuestionModule from '../core/QuestionModule';
import { PJSON, ComponentData } from '../core/types';
import fs from 'fs';
import Logger from '../core/Logger';

jest.mock('inquirer');
jest.mock('fs', () => new (require('metro-memory-fs'))());
// const inquirer = require('inquirer');

describe('QuestionModule', () => {
    const components: PJSON[] = [
        { name: '@comp/temp1', version: '1.1.1', description: 'sadsadad' },
        { name: '@comp/temp2', version: '2.3.8', description: '00000000' },
    ];

    beforeEach(() => {
        require('fs').reset();
        fs.mkdirSync('/folder1');
        fs.mkdirSync('/folder1/temp1');
        fs.writeFileSync('/folder1/temp1/package.json', JSON.stringify(components[0]));
        fs.mkdirSync('/folder2');
        fs.mkdirSync('/folder2/temp2');
        fs.writeFileSync('/folder2/temp2/package.json', JSON.stringify(components[1]));
    });

    it('Check grabbing components', async () => {
        const paths: string[] = ['/folder1', '/folder2'];
        const questionModule: QuestionModule = new QuestionModule(paths, new Logger());
        // inquirer.prompt = jest.fn().mockResolvedValue({ component: 'some@example.com' });
        const expectedComponent: ComponentData[] = [
            { path: '/folder1/temp1', data: components[0] },
            { path: '/folder2/temp2', data: components[1] },
        ];
        expect(questionModule.components).toEqual(expectedComponent);
    });

    it('Check generate list by render', async () => {
        const paths: string[] = ['/folder1', '/folder2'];
        const questionModule: QuestionModule = new QuestionModule(paths, new Logger());
        // inquirer.prompt = jest.fn().mockResolvedValue({ component: 'some@example.com' });
        const questions: any = questionModule.createQuestions();
        const expectedComponent: Object[] = [
            {
                name: `${components[0].name}@${components[0].version} - ${components[0].description}`,
                value: questionModule.components[0],
            },
            {
                name: `${components[1].name}@${components[1].version} - ${components[1].description}`,
                value: questionModule.components[1],
            },
        ];
        expect(questions[0].source(null, '')).resolves.toEqual(expectedComponent);
    });
});
