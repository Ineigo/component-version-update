import ChangelogModule from '../core/ChangelogModule';
import { PJSON, ComponentData, ChangelogArguments, ChangelogFileData } from '../core/types';
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

describe('ChangelogModule', () => {
    const paths: string[] = ['/folder1', '/folder2'];
    const components: PJSON[] = [
        { name: '@comp/temp1', version: '1.1.1', description: 'sadsadad' },
        { name: '@comp/temp2', version: '2.3.8', description: '00000000' },
    ];
    

    beforeEach(() => {
        require('fs').reset();
        fs.mkdirSync('/folder1');
        fs.mkdirSync('/folder1/temp1');
        fs.writeFileSync('/folder1/temp1/CHANGELOG.md', `# Changelog\n\r\n## [Unreleased]

### Changed

## 1.0.0`, 'utf8');
        fs.writeFileSync('/CHANGELOG.md', `asd
        asd`, 'utf8');
    });
    const params: ChangelogArguments = {
        changelogFileName: 'CHANGELOG.md'
    }

    it('parse', async () => {
        // Arrange
        const changelogModule: ChangelogModule = new ChangelogModule(params, new Logger());
        const expected: ChangelogFileData = {
            lines: [ '# Changelog', '', '## [Unreleased]', '', '### Changed', '', '## 1.0.0' ],
            unrealised: [],
            unrealisedLineNumber: 0,
        };
        
        // Act
        const result: ChangelogFileData = changelogModule.parse('/folder1/temp1/CHANGELOG.md');
        
        // Assert
        expect(result).toEqual(expected);
    });
    
    describe('isset', () => {
        it('positive', () => {
            const changelogModule: ChangelogModule = new ChangelogModule(params, new Logger());
            expect(changelogModule.isset('/folder1/temp1')).toBeTruthy();
        });
        it('negative', () => {
            const changelogModule: ChangelogModule = new ChangelogModule(params, new Logger());
            expect(changelogModule.isset('/folder1/temp2')).toBeFalsy();
        });
    });
});
