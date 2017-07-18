import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'upload-page',
            component: require('@/components/upload.page')
        },
        {
            path: '/upload-progress',
            name: 'upload-progress',
            component: require('@/components/upload-progress.page')
        },
        {
            path: '/choose-frames',
            name: 'choose-frames',
            component: require('@/components/choose-frames.page')
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});
