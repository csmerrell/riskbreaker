import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { addDevTools, closeDevTools } from './platform/dev/devtools.helpers';
import { initIPC } from './platform/ipc/index';

import contextMenu from 'electron-context-menu';
contextMenu();

// Set command line switches BEFORE app is ready
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');

if (started) {
    app.quit();
}

const createWindow = () => {
    const targetWidth = 1280;
    const targetHeight = 720;
    const mainWindow = new BrowserWindow({
        height: targetHeight,
        width: targetWidth,
        resizable: false,
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            zoomFactor: 1.0,
        },
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        mainWindow.setPosition(0, 200);
        addDevTools(mainWindow);
        mainWindow.on('close', closeDevTools);
    } else {
        app.on('web-contents-created', (_, contents) => {
            contents.on('before-input-event', (event, input) => {
                if (input.control || input.meta) {
                    event.preventDefault();
                }
            });
        });

        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        );
    }

    // Get the current bounds of the window
    const { width, height } = mainWindow.getContentBounds();

    // Calculate the difference between the content area and the actual window size
    const frameWidth = mainWindow.getBounds().width - width;
    const frameHeight = mainWindow.getBounds().height - height;

    // Set the new size for the entire window (including the frame)
    mainWindow.setSize(targetWidth + frameWidth, targetHeight + frameHeight);

    // Prevent zoom via keyboard shortcuts and mouse wheel
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control || input.meta) {
            // Block Ctrl/Cmd + Plus, Minus, 0 (zoom shortcuts)
            if (input.key === '+' || input.key === '-' || input.key === '0' || input.key === '=') {
                event.preventDefault();
            }
        }
    });

    // Prevent zoom level changes
    mainWindow.webContents.setZoomFactor(1.0);
    mainWindow.webContents.on('zoom-changed', (event) => {
        event.preventDefault();
        mainWindow.webContents.setZoomFactor(1.0);
    });

    // Disable pinch-to-zoom
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
};

app.on('ready', () => {
    initIPC();
    createWindow();
    // Menu.setApplicationMenu(null);
    app.setAccessibilitySupportEnabled(true);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
