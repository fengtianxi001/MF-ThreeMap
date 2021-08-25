import { Buffer } from "buffer"
import ndarray from "ndarray"

function getPixels(url, type, cb) {
	if (!cb) {
		cb = type
		type = ''
	}
	if (Buffer.isBuffer(url)) {
		url = 'data:' + type + ';base64,' + url.toString('base64')
	}
	defaultImage(url, cb)
}
//把图片绘制到canvas然后进行像素遍历
function defaultImage(url, cb) {
	const img = new Image()
	img.src = url
	img.crossOrigin = 'Anonymous'
	img.onload = () => {
		const canvas = document.createElement('canvas')
		canvas.width = img.width
		canvas.height = img.height
		const context = canvas.getContext('2d')
		context.drawImage(img, 0, 0)
		//pixels.data
		const pixels = context.getImageData(0, 0, img.width, img.height)
		const View3duint8 = ndarray(
			new Uint8Array(pixels.data),
			[img.width, img.height, 4],
			[4, 4 * img.width, 1],
			0
		)
		// console.log('View3duint8', View3duint8)
		cb(null, View3duint8)
	}
	img.onerror = function (err) {
		cb(err)
	}

}

export default getPixels
