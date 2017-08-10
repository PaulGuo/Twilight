'use strict';

import { app, Menu, BrowserWindow } from 'electron';
import initMenu from './menu.js';
import initVisualMetrics from './visual-metrics.js';
import { initState, renewState } from './state.js';
import logger from './logger.js';

const winURL =
    process.env.NODE_ENV === 'development'
        ? `http://localhost:9080/renderer.html`
        : `file://${__dirname}/renderer.html`;

let mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        height: 640,
        width: 1024,
        useContentSize: true,
        fullscreenable: false,
        minimizable: false,
        webPreferences: {
            webSecurity: false,
        },
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        renewState();
    });

    logger.debug('load url: "%s"', winURL);
    mainWindow.loadURL(winURL);
}

app.setName('Twilight');

app.on('ready', () => {
    Menu.setApplicationMenu(initMenu());
    createWindow();
    initVisualMetrics();
    initState();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
