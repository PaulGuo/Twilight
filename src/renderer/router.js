import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'upload-page',
            component: require('@renderer/views/Upload.vue')
        },
        {
            path: '/upload-progress',
            name: 'upload-progress',
            component: require('@renderer/views/UploadProgress.vue')
        },
        {
            path: '/choose-frames',
            name: 'choose-frames',
            component: require('@renderer/views/ChooseFrames.vue')
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});
