<template>
    <div></div>
</template>
<script>
import * as THREE from "three";
export default {
    name: "TLight",
    props: {
        type: {
           type: String,
           default: "DirectionalLight"
        }
    },
    inject: ["global"],
    mounted(){
        let light 
        if(this.type === "DirectionalLight"){
            light = new THREE.DirectionalLight(0xffffff, 2)
        }else{
            light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7);
        }
        this.global.scene.add(light)
    }
}
</script>
<style lang='scss' scoped>

</style>