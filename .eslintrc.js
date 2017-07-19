const process = require('process');

module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module'
    },
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    plugins: ['html'],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
        'no-constant-condition': [1, { checkLoops: false }],
        'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
        'no-unreachable': process.env.NODE_ENV === 'production' ? 1 : 0,
        'no-unused-vars': [1, { args: 'none' }],
        quotes: [
            1,
            'single',
            { avoidEscape: true, allowTemplateLiterals: true }
        ],
        semi: 1
    }
};
