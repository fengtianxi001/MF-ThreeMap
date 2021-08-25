import ThreeGeo from './Three-geo/ThreeGeo'
// import demo from './mock'
// import * as THREE from 'three'
export default {
	name: 't-map',
	inject: ['global'],
	async mounted() {
		const tgeo = new ThreeGeo({
			unitsSide: 100,
			constUnitsSide: 700,
		})

		const terrain = await tgeo.getTerrainRgb(
			[26.342523, 119.840262],
			75,
			12
		)
		this.global.scene.add(terrain)
		this.$emit("loaded")
	},
	render() {
		return null
	},
}
/*
let virtualCamera = null
function createData(tgeo, terrain) {
	if (!virtualCamera) {
		const fov = 30,
			aspect = window.innerWidth / window.innerHeight,
			near = 0.1,
			far = 500000
		virtualCamera = new THREE.PerspectiveCamera(fov, aspect, near, far)
	}
	const { proj } = tgeo.getProjection([26.342523, 119.840262], 75)
	const arr = demo.map(cur => {
		return transfromCoordinates(proj(cur), terrain)
	})
	document.write(JSON.stringify(arr))
}
function transfromCoordinates(coordinates, terrain) {
	const { x, y } = new THREE.Vector2(...coordinates)
	const raycaster = new THREE.Raycaster()
	virtualCamera.position.set(x, y, 10)
	virtualCamera.lookAt(x, y, 0)
	const { screenX, screenY } = worldToScreen(virtualCamera)
	const screenPoint = new THREE.Vector2(screenX, screenY)
	raycaster.setFromCamera(screenPoint, virtualCamera)
	const res = raycaster.intersectObjects(terrain.children, true)
	const z = res[0].point.z
	return [x,y,z]
}

function worldToScreen(camera) {
	var world = new THREE.Vector3(0, 0, 1)
	let vector = world.project(camera)
	let halfWidth = window.innerWidth / 2,
		halfHeight = window.innerHeight / 2
	return {
		x: Math.round(vector.x * halfWidth + halfWidth),
		y: Math.round(-vector.y * halfHeight + halfHeight),
	}
}
*/