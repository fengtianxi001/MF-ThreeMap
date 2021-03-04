<template>
	<div class="wrape">
		<t-renderer :size="size">
			<t-camera></t-camera>
			<t-scene></t-scene>
			<t-controls></t-controls>
			<t-light></t-light>
			<t-light type="HemisphereLight"></t-light>
			<!-- <t-raycaster></t-raycaster> -->
			<t-map></t-map>
			<t-routers></t-routers>
			<TTurbine></TTurbine>
		</t-renderer>
	</div>
</template>
<script>
/*eslint-disable*/
import * as THREE from "three";
import TMap from "../components/Three_geo/TMap";
import TTurbine from "../components/Three_geo/TTurebine";
import TRouters from "../components/Three_geo/TRouters";
THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
export default {
	data() {
		return {
			size: {
				w: window.innerWidth,
				h: window.innerHeight,
			},
		};
	},
	components: {
		TMap,
		TTurbine,
		TRouters,
	},
};
</script>
<style lang="scss" scoped>
.wrape {
	width: 100vw;
	height: 100vh;
	background-color: #212121;
	overflow: hidden;
}
</style>
