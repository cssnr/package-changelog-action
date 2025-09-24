import js from '@eslint/js'

export default [
    js.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            env: {
                node: true,
                es2021: true,
            },
        },
        rules: {
            'no-undef': 'off',
            'no-extra-semi': 'off',
        },
    },
]
