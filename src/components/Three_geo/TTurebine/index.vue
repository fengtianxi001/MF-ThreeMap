<template>
    <ul class="infoLabel" ref="demo" :class="{ hide: labelHide }" @click="labelHide= true">
        <li></li>
        <li class="labelInfo">
            <div>
                <header>
                    <div class="cn">风机信息详情</div>
                    <span class="en">turbine's info</span>

                </header>
                <ul>
                    <li>
                        <span>设备名称:</span>
                        <span>{{ nowTurbineInfo.name }} 风机</span>
                        <span></span>
                    </li>
                    <li>
                        <span>实时风速:</span>
                        <span>{{ parseInt(Math.random() * 300) }}</span>
                        <span>km/h</span>
                    </li>
                    <li>
                        <span>实时有功:</span>
                        <span>{{ parseInt(Math.random() * 300) }}</span>
                        <span>Kw</span>
                    </li>
                    <li>
                        <span>发电量:</span>
                        <span>{{ parseInt(Math.random() * 300) }}</span>
                        <span>Kw</span>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
</template>
<script>
/* eslint-disable */
import * as THREE from "three";
import * as $ from "jquery";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

// import { normal, danger } from "@/utils/tools/CreateMaterials";
// import outline from "@/utils/tools/Outline";
// import findClickObject from "@/utils/tools/FindClickObject.js";
// import createCssObject from "@/utils/tools/CreateCssObject.js";
import { mapbus } from "../TMap/threeGeo";
import turbinesInfo from "./mock/data";
export default {
    name: "TTurebine",
    inject: ["global"],
    data() {
        return {
            matrixTurbine: null,
            turbineMap: new Map(),
            turbineGroup: new THREE.Group(),
            cssObject: null,
            nowTurbineInfo: {
                id: 1001,
                name: "#1",
                coord: {
                    x: 0.0934727041086153,
                    y: 0.29318899868645987,
                    z: 0.01828845435418458
                }
            },
            labelHide: true,
            infoMap: new Map(),
            infoLabel: null
        };
    },
    methods: {
        //创建风机模板
        loadTurbine() {
            const url = "/model/turbine.glb";
            let loader = new GLTFLoader();
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath("/draco/");
            dracoLoader.preload();
            loader.setDRACOLoader(dracoLoader);
            return new Promise((resolve, rejest) => {
                loader.load(url, matrix => {
                    this.matrixTurbine = matrix;
                    let mesh = matrix.scene;
                    let scale = 0.0003 * 1;
                    mesh.scale.set(scale, scale, scale);
                    mesh.rotateX(Math.PI / 2);
                    mesh.rotateY(-Math.PI / 2);
                    resolve(matrix);
                });
            });
        },
        //通过模板克隆风机
        cloneTurbine(matrix, info) {
            const { x, y, z } = info.coord;
            const cloneScene = matrix.scene.clone();
            cloneScene.position.set(x, y, z);
            cloneScene.name = info.name + "号风机";
            cloneScene.traverse(child => {
                child.userData = info;
            });
            this.turbineMap.set(info.id, cloneScene);
            this.turbineGroup.add(cloneScene);
            this.changeAnimation(info.id, "slow");
            this.createNumberLael(info);
        },
        //添加和改变风机旋转动画
        changeAnimation(turbineId, animationName) {
            const turbine = this.turbineMap.get(turbineId);
            if (!turbine) return console.warn("找不到" + turbineName + "风机");
            const animations = this.matrixTurbine.animations;
            const mixer = new THREE.AnimationMixer(turbine);
            const clip = THREE.AnimationClip.findByName(
                animations,
                animationName
            );
            const key = turbine.userData.name;
            if (clip) {
                const action = mixer.clipAction(clip);
                action.play();
                return this.global.mixers.set(key, mixer);
            }
            return this.global.mixers.delete(key);
        },
        createNumberLael(info) {
            const { name, coord, id } = info;
            let str = `
                <div 
                    id="turbine_${id}"
                    class="turbineNumber normal" 
                    data-id="${id}"
                >
                    ${name.replace("#", "")}
                </div>
            `;
            const dom = $(str)[0];
            let label = new CSS2DObject(dom);
            label.position.set(coord.x, coord.y, coord.z + 0.004);
            this.turbineGroup.add(label);
        },
        //生成label
        createLabel() {
            let label = new CSS2DObject(this.$refs.demo);
            label.position.set(0,0,0);
            this.infoLabel = label
            this.turbineGroup.add(label);
        },
        updataLabel(userData) {
            // console.log(userData.point);
            // console.log()
            if (userData.id === this.labelId) {
                $(".turbineLabel").toggleClass("hide");
            } else {
                $(".turbineLabel").removeClass("hide");
            }
            const { x, y, z } = transfromCoordinates(
                userData.point,
                userData.height
            );
            this.cssObject.position.set(x, y, z);
            $("#turbineName").html(userData.name);
            $("#turbineSpeed").html(userData.speed);
            $("#turbineLoad").html(userData.load);
            $("#turbinePowerTotal").html(userData.powerTotal);
            this.labelId = userData.id;
        }
    },
    mounted() {
        this.global.scene.add(this.turbineGroup);
        this.createLabel();
        mapbus.$on("mapCompleted", () => {
            this.loadTurbine().then(matrix => {
                turbinesInfo.forEach(turbineInfo => {
                    this.infoMap.set(turbineInfo.id, turbineInfo)
                    this.cloneTurbine(matrix, turbineInfo);
                });
            });
        });
        const vm = this;
        $("#app").on("click", ".turbineNumber", function() {
            const id = $(this).attr("data-id")
            console.log(id);
            const info = vm.infoMap.get(Number(id))
            const {x,y,z} = info.coord
            vm.infoLabel.position.set(x,y,z)
            vm.labelHide = false
            vm.nowTurbineInfo = info
        });
    },
    destroyed() {
        // window.removeEventListener("click", this.clickModel);
    }
};
</script>
<style lang='scss'>
.hide {
    display: none;
}
.show {
    display: block !important;
}

.turbineNumber {
    $width: 20px;
    display: block;
    width: $width;
    height: $width;
    line-height: $width;
    border: 1px solid #ccc;
    font-size: 12px;
    text-align: center;
    color: #cccccc;
    border-radius: 50%;
    text-shadow: 0 0 10px #000;
    background-color: rgba(0, 0, 0, 0.4);
    list-style: none;
    cursor: pointer;
}
.infoLabel {
    $ratio: .8;
	z-index: 999;
	width: calc(988px * #{$ratio});
	height: calc(451px * #{$ratio});
	// background-color: red;
	& > li:nth-child(1) {
		color: #fff;
		width: calc(191.5px * #{$ratio});
		height: calc(225.5px * #{$ratio});
		background-image: url("../../../assets/images/1.png");
		background-size: calc(191.5px * #{$ratio}) auto;
		position: absolute;
		right: calc(302.5px * #{$ratio});
		top: 0px;
	}
	.labelInfo {
		width: calc(302.5px * #{$ratio});
		height: calc(225.5px * #{$ratio});
		background-image: url("../../../assets/images/2.png");
		background-size: calc(302.5px * #{$ratio}) auto;
		position: absolute;
		right: 0px;
		top: 0px;
		padding: 10px;
		box-sizing: border-box;
		& > div {
			width: 100%;
			height: 100%;
			background-color: #04669e73;
			border: 1px solid #15c5e8;
			box-sizing: border-box;
			padding: 5px 20px;
			header {
				width: 100%;
				// height: 40px;
				text-align: left;
				font-size: 14px;
				color: #fff;
				border-bottom: 1px dashed aqua;
				padding-bottom: 5px;
                position: relative;
				.en {
					font-size: 12px;
					color: aqua;
				}
                i{
                    width: 50px;
                    height: 30px;
                    background-color: #1ac2e3;
                    position: absolute;
                    top: 0;
                    right: 0;
                    line-height: 30px;
                    text-align: center;
                    color: #fff;
                    border-radius: 5px;
                    cursor: pointer;
                }
			}
			ul {
				width: 100%;
				color: #fff;
				li {
					line-height: 24px;
					font-size: 14px;
					display: flex;
					justify-content: space-between;
					text-align: left;
					align-items: center;
					span:nth-child(1) {
						width: 40%;
					}
					span:nth-child(2) {
						width: 32%;
						color: #f0c002;
					}
					span:nth-child(3) {
						width: 28%;
					}
				}
			}
		}
	}
}
</style>