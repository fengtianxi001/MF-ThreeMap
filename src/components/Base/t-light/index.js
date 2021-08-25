import { HemisphereLight, DirectionalLight } from 'three'
export default {
	name: 't-light',
	inject: ['global'],
	mounted() {
		const {
			global: { scene },
		} = this
		const hemiLight = new HemisphereLight(0xffffff, 0x444444)
		hemiLight.position.set(0, 100, 0)
		const dirLight = new DirectionalLight(0xffffff)
		dirLight.position.set(-0, 40, 50)
		dirLight.castShadow = true
		dirLight.shadow.camera.top = 50
		dirLight.shadow.camera.bottom = -25
		dirLight.shadow.camera.left = -25
		dirLight.shadow.camera.right = 25
		dirLight.shadow.camera.near = 0.1
		dirLight.shadow.camera.far = 200
		dirLight.shadow.mapSize.set(1024, 1024)
		scene.add(dirLight)
		scene.add(hemiLight)
	},
	render() {
		return null
	},
}
