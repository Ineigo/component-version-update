import fs from 'fs';
import os from 'os';
import path from 'path';
import { ChangelogFiles, ChangelogFileData, ComponentData, ChangelogArguments } from './types';
import Logger from './Logger';

export default class ChangelogModule {
    changelogFileName: string = 'CHANGELOG.md';
    globalChangelogFormat: string;
    pathToGlobalChangelog?: string;
    files: ChangelogFiles = {};
    globalChangelog?: ChangelogFileData;

    constructor(
        {
            changelogFileName,
            pathToGlobalChangelog,
            globalChangelogFormat = '-   [%name%@%version%](%link%): %msg%',
        }: ChangelogArguments,
        logger: Logger
    ) {
        this.changelogFileName = changelogFileName || this.changelogFileName;
        this.globalChangelogFormat = globalChangelogFormat;
        this.pathToGlobalChangelog = pathToGlobalChangelog;
        if (pathToGlobalChangelog) {
            this.globalChangelog = this.parse(pathToGlobalChangelog);
            this.read(this.globalChangelog);
            logger.info(`Global changelog found in`, path.resolve(pathToGlobalChangelog));
        }
    }

    isset(path: string): Boolean {
        return fs.existsSync(`${path}/${this.changelogFileName}`);
    }

    parse(fullPathToFile: string): ChangelogFileData {
        const md: string = fs.readFileSync(fullPathToFile, 'utf8');
        const rows: string[] = md.split(/\r?\n/g);
        return { lines: rows, unreleased: [], unreleasedLineNumber: 0 };
    }

    add(path: string): ChangelogFileData {
        this.files[path] = this.parse(`${path}/${this.changelogFileName}`);
        return this.files[path];
    }

    get(path: string): ChangelogFileData {
        return this.files[path];
    }

    isUnreleased(path: string): Boolean {
        const changelog: ChangelogFileData = this.get(path);
        return !!(changelog && changelog.unreleased.length);
    }

    read(pathOrChangelog: string | ChangelogFileData): ChangelogFileData {
        const changelog: ChangelogFileData =
            typeof pathOrChangelog === 'string' ? this.add(pathOrChangelog) : pathOrChangelog;

        // Разбор changelog
        let isUnreleased = false;
        for (const lineNumber in changelog.lines) {
            const line: string = changelog.lines[lineNumber];
            if (isUnreleased) {
                const matches = line.match(/^### ([a-z]*)/i);
                if (line.match(/^## (.*)/i)) {
                    isUnreleased = false;
                } else if (!matches && line.length) {
                    const desc = line.replace(/^([^1-9\[\]a-zа-яё])*/i, '');
                    if (desc.length) {
                        changelog.unreleased.push(desc);
                    }
                }
            } else if (line.toLowerCase().includes('unreleased')) {
                changelog.unreleasedLineNumber = +lineNumber;
                isUnreleased = true;
            }
        }

        return changelog;
    }

    upVersion(path: string, version: string): Boolean {
        const changelog: ChangelogFileData = this.get(path);

        if (!changelog) {
            return false;
        }

        const headLine: string = `## [${version}] - ${this.getDateString()}`;
        changelog.lines.splice(changelog.unreleasedLineNumber + 1, 0, '', '---', headLine);
        const lines: string[] = changelog.lines;
        fs.writeFileSync(`${path}/${this.changelogFileName}`, lines.join(os.EOL), 'utf8');
        return true;
    }

    getDateString(): string {
        const date: Date = new Date();
        const day: string = `0${date.getDate()}`.slice(-2);
        const month: string = `0${date.getMonth() + 1}`.slice(-2);
        return `${date.getFullYear()}-${month}-${day}`;
    }

    writeGlobalChangelog(path: string, component: ComponentData): Boolean {
        if (!this.globalChangelog) {
            return false;
        }

        const changelog: ChangelogFileData = this.get(path);

        if (!changelog) {
            return false;
        }

        const changedMark: string = '### Changed';

        let index: number = this.indexOfMarkInUnreleased(this.globalChangelog, changedMark);

        if (index < 0) {
            this.globalChangelog.lines.splice(this.globalChangelog.unreleasedLineNumber + 1, 0, '', changedMark);
            index = this.globalChangelog.unreleasedLineNumber + 2;
        } else {
            index++;
        }

        const line: string = this.globalChangelogFormat
            .replace(/%name%/g, component.data.name)
            .replace(/%version%/g, component.data.version)
            .replace(/%date%/g, this.getDateString())
            .replace(/%link%/g, this.getLinkByChangelog(path, component.data.version))
            .replace(/%msg%/g, changelog.unreleased.join(', '));

        this.globalChangelog.lines.splice(index + 1, 0, line);
        const globalLines: string[] = this.globalChangelog.lines;
        fs.writeFileSync(`${this.pathToGlobalChangelog}`, globalLines.join(os.EOL), 'utf8');
        return true;
    }

    getLinkByChangelog(path: string, version: string): string {
        return `/${path.replace(/^\//, '')}/${this.changelogFileName}#${version.replace(/\./g, '')}-${this.getDateString()}`;
    }

    indexOfMarkInUnreleased(changelog: ChangelogFileData, mark: string): number {
        for (let i = changelog.unreleasedLineNumber + 1; changelog.lines.length > i; i++) {
            const row: string = changelog.lines[i];
            if (row.match(/^## (.*)/i)) {
                return -1;
            }
            if (row.includes(mark)) {
                return i;
            }
        }
        return -1;
    }
}
