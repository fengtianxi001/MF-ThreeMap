import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader";

export function loadError(error){
    console.error("模型加载发生错误,错误信息为:", error);
}

export function loadProgress(xhr) {
    const rate = (xhr.loaded / xhr.total) * 100
    console.log( "模型已加载:" + rate + "%")
}

export function loadGlb(url){
    let loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    dracoLoader.preload();
    loader.setDRACOLoader(dracoLoader);
    return new Promise((resolve) => {
        loader.load(
            url,
            obj => resolve(obj),
            loadProgress,
            loadError
        );
    });
}

export function load3DS(url) {
    const loader = new TDSLoader();
    loader.setResourcePath("/draco/");
    return new Promise((resolve) => {
        loader.load(
            url,
            obj => resolve(obj),
            loadProgress,
            loadError
        );
    })
}