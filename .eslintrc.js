module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
    },
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    plugins: ['html'],
    rules: {
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 1,
        'no-console': process.env.NODE_ENV === 'production' ? 2 : 1,
        'no-constant-condition': [1, { checkLoops: false }],
        'no-unreachable': 1,
        'no-unused-vars': [1, { args: 'none' }],
        semi: process.env.NODE_ENV === 'production' ? 2 : 1,
        quotes: [
            1,
            'single',
            { avoidEscape: true, allowTemplateLiterals: true }
        ]
    }
};
