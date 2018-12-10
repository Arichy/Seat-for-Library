import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker.js';

Vue.config.productionTip = false

import 'element-ui/lib/theme-chalk/index.css';
import './plugins/element.js';

// 引入移动端的弹窗
import 'mint-ui/lib/style.css'
import { MessageBox as Mint_MessageBox } from 'mint-ui';


function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
  }
  return flag;
}

// 更改移动端的alert
if (!IsPC()) {
  Vue.prototype.$alert = Mint_MessageBox.alert;
}

import '@/assets/css/reset.css';

import axios from '@/assets/http/http.js';
import './plugins/element.js'
Vue.prototype.$http = axios;


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
