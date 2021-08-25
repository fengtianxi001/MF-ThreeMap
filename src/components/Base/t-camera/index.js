import { PerspectiveCamera } from 'three'
export default {
	name: 't-camera',
	inject: ['global'],
	mounted() {
		const fov = 30,
			aspect = window.innerWidth / window.innerHeight,
			near = 0.1,
			far = 500000

		const camera = new PerspectiveCamera(fov, aspect, near, far)
		camera.position.set(60, 0, 20)
		camera.name = 'camera'
		this.global.camera = camera
	},
	render() {
		return null
	},
}
