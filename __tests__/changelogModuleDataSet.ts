import { ChangelogFileData } from '../core/types';

/////////////////////
// Unreleazed
/////////////////////

export const changelogFileUnrelized: string = `# Changelog\n\r\n## [Unreleased]

### Changed

-   [@asdasd] - asdasdasdsadsad1
-   что-то русское

### Fixed

-   21321213213213213

## 1.0.0`;
export const changelogDataUnrelized: ChangelogFileData = {
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
    unrealised: ['[@asdasd] - asdasdasdsadsad1', 'что-то русское', '21321213213213213'],
    unrealisedLineNumber: 2,
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
// Empty Unreleazed
/////////////////////

export const changelogFileEmptyUnrelized: string = `# Changelog\n\r\n## [Unreleased]

### Changed

## 1.0.0`;
export const changelogDataEmptyUnrelized: ChangelogFileData = {
    lines: ['# Changelog', '', '## [Unreleased]', '', '### Changed', '', '## 1.0.0'],
    unrealised: [],
    unrealisedLineNumber: 2,
};

/////////////////////
// No Unreleazed
/////////////////////

export const changelogFileNoUnrelized: string = `# Changelog\n\r
### Changed

## 1.0.0`;
export const changelogDataNoUnrelized: ChangelogFileData = {
    lines: ['# Changelog', '', '### Changed', '', '## 1.0.0'],
    unrealised: [],
    unrealisedLineNumber: 0,
};
