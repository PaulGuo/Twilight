import { ipcRenderer } from 'electron';

const install = function(Vue) {
    Vue.prototype.$state = {
        get(key) {
            return ipcRenderer.sendSync('STATE:GET', key);
        },
        set(key, value) {
            ipcRenderer.sendSync('STATE:SET', key, value);
        }
    };
};

export default {
    install
};
