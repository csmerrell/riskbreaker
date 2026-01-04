import { BrowserWindow } from 'electron';

let devtools: InstanceType<typeof BrowserWindow>;
export function addDevTools(mainWindow: InstanceType<typeof BrowserWindow>) {
    devtools = new BrowserWindow();
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.webContents.once('did-finish-load', function () {
        const windowBounds = mainWindow.getBounds();
        devtools.setPosition(windowBounds.x + windowBounds.width, windowBounds.y);
        devtools.setSize(560, 900);
    });
    mainWindow.on('move', function () {
        if (!mainWindow) return;
        const windowBounds = mainWindow.getBounds();
        devtools.setPosition(windowBounds.x + windowBounds.width - 5, windowBounds.y);
    });

    mainWindow.on('focus', () => focusWindow(mainWindow, devtools));
}

let recurseLock = false;
export function focusWindow(
    mainWindow: InstanceType<typeof BrowserWindow>,
    devtools: InstanceType<typeof BrowserWindow>,
) {
    if (!devtools || !mainWindow) return;

    if (!recurseLock) {
        recurseLock = true;
        devtools.focus();
        mainWindow.focus();
    } else {
        recurseLock = false;
    }
}

export function closeDevTools() {
    if (!devtools) return;
    devtools.close();
    devtools = null;
}
