import config from "../config"
import * as THREE from "three"
import ThreeGeo from "./threeGeo";
// import { Vector3 } from "three";


// global (全局变量)
let map = null;
let width = null;
let height = null;
let virtualCamera = null;


//create map Object (生成地图对象)
export async function threeGeo({ w, h }) {
	const { tokenMapbox, center, radius, zoom } = config;
	[width, height] = [w, h];
	map = new ThreeGeo({ tokenMapbox });
	window.terrain = await map.getTerrainRgb(center, radius, zoom);
	return window.terrain;
}


// utils tools 
// 根据经纬度获取高度
export function proj(array) {
	if (!virtualCamera) {
		virtualCamera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
	}
	const { center, radius } = config;
	const _proj = map && map.getProjection(center, radius).proj;
	const coordinates = _proj(array);
	return transfromCoordinates(coordinates);
}
//配套的工具函数
function transfromCoordinates(coordinates) { 
	// 得到世界坐标
	const { x, y } = new THREE.Vector2(...coordinates);
	const raycaster = new THREE.Raycaster();
	virtualCamera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
	virtualCamera.position.set(x, y, 10);
	virtualCamera.lookAt(x, y, 0);
	//将世界坐标换成屏幕坐标
	const { screenX, screenY } = worldToScreen(virtualCamera, width, height);
	const screenPoint = new THREE.Vector2(screenX, screenY);
	raycaster.setFromCamera(screenPoint, virtualCamera);
	const res = raycaster.intersectObjects(window.terrain.children, true);
	const z = res[0].point.z
	return new THREE.Vector3(x, y, z)
}

function worldToScreen(camera, w, h) {
	var world = new THREE.Vector3(0,0,1)
	let vector = world.project(camera);
	let halfWidth = w / 2,
		halfHeight = h / 2;
	return {
		x: Math.round(vector.x * halfWidth + halfWidth),
		y: Math.round(-vector.y * halfHeight + halfHeight),
	};
}

//地图专用的eventBus(用来监控地图的加载状态)
class Mapbus {
	constructor() {
		this.eventObject = {};
	}
	$on(eventName, callback) {
		if (!this.eventObject[eventName]) {
			this.eventObject[eventName] = [];
		}
		this.eventObject[eventName].push((argus) => {
			callback(argus);
		});
	}
	$emit(eventName, argus) {
		if (this.eventObject[eventName]) {
			this.eventObject[eventName].forEach((callbacks) => {
				callbacks(argus);
			});
		}
	}
}

export const mapbus = new Mapbus();
