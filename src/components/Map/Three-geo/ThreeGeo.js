/*eslint-disable*/
import Utils from './Utils'
import cover from '@mapbox/tile-cover'
import RgbModel from './Rgb'
class ThreeGeo {
	constructor(options) {
		this.constUnitsSide = options.constUnitsSide
		this.tokenMapbox = options.tokenMapbox
		this.useNodePixels = false
		this.apiVector = 'mapbox-terrain-vector'
		this.apiRgb = 'mapbox-terrain-rgb'
		this.apiSatellite = 'mapbox-satellite'
	}
	/*瓦片初始化入口*/
	async getTerrainRgb(origin, radius, zoom) {
		const callbacks = {
			onRgbDem: () => {},
			onSatelliteMat: () => {},
		}
		//rgbDem是最后模型的的children
		const { rgbDem } = await this.getTerrain(origin, radius, zoom, callbacks)
		return Utils.createModel(rgbDem, 'dem-rgb')
	}
	/*获取地形*/
	getTerrain(origin, radius, zoom, callbacks = {}) {
		return new Promise((res, rej) => {
			//监听瓦片和高程是否加载完成
			const watcher = ThreeGeo._createWatcher(callbacks, res)
			if (!watcher) return
			//一些地形常量的配置
			const { tokenMapbox: token, useNodePixels, apiRgb, apiSatellite, constUnitsSide } = this
			const unitsPerMeter = constUnitsSide / (radius * Math.pow(2, 0.5) * 1000)
			const projectCoord = (coord, nw, se) => {
				return ThreeGeo._projectCoord(constUnitsSide, coord, nw, se)
			}
			const { onRgbDem, onSatelliteMat } = callbacks
			//边界的经纬度 => geojson => Polygon
			const bbox = ThreeGeo.getBbox(origin, radius)
			//用边界去获取tiles编号 => List([[16, 54582, 27792]])
			const zpCovered = ThreeGeo.getZoomposCovered(bbox.feature, zoom)
			// console.log("zpCovered", zpCovered);
			//用tiles编号去请求对应的图片资源
			new RgbModel({
				unitsPerMeter,
				projectCoord,
				token,
				useNodePixels,
				apiRgb,
				apiSatellite,
				onRgbDem,
				onSatelliteMat,
				watcher,
			}).fetch(zpCovered, bbox)
		})
	}
	static _createWatcher(cbs, res) {
		let isVecPending = cbs.onVectorDem ? true : false //default: false
		let isRgbPending = cbs.onRgbDem ? true : false //default: false
		const ret = { vectorDem: [], rgbDem: [] }

		const isDone = () => !isVecPending && !isRgbPending

		if (isDone()) {
			// console.log('no callbacks are set')
			res(ret)
			return null
		}

		return payload => {
			// console.log('payload:', payload);
			const { what, data } = payload
			if (what === 'dem-vec') {
				isVecPending = false
				ret.vectorDem = data
			}
			if (what === 'dem-rgb') {
				isRgbPending = false
				ret.rgbDem = data
			}
			if (isDone()) {
				// console.log('all callbacks are complete')
				res(ret)
			}
		}
	}

	//

	static _projectCoord(unitsSide, coord, nw, se) {
		// lng, lat -> px, py
		return [unitsSide * (-0.5 + (coord[0] - nw[0]) / (se[0] - nw[0])), unitsSide * (-0.5 - (coord[1] - se[1]) / (se[1] - nw[1]))]
	}

	//计算边界
	static getBbox(origin, radius) {
		const testPolygon = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Polygon',
						coordinates: [[]],
					},
				},
			],
		}
		const polygon = testPolygon.features[0]
		const [w, s, e, n] = Utils.originRadiusToBbox(origin, radius)
		const nw = [w, n],
			se = [e, s]
		polygon.geometry.coordinates[0] = [nw, [se[0], nw[1]], se, [nw[0], se[1]], nw]
		// console.log('testPolygon:', testPolygon);
		return {
			feature: polygon,
			northWest: nw,
			southEast: se,
		}
	}
	// 生成最小数量的图块以覆盖GeoJSON Geometry。
	static getZoomposCovered(polygon, zoom) {
		// isochrone polygon
		// https://www.mapbox.com/vector-tiles/mapbox-terrain/#contour
		// Zoom level  Contour Interval
		// 9  500 meters
		// 10  200 meters
		// 11  100 meters
		// 12  50 meters
		// 13  20 meters
		// 14+  10 meters
		let limits = {
			min_zoom: zoom,
			max_zoom: zoom,
		}
		return cover
			.tiles(polygon.geometry, limits) // poszoom
			.map(([x, y, z]) => [z, x, y]) // zoompos now!!
	}
	getProjection(origin, radius, unitsSide = this.constUnitsSide) {
		const wsen = Utils.originRadiusToBbox(origin, radius)
		// console.log('origin:', origin);
		// console.log('wsen:', wsen);
		// const _unitsPerMeter = ThreeGeo._getUnitsPerMeter(unitsSide, radius)
		return {
			proj: (
				latlng,
				meshes = undefined // `meshes`: rgbDem
			) => ThreeGeo._proj(latlng, meshes, wsen, unitsSide),
		}
	}
	static _proj(ll, meshes, wsen, unitsSide) {
		const [lat, lng] = ll
		const [w, s, e, n] = wsen

		// [x, y, z]: terrain coordinates
		const [x, y] = this._projectCoord(unitsSide, [lng, lat], [w, n], [e, s])

		// WIP (undocumented API): Resolve `z` (elevation) in case
		//   the optional `meshes` is provided.
		const z = meshes
			? Elevation.resolveElevation(x, y, lat, lng, meshes) // 'maybe' `undefined`
			: undefined

		return z !== undefined ? [x, y, z] : [x, y]
	}
}
export default ThreeGeo
