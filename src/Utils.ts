import { EARTH_RAD } from './Constant';
import { RESOLUTION_LIST, EARTH_PERIMETER } from './Constant';
class Utils {
  //4326坐标转换为3857坐标
  static lngLat2Mercator(lng: number, lat: number): [number, number] {
    const x = (lng * Math.PI * EARTH_RAD) / 180;
    const y = ((Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) * Math.PI * EARTH_RAD) / 180;
    return [x, y];
  }
  //3857坐标转换为4326坐标
  static mercatorToLngLat(x: number, y: number): [number, number] {
    const lng = (x / EARTH_RAD / Math.PI) * 180;
    const lat =
      (180 / Math.PI) * (2 * Math.atan(Math.exp(((y / EARTH_RAD / Math.PI) * 180 * Math.PI) / 180)) - Math.PI / 2);
    return [lng, lat];
  }
  //计算中心经纬度对应的像素坐标
  static getPxFromLngLat(lng: number, lat: number, zoom: number): [number, number] {
    let [tempX, tempY] = Utils.lngLat2Mercator(lng, lat);
    tempX += EARTH_PERIMETER / 2;
    tempY = EARTH_PERIMETER / 2 - tempY;
    const x = Math.floor(tempX / RESOLUTION_LIST[zoom]);
    const y = Math.floor(tempY / RESOLUTION_LIST[zoom]);
    return [x, y];
  }
}

export default Utils;
