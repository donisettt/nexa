import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        // Allow all hosts including ngrok
        allowedHosts: 'all',
        cors: true,
        hmr: {
            // Use the Vite server host for HMR instead of the page origin
            host: 'localhost',
        },
    },
});
