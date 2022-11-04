import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
export class Three {
  element: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  control: OrbitControls;
  constructor() {
    this.element = this.initElement();
    this.scene = this.initScene();
    this.camera = this.initCamera();
    this.renderer = this.initRenderer();
    this.control = this.initControl();
    this.render();
  }
  initScene() {
    const scene = new THREE.Scene();
    // //设置背景色
    scene.background = new THREE.Color(0xffffff);
    // scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
    return scene;
  }
  initElement() {
    const div = document.createElement('div');
    div.className = 'container';
    div.style.width = '100vw';
    div.style.height = '100vh';
    div.style.backgroundColor = '#fff';
    const app = document.querySelector('#app') as HTMLElement;
    app.appendChild(div);
    return div;
  }
  initCamera() {
    const { clientHeight, clientWidth } = this.element;
    const camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 10000000);
    camera.position.set(0, 0, 100);
    return camera;
  }
  initRenderer() {
    const { clientHeight, clientWidth } = this.element;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(clientWidth, clientHeight);
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.shadowMap.enabled = true;
    this.element.appendChild(renderer.domElement);
    return renderer;
  }
  initLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    // const dirLight = new THREE.DirectionalLight(0xffffff);
    // dirLight.position.set(-3, 10, -10);
    // dirLight.castShadow = true;
    // dirLight.shadow.camera.top = 2;
    // dirLight.shadow.camera.bottom = -2;
    // dirLight.shadow.camera.left = -2;
    // dirLight.shadow.camera.right = 2;
    // dirLight.shadow.camera.near = 0.1;
    // dirLight.shadow.camera.far = 40;
    // this.scene.add(dirLight);
  }
  initControl() {
    const control = new OrbitControls(this.camera, this.renderer.domElement);
    control.update();
    control.enableDamping = true;
    control.dampingFactor = 0.25;
    control.enableZoom = true;
    return control;
  }
  render() {
    this.renderer.render(this.scene, this.camera);
    this.control.update();
    requestAnimationFrame(() => {
      this.render();
    });
  }
  //添加正方体
  addCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xf40f40 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }
  //坐标辅助线
  addAxis() {
    const axis = new THREE.AxesHelper(100000);
    this.scene.add(axis);
  }
}
