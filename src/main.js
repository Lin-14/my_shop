import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
//引入全局样式
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入树形表格插件
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器和样式
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//拦截器挂载token值
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

Vue.use(VueQuillEditor)

//处理时间过滤器
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal * 1000)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 +'').padStart(2, '0')
  const d = (dt.getDate() +'').padStart(2, '0')
  const hh = (dt.getHours() +'').padStart(2, '0')
  const mm = (dt.getMinutes() +'').padStart(2, '0')
  const ss = (dt.getSeconds() +'').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
