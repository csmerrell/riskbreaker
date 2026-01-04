import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVuePrettierConfig from '@vue/eslint-config-prettier';
import pluginStorybook from 'eslint-plugin-storybook';
import pluginTailwind from 'eslint-plugin-tailwindcss';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const gitignorePath = path.resolve(dirname, '.gitignore');

/* eslint-env node */
export default [
    ...[
        ...defineConfigWithVueTs(pluginVue.configs['flat/recommended'], vueTsConfigs.recommended),
        ...[
            {
                rules: {
                    '@typescript-eslint/no-unused-vars': [
                        'error',
                        {
                            ignoreRestSiblings: true,
                            argsIgnorePattern: '^_',
                            varsIgnorePattern: '^_',
                            caughtErrorsIgnorePattern: '^_',
                        },
                    ],
                },
            },
        ],
    ],
    ...pluginStorybook.configs['flat/recommended'],
    ...[
        ...pluginTailwind.configs['flat/recommended'],
        ...[
            {
                rules: {
                    'tailwindcss/no-custom-classname': 'off',
                },
            },
        ],
    ],
    pluginVuePrettierConfig,

    includeIgnoreFile(gitignorePath),
    // Main configuration block
    {
        files: ['**/.{vue,js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
        ignores: ['*/.d.ts', '!.storybook'],
        languageOptions: {
            ecmaVersion: 'latest',
        },
        rules: {
            quotes: ['warning', 'single'],
            indent: ['error', 'tab', { SwitchCase: 1 }],
            'vue/multi-word-component-names': 'off',
        },
    },
];
