import turfDestination from '@turf/destination'
import * as turfHelpers from '@turf/helpers'
import * as THREE from 'three'
class Utils {
	static createTurfPoint(ll) {
		//生成geojson
		return turfHelpers.point([ll[1], ll[0]])
	}
	static originRadiusToBbox(origin, radius) {
		const turfPoint = this.createTurfPoint(origin)
		//turfDestination =>
		//origin 原点
		//distance 原点距离
		//bearing 范围 -180 => 180

		const [w, n] = turfDestination(turfPoint, radius, -45, { units: 'kilometers' }).geometry.coordinates
		// console.log('test', turfDestination(turfPoint, radius, -45, { units: 'kilometers' }))
		const [e, s] = turfDestination(turfPoint, radius, 135, { units: 'kilometers' }).geometry.coordinates
		// console.log([w, s, e, n])
		return [w, s, e, n]
	}
	//返回最后生成的模型
	static createModel(objs, name) {
		const group = new THREE.Group()
		group.name = name
		for (let obj of objs) {
			group.add(obj)
		}
		return group
	}
}
export default Utils
