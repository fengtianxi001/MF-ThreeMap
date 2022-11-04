import { range, map } from 'lodash';
//赤道半径
export const EARTH_RAD = 6378137;
//赤道周长
export const EARTH_PERIMETER = 2 * Math.PI * EARTH_RAD;
//瓦片分辨率
export const TILE_SIZE = 256;
//分辨率列表
export const RESOLUTION_LIST = map(range(18), (i) => EARTH_PERIMETER / Math.pow(2, i) / TILE_SIZE);
