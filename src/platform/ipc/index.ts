import { ipcMain } from 'electron';
export function initIPC() {
    ipcMain.on('save-game', () => {
        return 'Not yet implemented';
    });
    ipcMain.on('available-saved-games', () => {
        return 'Not yet implemented';
    });
}
