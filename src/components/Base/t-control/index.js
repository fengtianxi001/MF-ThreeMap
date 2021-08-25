import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
export default {
	name: 't-control',
	inject: ['global'],
	mounted() {
		const { camera, CSSRender } = this.global
		let controls = new OrbitControls(camera, CSSRender.domElement)
		// controls.minDistance = 0.2
		// controls.maxDistance = 2.0
		// controls.maxPolarAngle = Math.PI / 2.5
		this.global.controls = controls
	},
	render() {
		return null
	},
}
