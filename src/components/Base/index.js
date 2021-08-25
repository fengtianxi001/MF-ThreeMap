const contexts = require.context('./', true, /index.js$/)
const base_compoents = contexts.keys().reduce((prev, key) => {
	const component = contexts(key).default
	if (component) prev[component.name] = component
	return prev
}, {})
export default {
	install: Vue => {
		Object.keys(base_compoents).forEach(key => {
			Vue.component(key, base_compoents[key])
		})
	},
}
