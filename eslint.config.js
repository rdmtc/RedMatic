const js = require('@eslint/js');

const nodeGlobals = {
    require: 'readonly',
    module: 'writable',
    process: 'readonly',
    console: 'readonly',
    __dirname: 'readonly',
    Buffer: 'readonly',
    fetch: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    URL: 'readonly'
};

const browserGlobals = {
    window: 'readonly',
    document: 'readonly',
    location: 'readonly',
    history: 'readonly',
    localStorage: 'readonly',
    alert: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    XMLHttpRequest: 'readonly',
    Blob: 'readonly',
    FormData: 'readonly'
};

module.exports = [
    js.configs.recommended,
    {
        ignores: ['addon_tmp/**', 'node_modules/**', 'dist/**', 'RedMatic.wiki/**']
    },
    {
        files: ['*.js', 'addon_files/redmatic/lib/*.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'commonjs',
            globals: nodeGlobals
        },
        rules: {
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-unused-vars': ['error', { args: 'none' }]
        }
    },
    {
        files: ['*.mjs'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: nodeGlobals
        },
        rules: {
            'no-empty': ['error', { allowEmptyCatch: true }]
        }
    },
    {
        files: ['addon_files/redmatic/www/js/*.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'script',
            globals: {
                ...browserGlobals,
                $: 'readonly',
                jQuery: 'readonly',
                dcodeIO: 'readonly'
            }
        },
        rules: {
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-unused-vars': ['error', { args: 'none' }]
        }
    }
];
