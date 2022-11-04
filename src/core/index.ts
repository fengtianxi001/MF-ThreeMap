import { lngLat2Mercator, getPxFromLngLat } from './utils';
import { chunk } from 'lodash';
import { RESOLUTION_LIST, EARTH_RAD } from './constant';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import getPixelsDom from 'get-pixels';

export type CoreOption = {
  center: [number, number];
  zoom: number;
  token: string;
};
class Core {
  center: [number, number];
  zoom: number;
  three: {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    control: OrbitControls;
    animation: () => void;
  };
  token: string;
  constructor(option: CoreOption) {
    this.center = option.center;
    this.zoom = option.zoom;
    this.token = option.token;
    this.three = this.initThree();
    this.initMap();
  }
  //初始化three.js
  initThree() {
    const element = document.querySelector('#app') as HTMLElement;
    const { clientWidth, clientHeight } = element;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000 * 10);
    camera.position.set(0, 100, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(clientWidth, clientHeight);
    element.appendChild(renderer.domElement);
    const control = new OrbitControls(camera, renderer.domElement);
    const axis = new THREE.AxesHelper(100000);
    scene.add(axis);
    const animation = () => {
      requestAnimationFrame(animation);
      renderer.render(scene, camera);
      control.update();
    };
    animation();
    return {
      scene,
      camera,
      renderer,
      control,
      animation,
    };
  }
  initMap() {
    const { zoom, token } = this;
    //将经纬度转换为墨卡托坐标
    const mercator = lngLat2Mercator(...this.center);
    //计算经纬度在当前zoom下的行列号
    const row = Math.floor((mercator[0] + Math.PI * EARTH_RAD) / (RESOLUTION_LIST[zoom] * 256));
    const col = Math.floor((Math.PI * EARTH_RAD - mercator[1]) / (RESOLUTION_LIST[zoom] * 256));
    //行列号组合就是中心瓦片的地址了
    //中心瓦片左上角对应的像素坐标
    const centerTilePosition = [row * 256, col * 256];
    const centerPosition = getPxFromLngLat(...this.center, zoom);
    //中心点坐标与中心瓦片左上角坐标的差值就是中心瓦片相对于(0,0)的偏移量
    const offset = [centerPosition[0] - centerTilePosition[0], centerPosition[1] - centerTilePosition[1]];
    //知道了偏移量, 现在开始计算中心瓦片四周的瓦片行列号了
    //正常需要通过radius来计算, 但是这里为了简单, 直接取个固定值
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const x = row + i;
        const y = col - j;
        const terrainRgbURI = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${x}/${y}@1x.pngraw?access_token=${token}`;
        getPixelsDom(terrainRgbURI, (error, pixels) => {
          const pixelsChunk = chunk(pixels.data, 4);
          const data = pixelsChunk.map(([R, G, B]) => -10000 + (R * 256 * 256 + G * 256 + B) * 0.1);

          const geometry = new THREE.PlaneGeometry(256, 256, 255, 255);

          geometry.rotateX(-Math.PI / 2);
          const vertices = geometry.attributes.position.array;
          for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            vertices[j + 1] = data[i] / 5;
          }
          const uri = `http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x=${x}&y=${y}&z=${zoom}`;
          const plane = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
              wireframe: true,
              color: 0xf40f40,
            })
          );
          const texture = new THREE.TextureLoader().load(uri);
          plane.material = new THREE.MeshBasicMaterial();
          plane.material.map = texture;
          const offsetX = (x - row) * 256 - offset[0];
          const offsetY = (y - col) * 256 - offset[1];
          plane.position.x = offsetX;
          plane.position.z = offsetY;
          this.three.scene.add(plane);
        });
      }
    }
  }
}

export default Core;
