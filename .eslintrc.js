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
        'no-debugger': 1,
        'no-console': 1,
        'no-constant-condition': [1, { checkLoops: false }],
        'no-unreachable': 1,
        'no-unused-vars': [1, { args: 'none' }],
        semi: 1,
        quotes: [
            1,
            'single',
            { avoidEscape: true, allowTemplateLiterals: true }
        ]
    }
};
