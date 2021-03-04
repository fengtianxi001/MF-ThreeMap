import * as THREE from "three"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

let outline = (renderer, tragetObject, scene, camera)=> {
    const compose = new EffectComposer(renderer);
    const selectedObjects = [tragetObject]
    const renderPass = new RenderPass(scene, camera);
    const outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 
        scene, 
        camera, 
        selectedObjects
    );
    outlinePass.renderToScreen = false;
    outlinePass.selectedObjects = selectedObjects;

    compose.addPass(renderPass);
    compose.addPass(outlinePass);

    var params = {
        edgeStrength: 2,
        edgeGlow: 0,
        edgeThickness: 1.0,
        pulsePeriod: 5,
        usePatternTexture: true
    };
    outlinePass.edgeStrength = params.edgeStrength;
    outlinePass.edgeGlow = params.edgeGlow;
    outlinePass.visibleEdgeColor.set(0xf40f40);
    outlinePass.hiddenEdgeColor.set(0xffffff);
    compose.render(scene, camera)
    return compose
}
export default outline