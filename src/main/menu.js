import { Menu, BrowserWindow } from 'electron';
import path from 'path';
import logger from './logger.js';

let helpWindow = null;
const helpURL = 'file://' + path.resolve(__dirname, 'help.html');
logger.debug('help url: "%s"', helpURL);

const openHelpWindow = () => {
    if (helpWindow) {
        helpWindow.focus();
        return;
    }

    helpWindow = new BrowserWindow({
        resizable: false,
        title: 'help',
        minimizable: false,
        fullscreenable: false
    });

    helpWindow.loadURL(helpURL);

    helpWindow.on('closed', () => {
        helpWindow = null;
    });
};

const init = () => {
    const template = [
        {
            label: 'Twilight',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startspeaking' },
                        { role: 'stopspeaking' }
                    ]
                }
            ]
        },
        {
            role: 'window',
            submenu: [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Usage Help',
                    click() {
                        openHelpWindow();
                    }
                }
            ]
        }
    ];

    if (process.env.NODE_ENV === 'development') {
        template.push({
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    return menu;
};

export default init;
