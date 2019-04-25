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
    changelogFileName?: string;
    onlyUnrealised?: Boolean;
    verbose?: Boolean;
    pathToGlobalChangelog?: string;
    globalChangelogFormat?: string;
    commitMessage?: string;
}

export interface ChangelogFileData {
    lines: string[];
    unrealisedLineNumber: number;
    unrealised: string[];
}

export interface ChangelogFiles {
    [key: string]: ChangelogFileData;
}