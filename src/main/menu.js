import process from 'process';
import { Menu } from 'electron';

const init = () => {
    const template = [
        {
            label: 'Edit',
            submenu: [
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
            ],
        },
        {
            role: 'window',
            submenu: [{ role: 'minimize' }, { role: 'close' }],
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        require('electron').shell.openExternal(
                            'https://electron.atom.io',
                        );
                    },
                },
            ],
        },
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'Twilight',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        });
        template[1].submenu.push(
            { type: 'separator' },
            {
                label: 'Speech',
                submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
            },
        );
        template[3].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' },
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    return menu;
};

export default init;
