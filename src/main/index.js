'use strict';

import { app, Menu, BrowserWindow } from 'electron';
import initMenu from './menu.js';
import initVisualMetrics from './visual-metrics.js';
import initState from './state.js';

const winURL =
    process.env.NODE_ENV === 'development'
        ? `http://localhost:9080/renderer.html`
        : `file://${__dirname}/renderer.html`;

function createWindow() {
    const mainWindow = new BrowserWindow({
        height: 640,
        width: 1024,
        useContentSize: true,
        fullscreenable: false,
        minimizable: false,
        webPreferences: {
            webSecurity: false,
        },
    });

    mainWindow.loadURL(winURL);
}

app.setName('Twilight');
app.on('ready', () => {
    Menu.setApplicationMenu(initMenu());
    createWindow();
    initVisualMetrics();
    initState();
});
