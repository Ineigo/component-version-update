import * as cvu from '../component-version-update';
jest.mock('inquirer');
const inquirer = require('inquirer');

describe('Module test', () => {
    it('user input', async () => {
        // expect.assertions(1);
        inquirer.prompt = jest.fn().mockResolvedValue({ email: 'some@example.com' });
        // await expect(module()).resolves.toEqual({ email: 'some@example.com' });
    });
});
