# Three_geo

## Project introduction
This is a `three.js` project built with `vue-cli`, and the geographic map module is in the [w3reality](https://github.com/w3reality/three-geo) on the basis of simple modification and encapsulation，And other 3D models are introduced into the project.


## Effect display
![Effect display](https://github.com/fengtianxi001/Figure-bed/blob/main/images/Three_geo/1.gif?raw=true)
![Effect display](https://github.com/fengtianxi001/Figure-bed/blob/main/images/Three_geo/4.png?raw=true)

## Setup

**Installation**

```
$ npm i three-geo
```

## Usage

**On the use of Geo map **

- You need to open `components> three_geo> TMap> config`, And modify `tokenmapbox` property options
- You can get `tokenmapbox` on [mapBox](https://account.mapbox.com/)

```js
{
    center: "****",// [lat, lng]
    radius: "****",//radius of bounding circle (km)
    zoom: "****", //zoom resolution
    tokenMapbox: "****",// <---- set your Mapbox API token here
    mapbox_satellite_url: null,
    mapbox_terrain_rgb_url: null,
}
```
