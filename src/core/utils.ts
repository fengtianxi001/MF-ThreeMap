import { EARTH_RAD, RESOLUTION_LIST, EARTH_PERIMETER } from './constant';

//4326坐标转换为3857坐标
export function lngLat2Mercator(lng: number, lat: number) {
  const x = (lng * Math.PI * EARTH_RAD) / 180;
  const y = ((Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) * Math.PI * EARTH_RAD) / 180;
  return [x, y] as [number, number];
}

//3857坐标转换为4326坐标
export function mercatorToLngLat(x: number, y: number) {
  const lng = (x / EARTH_RAD / Math.PI) * 180;
  const lat =
    (180 / Math.PI) * (2 * Math.atan(Math.exp(((y / EARTH_RAD / Math.PI) * 180 * Math.PI) / 180)) - Math.PI / 2);
  return [lng, lat] as [number, number];
}

//计算中心经纬度对应的像素坐标
export function getPxFromLngLat(lng: number, lat: number, zoom: number) {
  let [tempX, tempY] = lngLat2Mercator(lng, lat);
  tempX += EARTH_PERIMETER / 2;
  tempY = EARTH_PERIMETER / 2 - tempY;
  const x = Math.floor(tempX / RESOLUTION_LIST[zoom]);
  const y = Math.floor(tempY / RESOLUTION_LIST[zoom]);
  return [x, y] as [number, number];
}
