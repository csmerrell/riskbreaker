import { ipcAPI } from './preload';

declare global {
    interface Window {
        electron: typeof ipcAPI; // Adjust the type as needed (e.g., you can specify a more specific type instead of `any`)
    }
}
