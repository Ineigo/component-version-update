module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    collectCoverageFrom: ['core/**/*.ts'],
    watchPathIgnorePatterns: ['node_modules'],
    coverageDirectory: './jscoverage/',
    coverageReporters: ['html', 'json', 'lcov'],
};
