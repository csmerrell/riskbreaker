import { app, ipcMain, BrowserWindow } from 'electron';

export function initIPC() {
    ipcMain.handle('change-window-resolution', (event, width: number, height: number) => {
        try {
            const window = BrowserWindow.fromWebContents(event.sender);
            if (!window) {
                throw new Error('Window not found');
            }

            console.log(`Changing window resolution to: ${width}x${height}`);

            // Temporarily enable resizing if it's disabled
            const wasResizable = window.isResizable();
            if (!wasResizable) {
                window.setResizable(true);
            }

            // Clear any minimum/maximum size constraints temporarily
            window.setMinimumSize(0, 0);
            window.setMaximumSize(0, 0);

            // First set the content size directly
            window.setContentSize(width, height);

            // Get fresh bounds after setting content size
            const contentBounds = window.getContentBounds();
            const windowBounds = window.getBounds();
            const frameWidth = windowBounds.width - contentBounds.width;
            const frameHeight = windowBounds.height - contentBounds.height;

            // Ensure the window size is exactly what we want
            window.setSize(width + frameWidth, height + frameHeight);

            // Set at 0,0
            window.setPosition(0, 0);

            // Restore the original resizable state
            if (!wasResizable) {
                window.setResizable(false);
            }

            return { success: true, width, height };
        } catch (error) {
            console.error('Failed to change window resolution:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle(
        'change-window-mode',
        (
            event,
            mode: 'windowed' | 'borderless' | 'fullscreen',
            width?: number,
            height?: number,
        ) => {
            try {
                const window = BrowserWindow.fromWebContents(event.sender);
                if (!window) {
                    throw new Error('Window not found');
                }

                window.setResizable(true);
                switch (mode) {
                    case 'windowed':
                        if (!(width && height)) {
                            throw new Error('windowed mode must specify height & width dimensions');
                        }

                        if (window.isFullScreen()) {
                            window.setFullScreen(false);
                        }

                        const windowWidth = width;
                        const windowHeight = height;
                        window.setContentSize(windowWidth, windowHeight);
                        window.setPosition(0, 0);
                        window.setResizable(false);
                        break;

                    case 'borderless':
                    case 'fullscreen':
                        window.setFullScreen(true);
                        window.moveTop();
                        window.focus();
                        window.setResizable(false);
                        break;

                    default:
                        throw new Error(`Invalid window mode: ${mode}`);
                }

                return { success: true, mode, width, height };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
    );

    ipcMain.handle('quit', () => {
        app.quit();
    });

    ipcMain.handle('minimize', (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.minimize();
    });
}
