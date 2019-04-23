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
}