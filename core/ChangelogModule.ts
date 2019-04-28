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
            globalChangelogFormat = '-   [%name%@%version%]: %msg%',
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
        return { lines: rows, unrealised: [], unrealisedLineNumber: 0 };
    }

    add(path: string): ChangelogFileData {
        this.files[path] = this.parse(`${path}/${this.changelogFileName}`);
        return this.files[path];
    }

    get(path: string): ChangelogFileData {
        return this.files[path];
    }

    isUnrealized(path: string): Boolean {
        const changelog: ChangelogFileData = this.get(path);
        return !!(changelog && changelog.unrealised.length);
    }

    read(pathOrChangelog: string | ChangelogFileData): ChangelogFileData {
        const changelog: ChangelogFileData =
            typeof pathOrChangelog === 'string' ? this.add(pathOrChangelog) : pathOrChangelog;

        // Разбор changelog
        let isUnrelised = false;
        for (const lineNumber in changelog.lines) {
            const line: string = changelog.lines[lineNumber];
            if (isUnrelised) {
                const matches = line.match(/^### ([a-z]*)/i);
                if (line.match(/^## (.*)/i)) {
                    isUnrelised = false;
                } else if (!matches && line.length) {
                    const desc = line.replace(/^([^1-9\[\]a-zа-яё])*/i, '');
                    if (desc.length) {
                        changelog.unrealised.push(desc);
                    }
                }
            } else if (line.toLowerCase().includes('unreleased')) {
                changelog.unrealisedLineNumber = +lineNumber;
                isUnrelised = true;
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
        changelog.lines.splice(changelog.unrealisedLineNumber + 1, 0, '', '---', headLine);
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

    writeGlobalChangelog(path: string, component: ComponentData) {
        if (!this.globalChangelog) {
            return false;
        }

        const changelog: ChangelogFileData = this.get(path);

        if (!changelog) {
            return false;
        }

        const changedMark: string = '### Changed';

        let index: number = this.indexOfMarkInUnrelized(this.globalChangelog, changedMark);

        if (index < 0) {
            this.globalChangelog.lines.splice(this.globalChangelog.unrealisedLineNumber + 1, 0, '', changedMark);
            index = this.globalChangelog.unrealisedLineNumber + 2;
        } else {
            index++;
        }

        const line: string = this.globalChangelogFormat
            .replace(/%name%/g, component.data.name)
            .replace(/%version%/g, component.data.version)
            .replace(/%data%/g, this.getDateString())
            .replace(/%link%/g, `/${path}/${this.changelogFileName}`)
            .replace(/%msg%/g, changelog.unrealised.join(', '));
            
        this.globalChangelog.lines.splice(index + 1, 0, line);
        const globalLines: string[] = this.globalChangelog.lines;
        fs.writeFileSync(`${this.pathToGlobalChangelog}`, globalLines.join(os.EOL), 'utf8');
    }

    indexOfMarkInUnrelized(changelog: ChangelogFileData, mark: string): number {
        for (let i = changelog.unrealisedLineNumber + 1; changelog.lines.length > i; i++) {
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
