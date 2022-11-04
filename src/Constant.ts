export const EARTH_RAD = 6378137;
export const EARTH_PERIMETER = 2 * Math.PI * EARTH_RAD;
export const TILE_SIZE = 256;
export const RESOLUTION_LIST = new Array(18).fill(0).map((_item, index) => {
  return EARTH_PERIMETER / Math.pow(2, index) / TILE_SIZE;
});
