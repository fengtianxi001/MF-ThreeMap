import { BoxGeometry, MeshLambertMaterial, Mesh } from 'three'
export default {
	name: 't-cube',
	inject: ['global'],
	mounted() {
		var geometry = new BoxGeometry(100, 100, 100)
		var meterial = new MeshLambertMaterial({ color: 0xff0000 })
		var mesh = new Mesh(geometry, meterial) //给立方体布上哑光材质
		console.log("inter");
		this.global.scene.add(mesh)
	},
	render() {
		return null
	},
}
