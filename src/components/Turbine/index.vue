<template>
	<div></div>
</template>
<script>
import MLoader from './m-loader'
import { turbineCoords } from '../../mock/index'
import { Group, AnimationMixer, AnimationClip } from 'three'
export default {
	name: 't-turbine',
	inject: ['global'],
	data() {
		return {
			matrix: null,
			turbines: new Map(),
			group: new Group(),
		}
	},
	methods: {
		async loader() {
			const glb = await MLoader('/model/turbine.glb')
			const mesh = glb.scene
			let scale = 0.02 * 1
			mesh.scale.set(scale, scale, scale)
			mesh.rotateX(Math.PI / 2)
			mesh.rotateY(-Math.PI / 2)
			this.matrix = glb
			this.clone()
		},
		clone() {
			turbineCoords.map((cur, index) => {
				const { matrix, group, animation,global } = this
				const [x, y, z] = cur
				const turbine = matrix.scene.clone()
				turbine.position.set(x, y, z)
				turbine.name = index + '号风机'
				this.turbines.set(index, turbine)
				group.add(turbine)
                global.scene.add(turbine)
				animation(index)
			})
		},
		animation(id, name = 'slow') {
			const { turbines, matrix } = this
			const turbine = turbines.get(id)
			if (!turbine) return false
			const animations = matrix.animations
			const mixer = new AnimationMixer(turbine)
			const clip = AnimationClip.findByName(animations, name)
			if (clip) {
				const action = mixer.clipAction(clip)
				action.play()
				return this.global.mixers.set(id, mixer)
			}
			return this.global.mixers.delete(id)
		},
	},
	mounted() {
        this.loader()
	},
}
</script>
<style lang="scss" scoped></style>
