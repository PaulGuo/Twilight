import { get, set } from 'lodash';

const install = function(Vue) {
    Vue.prototype.$state = {
        _state: {},
        get(key) {
            return get(this._state, key);
        },
        set(key, value) {
            return set(this._state, key, value);
        }
    };
};

export default {
    install
};
