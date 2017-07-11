import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'upload-page',
      component: require('@/components/upload.page')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
