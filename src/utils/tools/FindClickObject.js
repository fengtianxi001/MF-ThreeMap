import * as THREE from "three";

let findClickObject = ({ offsetX, offsetY }, global, parent) =>{
    const { w, h } = global.rendererSize;
    const x = (offsetX / w) * 2 - 1,
        y = -(offsetY / h) * 2 + 1;
    const mousePoint = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePoint, global.camera);
    return raycaster.intersectObjects(parent.children, true);
}
export default findClickObject
