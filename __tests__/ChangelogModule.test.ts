import ChangelogModule from '../core/ChangelogModule';
import { ChangelogFileData, ChangelogFiles, ComponentData } from '../core/types';
import fs from 'fs';
import Logger from '../core/Logger';
import {
    changelogFileEmptyUnrelized,
    changelogFileNoUnrelized,
    changelogDataEmptyUnrelized,
    changelogDataNoUnrelized,
    changelogFileUnrelized,
    changelogDataUnrelized,
    changelogLinesUppedVersion,
} from './changelogModuleDataSet';

jest.mock('chalk', () => {
    const bold = (v: string) => v;
    bold.grey = bold;
    bold.white = bold;
    return {
        default: { grey: bold, white: bold, bold },
        grey: bold,
        white: bold,
        bold,
    };
});

const DATE_TO_USE = new Date('2017-06-13T04:41:20');
class DateMock extends Date {
    constructor() {
        super();
        return DATE_TO_USE;
    }
}
(global.Date as any) = DateMock;

jest.mock('fs', () => new (require('metro-memory-fs'))());

it('getLinkByChangelog', () => {
    // Arrange
    const changelogModule: ChangelogModule = new ChangelogModule({}, new Logger());

    // Act
    const result: string = changelogModule.getLinkByChangelog('/folder1/temp1', '1.1.2');

    // Assert
    expect(result).toBe('/folder1/temp1/CHANGELOG.md#112-2017-06-13');
});

describe('ChangelogModule', () => {
    beforeEach(() => {
        require('fs').reset();
        fs.mkdirSync('/folder1');
        fs.mkdirSync('/folder1/temp1');
        fs.writeFileSync('/folder1/temp1/CHANGELOG.md', changelogFileEmptyUnrelized, 'utf8');
        fs.writeFileSync('/folder1/temp1/CHANGELOG_NO_UNRELEASED.md', changelogFileNoUnrelized, 'utf8');
        fs.writeFileSync('/folder1/temp1/CHANGELOG_UNRELEASED.md', changelogFileUnrelized, 'utf8');
        fs.writeFileSync(
            '/CHANGELOG.md',
            `# Changelog

## [Unreleased]

### Changed

- [comp1:1.1.1] - 2016-07-10`,
            'utf8'
        );
    });

    describe('writeGlobalChangelog', () => {
        const compData: ComponentData = {
            path: '/folder1/temp1',
            data: {
                description: 'asd',
                version: '1.1.2',
                name: 'comp1',
            },
        };

        it('no global changelog', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md' },
                new Logger()
            );

            // Act
            const result: Boolean = changelogModule.writeGlobalChangelog(path, compData);

            // Assert
            expect(result).toBeFalsy();
        });

        it('no changelog', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md', pathToGlobalChangelog: '/CHANGELOG.md' },
                new Logger()
            );

            // Act
            const result: Boolean = changelogModule.writeGlobalChangelog(path, compData);

            // Assert
            expect(result).toBeFalsy();
        });

        it('isset global changelog', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md', pathToGlobalChangelog: '/CHANGELOG.md', globalChangelogFormat: '- [%name%:%version%] - %date%' },
                new Logger()
            );
            const data: ChangelogFileData = changelogModule.read(path);

            // Act
            const result: Boolean = changelogModule.writeGlobalChangelog(path, compData);

            // Assert
            expect(result).toBeTruthy();
            expect(changelogModule.globalChangelog).toEqual({
                lines: [
                    '# Changelog',
                    '',
                    '## [Unreleased]',
                    '',
                    '### Changed',
                    '',
                    '- [comp1:1.1.2] - 2017-06-13',
                    '- [comp1:1.1.1] - 2016-07-10',
                ],
                unrealised: ['[comp1:1.1.1] - 2016-07-10'],
                unrealisedLineNumber: 2,
            });
        });
    });

    describe('upVersion', () => {
        it('upped', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md' },
                new Logger()
            );
            const data: ChangelogFileData = changelogModule.read(path);

            // Act
            const result: Boolean = changelogModule.upVersion(path, '1.1.2');

            // Assert
            expect(result).toBeTruthy();
            expect(data.lines).toEqual(changelogLinesUppedVersion);
        });

        it('no upped', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md' },
                new Logger()
            );

            // Act
            const result: Boolean = changelogModule.upVersion(path, '1.1.2');

            // Assert
            expect(result).toBeFalsy();
        });
    });

    describe('indexOfMarkInUnrelized', () => {
        it('isset mark', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md' },
                new Logger()
            );
            const data: ChangelogFileData = changelogModule.read(path);
            const mark: string = '### Fixed';

            // Act
            const result: number = changelogModule.indexOfMarkInUnrelized(data, mark);

            // Assert
            expect(result).toBe(data.lines.indexOf(mark));
        });

        it('no mark', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_NO_UNRELEASED.md' },
                new Logger()
            );
            const data: ChangelogFileData = changelogModule.read(path);
            const mark: string = '### Fixed';

            // Act
            const result: number = changelogModule.indexOfMarkInUnrelized(data, mark);

            // Assert
            expect(result).toBe(-1);
        });
    });

    describe('isUnrealized', () => {
        it('positive', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md' },
                new Logger()
            );
            changelogModule.read(path);

            // Act
            const result: Boolean = changelogModule.isUnrealized(path);

            // Assert
            expect(result).toBeTruthy();
        });

        it('negative', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule({}, new Logger());
            changelogModule.read(path);

            // Act
            const result: Boolean = changelogModule.isUnrealized(path);

            // Assert
            expect(result).toBeFalsy();
        });
    });

    describe('read', () => {
        it('empty unreleased', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule({}, new Logger());
            const expected: ChangelogFileData = changelogDataEmptyUnrelized;
            const expectedFiles: ChangelogFiles = { [path]: expected };

            // Act
            const result: ChangelogFileData = changelogModule.read(path);

            // Assert
            expect(result).toEqual(expected);
            expect(changelogModule.files).toEqual(expectedFiles);
            expect(changelogModule.get(path)).toEqual(expected);
        });

        it('no unreleased', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_NO_UNRELEASED.md' },
                new Logger()
            );
            const expected: ChangelogFileData = changelogDataNoUnrelized;
            const expectedFiles: ChangelogFiles = { [path]: expected };

            // Act
            const result: ChangelogFileData = changelogModule.read(path);

            // Assert
            expect(result).toEqual(expected);
            expect(changelogModule.files).toEqual(expectedFiles);
            expect(changelogModule.get(path)).toEqual(expected);
        });

        it('unreleased', () => {
            // Arrange
            const path: string = '/folder1/temp1';
            const changelogModule: ChangelogModule = new ChangelogModule(
                { changelogFileName: 'CHANGELOG_UNRELEASED.md' },
                new Logger()
            );
            const expected: ChangelogFileData = changelogDataUnrelized;
            const expectedFiles: ChangelogFiles = { [path]: expected };

            // Act
            const result: ChangelogFileData = changelogModule.read(path);

            // Assert
            expect(result).toEqual(expected);
            expect(changelogModule.files).toEqual(expectedFiles);
            expect(changelogModule.get(path)).toEqual(expected);
        });
    });

    it('add', () => {
        // Arrange
        const path: string = '/folder1/temp1';
        const changelogModule: ChangelogModule = new ChangelogModule({}, new Logger());
        const expected: ChangelogFileData = {
            lines: changelogDataEmptyUnrelized.lines,
            unrealised: [],
            unrealisedLineNumber: 0,
        };
        const expectedFiles: ChangelogFiles = { [path]: expected };

        // Act
        const result: ChangelogFileData = changelogModule.add(path);

        // Assert
        expect(result).toEqual(expected);
        expect(changelogModule.files).toEqual(expectedFiles);
        expect(changelogModule.get(path)).toEqual(expected);
    });

    it('parse', async () => {
        // Arrange
        const changelogModule: ChangelogModule = new ChangelogModule({}, new Logger());
        const expected: ChangelogFileData = {
            lines: changelogDataEmptyUnrelized.lines,
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
            const changelogModule: ChangelogModule = new ChangelogModule({}, new Logger());
            expect(changelogModule.isset('/folder1/temp1')).toBeTruthy();
        });
        it('negative', () => {
            const changelogModule: ChangelogModule = new ChangelogModule({}, new Logger());
            expect(changelogModule.isset('/folder1/temp2')).toBeFalsy();
        });
    });
});
