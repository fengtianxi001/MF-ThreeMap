import getPixelsDom from './dom-pixels.js'
class Fetch {
	//通过瓦片地图(jpg) => 高程地图(png)
	static getPngTilesArray(tilesArray) {
		const set = new Set()
		return tilesArray.reduce((prev, cur) => {
			const [zoom, x, y] = cur
			const temp = [zoom - 2, Math.floor(x / 4), Math.floor(y / 4)]
			const key = temp + ''
			!set.has(key) && set.add(key) && prev.push(temp)
			return prev
		}, [])
	}
	//通过地图编号获取资源(PNG,JPG)
	static fetchTile(tilesNumber, api, token, useNodePixels, cb) {
		let isMapbox = api.startsWith('mapbox-')
		let isLocal = true // 是否加载本地资源
		let uri = null
		if (isLocal) {
			uri = api === 'mapbox-terrain-rgb' ?
				require(`../../../assets/data/terrain-rgb/${tilesNumber.join('/')}.png`)
				: require(`../../../assets/data/tiles/${tilesNumber.join('/')}.jpg`)
		} else {
			uri = isMapbox ?
				this.getUriMapbox(token, api, tilesNumber)
				: this.getUriCustom(api, tilesNumber)
		}
		//校验是否是有效的api格式
		const availableAPI = api.includes('mapbox-terrain-rgb')
			|| api.includes('mapbox-satellite')
			|| api.includes('custom-terrain-rgb')
			|| api.includes('custom-satellite')
		if (availableAPI) {
			const callback = (err, pixels) => cb(err ? null : pixels)
			getPixelsDom(uri, callback)
		} else {
			console.log('api格式错误', api)
		}
	}
	//区别PNG和JPG的Mapbox请求地址
	static getUriMapbox(token, api, zoompos) {
		let prefix,
			res = ''
		switch (api) {
			case 'mapbox-terrain-vector':
				prefix = 'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2'
				res = '.vector.pbf'
				break
			case 'mapbox-terrain-rgb':
				prefix = 'https://api.mapbox.com/v4/mapbox.terrain-rgb'
				res = '@2x.pngraw'
				break
			case 'mapbox-satellite':
				prefix = 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles'
				break
			default:
				console.log('getUriMapbox(): unsupported api:', api)
				return ''
		}
		return `${prefix}/${zoompos.join('/')}${res}?access_token=${token}`
	}
}
export default Fetch
