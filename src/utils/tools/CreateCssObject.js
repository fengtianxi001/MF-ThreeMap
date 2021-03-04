import * as $ from "jquery"
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
function createCssObject(str) {
    const dom = $(str)[0]
    let CSSObject = new CSS2DObject(dom)
    return CSSObject
}
export default createCssObject
