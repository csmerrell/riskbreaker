import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// https://vite.dev/config/
export default defineConfig(async () => {
    const { default: glsl } = await import('vite-plugin-glsl');
    return {
        plugins: [
            glsl(),
            vue(),
            {
                name: 'index-html-build-replacement',
                async transformIndexHtml() {
                    return await fs.readFile('./index.web.html', 'utf8');
                },
            },
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src/estelle-igni', import.meta.url)),
                '@web': fileURLToPath(new URL('./src/clairescott.dev', import.meta.url)),
                '@root': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    };
});
