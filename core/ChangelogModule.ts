import fs from 'fs';
import { ChangelogFiles, ChangelogFileData } from './types';

export default class ChangelogModule {
    changelogFileName: string = 'CHANGELOG.md';
    files: ChangelogFiles = {};

    constructor(changelogFileName: string) {
        this.changelogFileName = changelogFileName || this.changelogFileName;
    }

    isset(path: string): Boolean {
        return fs.existsSync(`${path}/${this.changelogFileName}`);
    }

    add(path: string): ChangelogFileData {
        const md: string = fs.readFileSync(`${path}/${this.changelogFileName}`, 'utf8');
        const rows: string[] = md.split(/\r?\n/g);
        this.files[path] = { lines: rows, unrealised: [], unrealisedLineNumber: 0 };
        return this.files[path];
    }

    get(path: string): ChangelogFileData {
        return this.files[path];
    }

    isUnrealized(path: string): Boolean {
        const changelog: ChangelogFileData = this.get(path);
        return !!(changelog && changelog.unrealised.length);
    }

    read(path: string): ChangelogFileData {
        const changelog: ChangelogFileData = this.add(path);

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

    upVersion(path: string, version: string) {
        const changelog: ChangelogFileData = this.get(path);

        if (!changelog) {
            return false;
        }

        const date: Date = new Date();
        const day: string = `0${date.getDate()}`.slice(-2);
        const month: string = `0${date.getMonth() + 1}`.slice(-2);
        const headLine: string = `## [${version}] - ${day}.${month}.${date.getFullYear()}`;
        changelog.lines.splice(changelog.unrealisedLineNumber + 1, 0, '', '---', headLine);
        const lines: string[] = changelog.lines;
        fs.writeFileSync(`${path}/${this.changelogFileName}`, lines.join('\r\n'));
        return true;
    }
}
