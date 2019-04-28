import { ChangelogFileData } from '../core/types';

/////////////////////
// Unreleased
/////////////////////

export const changelogFileUnreleased: string = `# Changelog\n\r\n## [Unreleased]

### Changed

-   [@asdasd] - asdasdasdsadsad1
-   что-то русское

### Fixed

-   21321213213213213

## 1.0.0`;
export const changelogDataUnreleased: ChangelogFileData = {
    lines: [
        '# Changelog',
        '',
        '## [Unreleased]',
        '',
        '### Changed',
        '',
        '-   [@asdasd] - asdasdasdsadsad1',
        '-   что-то русское',
        '',
        '### Fixed',
        '',
        '-   21321213213213213',
        '',
        '## 1.0.0',
    ],
    unreleased: ['[@asdasd] - asdasdasdsadsad1', 'что-то русское', '21321213213213213'],
    unreleasedLineNumber: 2,
};

export const changelogLinesUppedVersion: string[] = [
    '# Changelog',
    '',
    '## [Unreleased]',
    '',
    '---',
    '## [1.1.2] - 2017-06-13',
    '',
    '### Changed',
    '',
    '-   [@asdasd] - asdasdasdsadsad1',
    '-   что-то русское',
    '',
    '### Fixed',
    '',
    '-   21321213213213213',
    '',
    '## 1.0.0',
];

/////////////////////
// Empty Unreleased
/////////////////////

export const changelogFileEmptyUnreleased: string = `# Changelog\n\r\n## [Unreleased]

### Changed

## 1.0.0`;
export const changelogDataEmptyUnreleased: ChangelogFileData = {
    lines: ['# Changelog', '', '## [Unreleased]', '', '### Changed', '', '## 1.0.0'],
    unreleased: [],
    unreleasedLineNumber: 2,
};

/////////////////////
// No Unreleased
/////////////////////

export const changelogFileNoUnreleased: string = `# Changelog\n\r
### Changed

## 1.0.0`;
export const changelogDataNoUnreleased: ChangelogFileData = {
    lines: ['# Changelog', '', '### Changed', '', '## 1.0.0'],
    unreleased: [],
    unreleasedLineNumber: 0,
};
