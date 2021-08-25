import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import global from './components/Global/index'
import base from './components/Base/index'
import TMap from './components/Map/index'
import TTurbine from './components/Turbine/index.vue'
import TLabel from './components/Label/index'
import TRouters from './components/Routers/index'
import "./assets/styles/global.css"
Vue.component('t-map', TMap)
Vue.component('t-turbine', TTurbine)
Vue.component('t-label', TLabel)
Vue.component('t-routers', TRouters)



Vue.use(global)
Vue.use(base)

Vue.config.productionTip = false
new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')
