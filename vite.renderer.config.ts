import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config
export default defineConfig(async () => {
    const { default: glsl } = await import('vite-plugin-glsl');
    return {
        plugins: [vue(), glsl()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    };
});
