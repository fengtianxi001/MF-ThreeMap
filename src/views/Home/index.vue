<template>
	<div id="home">
		<div class="loading" v-show="loading">
			资源加载中,请耐心等待...
		</div>
		<t-renderer :size="size">
			<t-camera></t-camera>
			<t-scene></t-scene>
			<t-control></t-control>
			<t-light></t-light>
			<!-- <t-axes-helper></t-axes-helper> -->
			<t-map @loaded="loaded"></t-map>
			<t-turbine></t-turbine>
			<!-- <t-label></t-label> -->
			<t-routers></t-routers>
		</t-renderer>
	</div>
</template>
<script>
import * as THREE from 'three'
THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)
export default {
	name: 'Home',
	data() {
		return {
			size: {
				w: window.innerWidth,
				h: window.innerHeight,
			},
			loading: true,
		}
	},
	methods: {
		loaded() {
			this.loading = false
		},
	},
}
</script>
<style lang="scss" scoped>
.loading {
	width: 100vw;
	height: 100vh;
	background-color: rgba(#000000, 0.5);
	position: fixed;
	top: 0;
	left: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
	color: #fff;
	background-image: url('../../../screenshot/4.png');
	backdrop-filter: blur(4px);
}
#home {
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background-size: contain;
}
</style>
