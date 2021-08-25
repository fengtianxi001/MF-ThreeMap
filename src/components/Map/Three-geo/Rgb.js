/*eslint-disable*/
import Fetch from './Fetch'
import SphericalMercator from '@mapbox/sphericalmercator'
import * as THREE from 'three'
const sixteenthPixelRanges = (() => {
	let cols = 512
	let rows = 512
	let scaleFactor = 4
	let ranges = []
	for (let c = 0; c < scaleFactor; c++) {
		for (let r = 0; r < scaleFactor; r++) {
			ranges.push([
				[r * (rows / scaleFactor - 1) + r, ((r + 1) * rows) / scaleFactor],
				[c * (cols / scaleFactor - 1) + c, ((c + 1) * cols) / scaleFactor],
			])
		}
	}
	return ranges
})()
const constVertices = 128
const constTilePixels = new SphericalMercator({ size: 128 })
const computeSeamRows = shift => {
	let totalCount = 49152 // 128 * 128 * 3
	let rowCount = 384 // 128 * 3
	let rows = [[], [], [], []]
	for (let c = 0; c < rowCount; c += 3) {
		// 0, 1, 2, 3; north, west, south, east; +y, -x, -y, +x
		rows[0].push(c + 1 + shift)
		rows[1].push((c / 3) * rowCount + 1 + shift)
		rows[2].push(c + 1 + totalCount - rowCount + shift)
		rows[3].push((c / 3 + 1) * rowCount - 2 + shift)
	}
	return rows
}
const constSeamRows = computeSeamRows(1)
class RgbModel {
	constructor(params) {
		//静态参数
		this.unitsPerMeter = params.unitsPerMeter
		this.projectCoord = params.projectCoord
		this.token = params.token
		this.useNodePixels = params.useNodePixels
		this.apiRgb = params.apiRgb
		this.apiSatellite = params.apiSatellite

		//一些回调函数
		this.onRgbDem = params.onRgbDem
		this.onSatelliteMat = params.onSatelliteMat
		this.watcher = params.watcher

		// state variables
		this.dataEleCovered = []
	}
	fetch(tilesArray, bbox) {
		//获取高程图片的编号
		const pngtilesArray = Fetch.getPngTilesArray(tilesArray)
		let count = 0
		//遍历数组请求资源
		pngtilesArray.forEach(pngtile => {
			const { apiRgb, token, useNodePixels } = this
			//这个callback里的tile => dom.pixels => View3duint8
			const callback = tile => {
				count++
				tile && this.addTile(tile, pngtile, tilesArray, bbox)
				count === pngtilesArray.length && this.build()
			}
			Fetch.fetchTile(pngtile, apiRgb, token, useNodePixels, callback)
		})
	}
	addTile(pixels, zoomposEle, zpCovered, bbox) {
		const { unitsPerMeter, projectCoord } = this
		let elevations = calcElevations()
		//根据PNG像素点的rbg计算高度
		function calcElevations(params) {
			let _elevations = []
			if (pixels) {
				let R, G, B
				for (let e = 0; e < pixels.data.length; e += 4) {
					R = pixels.data[e]
					G = pixels.data[e + 1]
					B = pixels.data[e + 2]
					_elevations.push(-10000 + (R * 256 * 256 + G * 256 + B) * 0.1)
				}
			} else {
				_elevations = new Array(262144).fill(0) // 512 * 512 (=1/4 MB)
			}
			return _elevations
		}
		let sixteenths = calcSixteenths()
		//根据PNG反推出对应的JPG编号
		//expect ["16/54580/27792", "16/54580/27793"]
		function calcSixteenths() {
			let _sixteenths = []
			for (let col = 0; col < 4; col++) {
				for (let row = 0; row < 4; row++) {
					const temp = [zoomposEle[0] + 2, zoomposEle[1] * 4 + col, zoomposEle[2] * 4 + row]
					_sixteenths.push(temp.join('/'))
				}
			}
			return _sixteenths
		}
		let zpCoveredStr = zpCovered.map(zp => {
			return zp.join('/')
		})
		const dataEle = calcDataEle()
		function calcDataEle() {
			let _dataEle = []
			sixteenths.forEach((zoomposStr, index) => {
				//不在最小瓦片数量中的剔除
				if (!zpCoveredStr.includes(zoomposStr)) return false

				let zoompos = zoomposStr.split('/').map(str => parseInt(str))
				// console.log("zoompos", zoompos);
				let pxRange = sixteenthPixelRanges[index]
				let elev = []

				for (let r = pxRange[0][0]; r < pxRange[0][1]; r++) {
					for (let c = pxRange[1][0]; c < pxRange[1][1]; c++) {
						elev.push(elevations[r * 512 + c])
					}
				}
				//console.log('elev:', elev); // 16384 = 128 * 128 elements

				let array = []
				let dataIndex = 0
				for (let row = 0; row < constVertices; row++) {
					for (let col = 0; col < constVertices; col++) {
						let lonlatPixel = constTilePixels.ll([zoompos[1] * 128 + col, zoompos[2] * 128 + row], zoompos[0])
						// console.log('lonlatPixel:', lonlatPixel);
						// NOTE: do use shift = 1 for computeSeamRows()
						array.push(...projectCoord(lonlatPixel, bbox.northWest, bbox.southEast), elev[dataIndex] * unitsPerMeter)
						dataIndex++
					}
				}
				// console.log('zoompos, array:', zoompos, array); // 49152 = 128*128*3 elements
				_dataEle.push([zoompos, array, zoomposEle])
			})
			return _dataEle
		}
		this.dataEleCovered = this.dataEleCovered.concat(dataEle)
	}
	build() {
		// 生成模型
		if (this.dataEleCovered.length === 0) {
			const meshes = []
			this.onRgbDem(meshes)
			this.watcher({ what: 'dem-rgb', data: meshes })
			return
		}
		let onSatelliteMatWrapper = null
		if (this.onSatelliteMat) {
			let countSat = 0
			onSatelliteMatWrapper = (mesh, meshesAcc) => {
				countSat++
				this.onSatelliteMat(mesh)
				if (countSat === this.dataEleCovered.length) {
					this.watcher({ what: 'dem-rgb', data: meshesAcc })
				}
			}
		}
		const { dataEleCovered, apiSatellite, token, useNodePixels } = this
		//模型的children
		const meshes = RgbModel._build(
			dataEleCovered,
			apiSatellite,
			token,
			useNodePixels,
			onSatelliteMatWrapper
		)
		this.onRgbDem(meshes) // legacy API
		!onSatelliteMatWrapper && this.watcher({ what: 'dem-rgb', data: meshes })
	}
	static _build(dataEle, apiSatellite, token, useNodePixels, onSatelliteMatWrapper) {
		// console.log('apiSatellite:', apiSatellite)

		// dataEle should be sorted so that .resolveSeams() is applied
		// in the proper order, or the results will have broken stripes
		// due to _stitchWithNei3()
		dataEle.sort((zp1, zp2) => (zp1[0].join('/') > zp2[0].join('/') ? 1 : -1))
		const dataEleIds = {}
		dataEle.forEach((data, idx) => {
			dataEleIds[data[0].join('/')] = idx
		})
		// console.log('dataEleIds:', dataEleIds);

		const objs = []
		dataEle.forEach(([zoompos, arr, zoomposEle]) => {
			// console.log(zoompos, arr); // a 16th of zoomposEle
			if (arr.length !== constVertices * constVertices * 3) return false
			const getNeighborsInfo = this.getNeighborsInfo(dataEle, dataEleIds, zoompos)
			let cSegments = this.resolveSeams(arr, getNeighborsInfo)
			//创建一个平面
			let geom = new THREE.PlaneBufferGeometry(1, 1, cSegments[0], cSegments[1])
			geom.attributes.position.array = new Float32Array(arr)
			// console.log(geom);
			//--------
			// test identifying a 127x1 "belt"
			// let geom = new THREE.PlaneBufferGeometry(1, 1, 127, 1);
			// let arrBelt = arr;
			// arrBelt.length = 128*2*3;
			// geom.attributes.position.array = new Float32Array(arrBelt);

			let plane = new THREE.Mesh(
				geom,
				new THREE.MeshBasicMaterial({
					wireframe: true,
					color: 0xcccccc,
				})
			)
			plane.name = `satellite/${zoompos.join('/')}`
			const _toTile = zp => [zp[1], zp[2], zp[0]]
			plane.userData.threeGeo = {
				tile: _toTile(zoompos),
				srcDem: {
					tile: _toTile(zoomposEle),
					uri: Fetch.getUriMapbox(token, 'mapbox-terrain-rgb', zoomposEle),
				},
			}
			objs.push(plane)

			this.resolveTex(zoompos, apiSatellite, token, useNodePixels, tex => {
				if (tex) {
					plane.material = new THREE.MeshBasicMaterial({
						side: THREE.FrontSide,
						// side: THREE.DoubleSide,
						map: tex,
					})
				}
				if (onSatelliteMatWrapper) {
					onSatelliteMatWrapper(plane, objs) // legacy API
				}
			})
		})
		return objs
	}
	static getNeighborsInfo(dataEle, dataEleIds, zoompos) {
		const infoNei = {}
		this.getNeighbors8(zoompos).forEach((zoomposNei, idxNei) => {
			const id = zoomposNei.join('/')
			if (id in dataEleIds) {
				const arrayNei = dataEle[dataEleIds[id]][1]
				infoNei[idxNei] = arrayNei
			}
		})
		return infoNei
	}
	static getNeighbors8(zoompos) {
		// 8-neighbors:
		// 4 0 7
		// 1 + 3
		// 5 2 6
		//--------
		// 0, 1, 2, 3: north, west, south, east; +y, -x, -y, +x
		// 4, 5, 6, 7: diagonal neighbors
		const zoomposNeighborsDiff = [
			[0, 0, -1],
			[0, -1, 0],
			[0, 0, 1],
			[0, 1, 0],
			[0, -1, -1],
			[0, -1, 1],
			[0, 1, 1],
			[0, 1, -1],
		]
		const neighbors = []
		zoomposNeighborsDiff.forEach(zoomposDiff => {
			const zoomposNei = zoomposDiff.map((coord, idxCoord) => coord + zoompos[idxCoord])
			// console.log('8-neighbor candidate:', zoomposNei);
			neighbors.push(zoomposNei)
		})
		return neighbors
	}
	static _stitchWithNei2(array, arrayNei) {
		// add a new south row
		for (let i = 0; i < constVertices; i++) {
			let indexZ = constSeamRows[2][i] + constVertices * 3 // new south row
			let indexZNei = constSeamRows[0][i] // north row to copy
			array[indexZ - 2] = arrayNei[indexZNei - 2] // a new x
			array[indexZ - 1] = arrayNei[indexZNei - 1] // a new y
			array[indexZ] = arrayNei[indexZNei] // a new z
		}
	}
	static _stitchWithNei3(array, arrayNei) {
		// add a new east col
		for (let i = 0; i < constVertices; i++) {
			let indexZ = constSeamRows[3][i] + (1 + i) * 3 // new east col
			let indexZNei = constSeamRows[1][i] // west col to copy
			// https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index
			// arr = [0,1,2,3]
			// arr.splice(2, 0, 99)
			// arr
			// (5) [0, 1, 99, 2, 3]
			array.splice(indexZ - 2, 0, arrayNei[indexZNei - 2])
			array.splice(indexZ - 1, 0, arrayNei[indexZNei - 1])
			array.splice(indexZ, 0, arrayNei[indexZNei])
		}
	}
	static resolveSeams(array, infoNei) {
		// console.log('infoNei:', infoNei);
		let cSegments = [constVertices - 1, constVertices - 1]

		Object.entries(infoNei).forEach(([idxNei, arrayNei]) => {
			if (idxNei === '2') {
				// console.log('now _stitchWithNei2()...');
				this._stitchWithNei2(array, arrayNei)
				cSegments[1]++
			} else if (idxNei === '3') {
				// console.log('now _stitchWithNei3()...');
				this._stitchWithNei3(array, arrayNei)
				cSegments[0]++
			}
		})

		if (cSegments[0] === constVertices && cSegments[1] === constVertices) {
			// Both _stitchWithNei2() and _stitchWithNei3() were
			// applided to this array.  Need filling a diagonal pothole.
			// console.log('filling a pothole...');
			let arrayNei6 = infoNei['6']
			if (arrayNei6) {
				array.push(arrayNei6[0], arrayNei6[1], arrayNei6[2])
			} else {
				// filling with a degenerated triangle
				let len = array.length
				array.push(array[len - 3], array[len - 2], array[len - 1])
			}
		}
		return cSegments
	}
	static createDataFlipY(data, shape) {
		const [w, h, size] = shape
		const out = new Uint8Array(data.length)
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w * size; x += size) {
				for (let i = 0; i < size; i++) {
					out[(h - 1 - y) * w * size + x + i] = data[y * w * size + x + i]
				}
			}
		}
		return out
	}
	static resolveTex(zoompos, apiSatellite, token, useNodePixels, onTex) {
		Fetch.fetchTile(zoompos, apiSatellite, token, useNodePixels, pixels => {
			let tex = null
			if (pixels) {
				// console.log("satellite pixels", pixels.shape.slice(0));
				// console.log('satellite pixels:', pixels);
				// https://threejs.org/docs/#api/textures/DataTexture

				//==== On Firefox, calling it with y-flip causes the warning: "Error: WebGL warning: texImage2D: Alpha-premult and y-flip are deprecated for non-DOM-Element uploads."
				// tex = new THREE.DataTexture(pixels.data,
				//     pixels.shape[0], pixels.shape[1], THREE.RGBAFormat);
				// tex.flipY = true;
				//==== workaround: do manual y-flip
				tex = new THREE.DataTexture(this.createDataFlipY(pixels.data, pixels.shape), pixels.shape[0], pixels.shape[1], THREE.RGBAFormat)

				tex.needsUpdate = true
			} else {
				// console.log(`fetchTile() failed for tex of zp: ${zoompos}`)
			}

			if (onTex) {
				onTex(tex)
			}
		})
	}
}
export default RgbModel
