<script>
import {PerspectiveCamera} from "three"
export default {
    name: "TCamera",
    inject: ["global"],
    mounted(){
        const camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.set(0, -1, 1);
        camera.name = "camera"
        this.global.camera = camera
    },
    render(){
        return null
    }
}
</script>