
// import ThreeGeo from "../three-geo.esm"
// import { Vector3 } from "three"
// import mapOptions from "../../config/mapConfig";

// const { center, radius, tokenMapbox } = mapOptions
// export const map = new ThreeGeo({ tokenMapbox });
// export const { proj, unitsPerMeter } = map.getProjection(center, radius)
// export function transfromCoordinates(pointsArray,height){
//     let coordinates
//     if (pointsArray.length === 3 && !height){
//         coordinates = new Vector3(
//             ...proj(pointsArray.slice(0,2)),
//             pointsArray[2] * unitsPerMeter
//         )
//     }else{
//         coordinates = new Vector3(
//             ...proj(pointsArray),
//             height * unitsPerMeter
//         )
//     }
//     return coordinates
// }
