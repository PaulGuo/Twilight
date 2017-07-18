import Vue from 'vue';

import App from './app';
import router from './router';
import store from './store';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

import vueElectron from 'vue-electron';

Vue.config.productionTip = false;

Vue.use(vueElectron);
Vue.use(ElementUI);

const app = new Vue({
    components: { App },
    router,
    store,
    render(h) {
        return h('App');
    }
});
app.$mount('#app');
