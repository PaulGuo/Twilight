import { ipcRenderer } from 'electron';

const install = function(Vue) {
    Vue.prototype.$state = {
        get(key) {
            const value = ipcRenderer.sendSync('STATE:GET', key);
            return value;
        },
        set(key, value) {
            ipcRenderer.sendSync('STATE:SET', key, value);
        },
        clear(key) {
            this.set(key, null);
        },
    };
};

export default {
    install,
};
