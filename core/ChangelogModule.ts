import fs from 'fs';
import path from 'path';
import { ChangelogFiles, ChangelogFileData, ComponentData } from './types';
import Logger from './Logger';

interface ChangelogArguments {
    changelogFileName: string;
    pathToGlobalChangelog?: string;
    globalChangelogFormat?: string;
}

export default class ChangelogModule {
    changelogFileName: string = 'CHANGELOG.md';
    globalChangelogFormat: string;
    pathToGlobalChangelog?: string;
    files: ChangelogFiles = {};
    globalChangelog?: ChangelogFileData;

    constructor(
        { changelogFileName, pathToGlobalChangelog, globalChangelogFormat = '-   [%name%@%version%]: %msg%' }: ChangelogArguments,
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

    parse(path: string): ChangelogFileData {
        const md: string = fs.readFileSync(path, 'utf8');
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
                    const desc = line.replace(/^([^a-zа-яё])*/i, '');
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

        const date: Date = new Date();
        const day: string = `0${date.getDate()}`.slice(-2);
        const month: string = `0${date.getMonth() + 1}`.slice(-2);
        const dateString: string = `${day}.${month}.${date.getFullYear()}`;
        const headLine: string = `## [${version}] - ${dateString}`;
        changelog.lines.splice(changelog.unrealisedLineNumber + 1, 0, '', '---', headLine);
        const lines: string[] = changelog.lines;
        fs.writeFileSync(`${path}/${this.changelogFileName}`, lines.join('\r\n'));
        return true;
    }

    writeGlobalChangelog(path: string, component: ComponentData) {
        if (!this.globalChangelog) {
            return false;
        }

        const changelog: ChangelogFileData = this.get(path);

        if (!changelog) {
            return false;
        }

        const index = this.globalChangelog.lines.indexOf('### Changed');
        const line: string = this.globalChangelogFormat
            .replace(/%name%/g, component.data.name)
            .replace(/%version%/g, component.data.version)
            .replace(/%msg%/g, changelog.unrealised.join(', '));
        this.globalChangelog.lines.splice(index + 2, 0, line);
        const globalLines: string[] = this.globalChangelog.lines;
        fs.writeFileSync(`${this.pathToGlobalChangelog}`, globalLines.join('\r\n'));
    }
}
