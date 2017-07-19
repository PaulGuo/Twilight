import { ipcMain } from 'electron';
import { get, set } from 'lodash';

const init = () => {
    const state = {};

    ipcMain.on('STATE:GET', (event, key) => {
        event.returnValue = get(state, key);
    });

    ipcMain.on('STATE:SET', (event, key, value) => {
        set(state, key, value);
        event.returnValue = null;
    });
};

export default init;
