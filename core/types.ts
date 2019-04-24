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