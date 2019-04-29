import QuestionModule from '../core/QuestionModule';
import { PJSON, ComponentData } from '../core/types';
import fs from 'fs';
import Logger from '../core/Logger';

jest.mock('chalk', () => {
    const bold = (v: string) => v;
    bold.grey = bold;
    bold.white = bold;
    return {
        default: { grey: bold, white: bold, bold },
        grey: bold, white: bold, bold,
    };
});

jest.mock('fs', () => new (require('metro-memory-fs'))());

describe('QuestionModule', () => {
    const components: PJSON[] = [
        { name: '@comp/temp1', version: '1.1.1', description: 'sadsadad' },
        { name: '@comp/temp2', version: '2.3.8', description: '00000000' },
    ];
    const componentsData: ComponentData[] = [
        { path: '/folder1/temp1', data: components[0] },
        { path: '/folder1/temp2', data: components[1] }
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
    
    it('Check generate list by render', async () => {
        // Arrange
        const questionModule: QuestionModule = new QuestionModule();
        const questions: any = questionModule.createQuestions(componentsData);
        const expectedComponent: any = [
            {
                name: `${components[0].name}@${components[0].version} - ${components[0].description}`,
                value: componentsData[0],
            },
            {
                name: `${components[1].name}@${components[1].version} - ${components[1].description}`,
                value: componentsData[1],
            },
        ];

        // Act
        const result = await questions[0].source(null, '');
        
        // Assert
        expect(result).toEqual(expectedComponent);
    });

    it('Check filter list by render', async () => {
        // Arrange
        const questionModule: QuestionModule = new QuestionModule();
        const questions: any = questionModule.createQuestions(componentsData);
        const expectedComponent: any = [
            {
                name: `${components[0].name}@${components[0].version} - ${components[0].description}`,
                value: componentsData[0],
            },
        ];

        // Act
        const result = await questions[0].source(null, 'temp1');
        
        // Assert
        expect(result).toEqual(expectedComponent);
    });

    it('Check generate version list by render', () => {
        // Arrange
        const questionModule: QuestionModule = new QuestionModule();
        const questions: any = questionModule.createQuestions(componentsData);
        const expectedVersion: string[] = ['2.3.9', '2.4.0', '3.0.0'];

        // Act
        const result = questions[1].choices({ component: componentsData[1] });

        // Assert
        expect(result).toEqual(expectedVersion);
    });
});
