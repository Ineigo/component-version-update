import chalk from 'chalk';

export default class Logger {
    verbose: Boolean;

    constructor(verbose: Boolean = false) {
        this.verbose = verbose;
    }

    log(msg: string): void {
        console.log(chalk.grey(msg));
    }

    message(msg: string, after?: string) {
        console.log(chalk.bold.white(msg), chalk.bold.blue(after || ''));
    }

    info(msg: string, after: string = ''): void {
        if (this.verbose) {
            console.log(chalk.bold.blue(`[Info]`), msg, chalk.grey(after));
        }
    }

    warn(msg: string, after: string = ''): void {
        if (this.verbose) {
            console.log(chalk.bold.yellow(`[Warning] ${msg}`), chalk.yellow(after));
        }
    }

    error(msg: string, after: string = ''): void {
        console.log(chalk.bold.red(`[Error]: ${msg}`), chalk.red(after));
    }
}
