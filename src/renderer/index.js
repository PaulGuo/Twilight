import Vue from 'vue';

import VueElectron from 'vue-electron';

import './base.css';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

import router from './router.js';
import State from './state.js';

Vue.config.productionTip = false;

Vue.use(VueElectron);
Vue.use(ElementUI);
Vue.use(State);

const app = new Vue({
    router,
    render(h) {
        return h('router-view');
    }
});

app.$mount('#app');
