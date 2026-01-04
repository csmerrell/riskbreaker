// preload.js (Electron Preload Script)
import { contextBridge } from 'electron';

export const ipcAPI = {
    saveGame: () => '',
    availableSaveGames: () => '',
};

contextBridge.exposeInMainWorld('electron', ipcAPI);
