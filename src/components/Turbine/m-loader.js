import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

async function MLoader(url) {
	let loader = new GLTFLoader()
	const dracoLoader = new DRACOLoader()
	dracoLoader.setDecoderPath('/draco/')
	dracoLoader.preload()
	loader.setDRACOLoader(dracoLoader)
	return new Promise((resolve) => {
		loader.load(url, object => resolve(object))
	})
}

export default MLoader
