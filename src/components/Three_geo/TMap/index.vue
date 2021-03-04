<script>
import { threeGeo, mapbus } from "./threeGeo";
// import config from "./config"
export default {
	name: "TMap",
	inject: ["global"],
	async mounted() {
		// const parent = this.$parent.$refs.container;
		const domsize = {
			w: window.innerWidth,
			h: window.innerHeight
		};
		await threeGeo(domsize).then((terrain) => {
            window.terrain = terrain
			this.global.scene.add(terrain);
		});
		mapbus.$emit("mapCompleted");
	},
	render() {
		return null;
	},
};
</script>
