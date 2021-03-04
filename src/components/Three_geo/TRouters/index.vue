<script>
import * as THREE from "three";
import { mapbus } from "../TMap/threeGeo";
import routers from "./mock/data";
export default {
    name: "TRouter",
    inject: ["global"],
    methods: {
        createLine() {
            let texture = new THREE.TextureLoader().load(
                require("../../../assets/images/line.png")
            );
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping; //每个都重复
            texture.repeat.set(1, 1);
            texture.needsUpdate = true;
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                transparent: true
            });
            routers.forEach(router => {
                const points = router.reduce((prev, cur) => {
                    const vector3 = new THREE.Vector3(
                        cur.x,
                        cur.y,
                        cur.z + 0.002
                    );
                    prev.push(vector3);
                    return prev;
                }, []);
                let curve = new THREE.CatmullRomCurve3(points); // 曲线路径
                let tubeGeometry = new THREE.TubeGeometry(curve, 1000, 0.001);
                let mesh = new THREE.Mesh(tubeGeometry, material);
                this.global.scene.add(mesh);
                this.global.texture = texture;
            });
        }
    },
    mounted() {
        mapbus.$on("mapCompleted", () => {
            this.createLine();
        });
    },
    render() {
        return null;
    }
};
</script>