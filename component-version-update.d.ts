import inquirer, { Question } from 'inquirer';
declare module '*.json' {
    const value: any;
    export default value;
}

declare module 'inquirer' {
    export interface Question {
        source?: Function
    }
}