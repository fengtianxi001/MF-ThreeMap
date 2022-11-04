// import * as turf from '@turf/turf';
// import { tiles } from '@mapbox/tile-cover';

import Utils from './Utils';
import { chunk } from 'lodash';
import * as THREE from 'three';
import { RESOLUTION_LIST, EARTH_RAD } from './Constant';
import { Three } from './ThreeBase';
import getPixelsDom from 'get-pixels';
const center: [number, number] = [119.81, 26.33];
const zoom = 14;
const radius = 2;
const token = 'pk.eyJ1IjoiZmVuZ3RpYW54aTAwMSIsImEiOiJjbDNwdXNsYzIwNjJ3M2Jud3Izd3JkZDRoIn0.LzqYl3XI0-8dmOHPZO2uzw';
const three = new Three();
three.addAxis();

const center3857 = Utils.lngLat2Mercator(...center);
const row = Math.floor((center3857[0] + Math.PI * EARTH_RAD) / (RESOLUTION_LIST[zoom] * 256));
const col = Math.floor((Math.PI * EARTH_RAD - center3857[1]) / (RESOLUTION_LIST[zoom] * 256));
// 中心瓦片左上角对应的像素坐标
const centerTilePos = [row * 256, col * 256];
const centerPos = Utils.getPxFromLngLat(...center, zoom);
const offset = [centerPos[0] - centerTilePos[0], centerPos[1] - centerTilePos[1]];
console.log('offset', offset);
const arr: any = {};
for (let i = -1; i <= 1; i++) {
  for (let j = -1; j <= 1; j++) {
    // let geometry = new THREE.PlaneGeometry(1, 1, 256, 256);
    // geometry.rotateX(-Math.PI / 2);
    // const temp = [];
    // for (let ii = -128; ii <= 128; ii++) {
    //   for (let jj = -128; jj <= 128; jj++) {
    //     temp.push(ii, jj, 0);
    //   }
    // }
    // var BufferAttribute = new THREE.BufferAttribute(new Float32Array(temp), 3);
    // geometry.attributes.position = BufferAttribute;
    // const uri = `http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x=${row + i}&y=${col - j}&z=${zoom}`;
    const key = `${zoom}/${row + i}/${col - j}`;
    arr[key] = null;
    // let plane = new THREE.Mesh(
    //   geometry,
    //   new THREE.MeshBasicMaterial({
    //     wireframe: true,
    //     color: 0xf40f40,
    //   })
    // );
    // const texture = new THREE.TextureLoader().load(uri);
    // plane.material = new THREE.MeshBasicMaterial();
    // plane.material.map = texture;
    // three.scene.add(plane);
  }
}
console.log('arr', arr);
Object.keys(arr).forEach((item) => {
  const [zoom, x, y] = item.split('/');
  const uri = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${x}/${y}@1x.pngraw?access_token=${token}`;
  getPixelsDom(uri, (error, pixels) => {
    const pixelsChunk = chunk(pixels.data, 4);

    const data = pixelsChunk.map(([R, G, B]) => -10000 + (R * 256 * 256 + G * 256 + B) * 0.1);
    // const arr2 = [];
    // let index = 0;
    let geometry = new THREE.PlaneGeometry(256, 256, 255, 255);
    geometry.rotateX(-Math.PI / 2);
    const vertices = geometry.attributes.position.array;
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      vertices[j + 1] = data[i] / 10;
    }
    const offsetX = (x - row) * 256 - offset[0];
    const offsetY = (y - col) * 256 - offset[1];
    const uri = `http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x=${x}&y=${y}&z=${zoom}`;
    let plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xf40f40,
      })
    );
    const texture = new THREE.TextureLoader().load(uri);
    plane.material = new THREE.MeshBasicMaterial();
    plane.material.map = texture;
    plane.position.x = offsetX;
    plane.position.z = offsetY;
    // console.log('plane', plane);
    three.scene.add(plane);
    // console.log('plane', plane);
  });
});
