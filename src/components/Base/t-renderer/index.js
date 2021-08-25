import { WebGLRenderer, Clock } from 'three'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

export default {
	name: 't-renderer',
	provide() {
		return {
			global: this.global,
		}
	},
	data() {
		let renderer = new WebGLRenderer({ antialias: true, alpha: true })
		renderer.shadowMap.enabled = true
		renderer.setSize(window.innerWidth, window.innerHeight)
		return {
			renderer,
			global: {
				render: renderer,
				rendererSize: this.size,
				rendererDom: renderer.domElement,
				scene: null,
				camera: null,
				mixers: new Map(),
				compose: null,
				CSSRender: new CSS2DRenderer(),
			},
			clock: new Clock(),
		}
	},
	methods: {
		render() {
			const {
				scene,
				camera,
				stats,
				compose,
				CSSRender,
				texture,
			} = this.global
			if (scene && camera) {
				this.renderer.render(scene, camera)
				CSSRender.render(scene, camera)
			}
			if (texture) {
				texture.offset.x += 0.01
			}
			stats && stats.update()
			compose && compose.render()
			requestAnimationFrame(this.render)
			const mixerUpdateDelta = this.clock.getDelta()
			this.global.mixers.forEach(mixer => {
				mixer.update(mixerUpdateDelta)
			})
		},
	},
	mounted() {
		const { CSSRender } = this.global
		CSSRender.setSize(window.innerWidth, window.innerHeight)
		CSSRender.domElement.style.position = 'absolute'
		CSSRender.domElement.style.top = 0
		this.$parent.$el.appendChild(CSSRender.domElement)
		this.$parent.$el.appendChild(this.renderer.domElement)
		this.render()
	},
	render() {
		return <div class='tree-container'>{this.$slots.default}</div>
	},
}
