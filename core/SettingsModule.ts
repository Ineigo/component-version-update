import fs, { Stats } from 'fs';
import path from 'path';
import Logger from './Logger';
import { Settings } from './types';
import program from 'commander';
import chalk from 'chalk';

export default class SettingsModule {
    logger: Logger;
    settings: Settings;
    constructor(pathToSettings: string, logger: Logger) {
        this.logger = logger;
        
        if (!fs.existsSync(pathToSettings)) {
            throw this.logger.error(`Missing ${pathToSettings}`);
        }

        const stats: Stats = fs.lstatSync(pathToSettings);
        
        if (!stats.isFile()) {
            throw this.logger.error(`Must be isset file ${pathToSettings}`);
        }

        let userPackageJson;

        try {
            userPackageJson = require(path.resolve(pathToSettings));
        } catch(e) {
            throw logger.error(`Not correct *.json ${pathToSettings}`);
        }

        if (!userPackageJson.cvu) {
            throw logger.error(`Missing cvu key in ${pathToSettings}`);
        }

        if (!userPackageJson.cvu.pathsToComponents || !userPackageJson.cvu.pathsToComponents.length) {
            throw logger.error("pathsToComponents c'not empty");
        }
        
        this.settings = userPackageJson.cvu;

        this.settings.verbose = program.verbose || this.settings.verbose || false;
        this.settings.onlyUnreleased = program.onlyUnreleased || this.settings.onlyUnreleased || false;
        this.settings.changelogFileName = this.settings.changelogFileName || 'CHANGELOG.md';

        this.logMods(this.settings, logger);
    }

    logMods(settings: Settings, logger: Logger): void {
        logger.info(chalk.bold.yellow('Run with mode verbose'));
    
        if (settings.onlyUnreleased) {
            logger.info(chalk.bold.yellow('Run with mode onlyUnreleased'));
        }
    
        console.log();
    }
}
