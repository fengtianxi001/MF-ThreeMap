/*eslint-disable*/
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home/index.vue'
import path from 'path'

//自动导入
const contexts = require.context('@/views', true, /\index.vue$/);
// let moudels = []
const moudels = contexts.keys().reduce((prev, key) => {
	const moduleName = path.dirname(key).split("./")[1]
	prev.push({
		path: "/" + moduleName,
		name: moduleName,
		component: () => import(`@/views/${moduleName}/`)
	})
	return prev
}, [])


Vue.use(VueRouter)

const routes = [
	{
		path: "/",
		redirect: {
			name: "Home"
		}
	},
	...moudels
]
const router = new VueRouter({
	mode: 'hash',
	base: process.env.BASE_URL,
	routes
})

export default router
