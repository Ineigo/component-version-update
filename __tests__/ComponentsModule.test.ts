import ComponentsModule from '../core/ComponentsModule';
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

describe('ComponentsModule', () => {
    const paths: string[] = ['/folder1', '/folder2', '/folder3'];
    const components: PJSON[] = [
        { name: '@comp/temp1', version: '1.1.1', description: 'sadsadad' },
        { name: '@comp/temp2', version: '2.3.8', description: '00000000' },
    ];
    

    beforeEach(() => {
        require('fs').reset();
        fs.mkdirSync('/folder1');
        fs.mkdirSync('/folder3');
        fs.mkdirSync('/folder3/temp3');
        fs.mkdirSync('/folder1/temp1');
        fs.writeFileSync('/folder1/temp1/package.json', JSON.stringify(components[0]));
        fs.mkdirSync('/folder2');
        fs.mkdirSync('/folder2/temp2');
        fs.writeFileSync('/folder2/temp2/package.json', JSON.stringify(components[1]));
    });

    it('Check grabbing components', async () => {
        // Arrange
        const expectedComponent: ComponentData[] = [
            { path: '/folder1/temp1', data: components[0] },
            { path: '/folder2/temp2', data: components[1] },
        ];

        // Act
        const componentsModule: ComponentsModule = new ComponentsModule(paths, new Logger());

        // Assert
        expect(componentsModule.components).toEqual(expectedComponent);
    });
});
