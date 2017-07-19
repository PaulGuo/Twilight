'use strict';

import { app, BrowserWindow } from 'electron';
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
        webPreferences: {
            webSecurity: false
        }
    });

    mainWindow.loadURL(winURL);
}

app.on('ready', () => {
    createWindow();
    initVisualMetrics();
    initState();
});
