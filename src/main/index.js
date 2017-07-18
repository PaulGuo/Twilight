'use strict';

import { app, BrowserWindow } from 'electron';
import startListen from './virtual-metrics.js';

const winURL =
    process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`;

function createWindow() {
    const mainWindow = new BrowserWindow({
        height: 640,
        width: 1024,
        useContentSize: true,
        webPreferences: {
            webSecurity: false
        }
    });

    mainWindow.loadURL(winURL);
}

app.on('ready', () => {
    createWindow();
    startListen();
});
