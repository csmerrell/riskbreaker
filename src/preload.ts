// preload.js (Electron Preload Script)
import { contextBridge, ipcRenderer } from 'electron';

export const ipcAPI = {
    saveGame: () => '',
    availableSaveGames: () => '',
    changeWindowResolution: (width: number, height: number) =>
        ipcRenderer.invoke('change-window-resolution', width, height),
    changeWindowMode: (
        mode: 'windowed' | 'borderless' | 'fullscreen',
        width?: number,
        height?: number,
    ) => ipcRenderer.invoke('change-window-mode', mode, width, height),
    quit: () => ipcRenderer.invoke('quit'),
    minimize: () => ipcRenderer.invoke('minimize'),
};

contextBridge.exposeInMainWorld('electron', ipcAPI);
