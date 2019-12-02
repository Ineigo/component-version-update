export interface PJSON {
    version: string;
    description: string;
    name: string;
}

export interface ComponentData {
    path: string;
    data: PJSON;
}

export interface Settings {
    pathsToComponents: string[]
    changelogFileName: string;
    onlyUnreleased?: Boolean;
    verbose?: Boolean;
    pathToGlobalChangelog?: string;
    globalChangelogFormat?: string;
    commitMessage?: string;
    packageName?: string;
}

export interface ChangelogFileData {
    lines: string[];
    unreleasedLineNumber: number;
    unreleased: string[];
}

export interface ChangelogFiles {
    [key: string]: ChangelogFileData;
}

export interface ChangelogArguments {
    changelogFileName?: string;
    pathToGlobalChangelog?: string;
    globalChangelogFormat?: string;
}