import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'upload-page',
            component: require('@renderer/views/Upload.vue'),
        },
        {
            path: '/choose-frames',
            name: 'choose-frames',
            component: require('@renderer/views/choose-frames/index.vue'),
        },
        {
            path: '/analyse-result',
            name: 'analyse-result',
            component: require('@renderer/views/analyse-result/index.vue'),
        },
        {
            path: '*',
            redirect: '/',
        },
    ],
});
