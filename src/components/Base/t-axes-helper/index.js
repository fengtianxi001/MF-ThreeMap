import { AxesHelper } from 'three'
export default {
	name: 't-axes-helper',
	inject: ['global'],
	mounted() {
		var axesHelper = new AxesHelper(5000)
		this.global.scene.add(axesHelper)
	},
	render() {
		return null
	},
}
