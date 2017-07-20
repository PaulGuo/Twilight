import { ipcMain } from 'electron';
import { get, set } from 'lodash';

const init = () => {
    const state = {};

    ipcMain.on('STATE:GET', (event, key) => {
        const value = get(state, key, null);
        event.returnValue = value;
    });

    ipcMain.on('STATE:SET', (event, key, value) => {
        set(state, key, value);
        event.returnValue = null;
    });
};

export default init;
