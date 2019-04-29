import fs, { Stats } from 'fs';
import chalk from 'chalk';
import path from 'path';
import Logger from './Logger';
import { ComponentData, PJSON } from './types';

export default class ComponentsModule {
    logger: Logger;
    components: ComponentData[];

    constructor(paths: string[], logger: Logger) {
        this.logger = logger;

        this.components = [];
        for (const pathToComponents of paths) {
            const componentsInFolder: ComponentData[] = this.findAll(pathToComponents);
            if (!componentsInFolder.length) {
                logger.warn(`Not found components in ${path.resolve(pathToComponents)}`);
                continue;
            }
            logger.info(
                `Found ` +
                    chalk.bold(`${componentsInFolder.length} `) +
                    chalk.bold(`(${pathToComponents})`) +
                    ` components in`,
                path.resolve(pathToComponents)
            );
            this.components = this.components.concat(componentsInFolder);
        }

        logger.info('Total: ' + chalk.bold.white(`${this.components.length}`) + ' found components');
    }

    findAll(pathToComponents: string): ComponentData[] {
        const folders: string[] = fs.readdirSync(pathToComponents);
        const componentsInFolder: ComponentData[] = [];

        for (const folder of folders) {
            const location = `${pathToComponents}/${folder}`;

            const stats: Stats = fs.lstatSync(location);
            if (this.isset(location)) {
                const component: ComponentData = this.read(location);
                componentsInFolder.push(component);
            } else if (stats.isDirectory()){
                this.logger.warn('Not found package.json in', path.resolve(location));
            }
        }

        return componentsInFolder;
    }

    isset(componentPath: string): Boolean {
        return fs.existsSync((componentPath === '/' ? '/' : componentPath) + '/package.json');
    }

    read(componentPath: string): ComponentData {
        const location = componentPath === '/' ? '/' : componentPath;
        const data: PJSON = JSON.parse(fs.readFileSync(location + '/package.json', 'utf8'));
        return {
            path: location,
            data,
        };
    }
}
