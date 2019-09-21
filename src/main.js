import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import TreeTable from 'vue-table-with-tree-grid'
Vue.use(ElementUI)

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')