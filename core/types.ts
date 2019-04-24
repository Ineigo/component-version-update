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
    changelogFileName?: string;
    onlyUnrealised?: Boolean;
    pathsToComponents: string[]
}

export interface ChangelogFileData {
    lines: string[];
    unrealisedLineNumber: number;
    unrealised: string[];
}

export interface ChangelogFiles {
    [key: string]: ChangelogFileData;
}