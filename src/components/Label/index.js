import { turbineCoords } from '../../mock/index'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
export default {
	name: 't-label',
	inject: ['global'],
	mounted() {
		turbineCoords.map((coord, index) => {
			const [x, y, z] = coord
			const div = document.createElement('div')
			div.id = index
			div.className = 'turbine-label normal'
			div.innerText = index
			let label = new CSS2DObject(div)
			label.position.set(x, y, z+0.5)
			this.global.scene.add(label)
		})
	},
}
