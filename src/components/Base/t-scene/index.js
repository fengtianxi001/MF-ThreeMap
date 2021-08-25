import { Scene, Fog, Color } from 'three'
export default {
	name: 't-scene',
	inject: ['global'],
	mounted() {
		const scene = new Scene()
		scene.background = new Color(0xffffff)
		scene.fog = new Fog(0xffffff, 0.1, 300)
		this.global.scene = scene
	},
	render() {
		return null
	},
}
