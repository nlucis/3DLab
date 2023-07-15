import * as THREE from "three";
import { getGlobeInit, onAnimate, setGlobeInit } from "..";
import init3D, { Camera } from "./Init3D";
import * as CesiumType from 'cesium';

const Cesium: typeof CesiumType = window['Cesium'];
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDM0OTQ5Yi1lYjQ1LTRkMjQtYjllMC00YjkzOWNkZmIzMDYiLCJpZCI6ODIyOTgsImlhdCI6MTY4OTIxODI0MX0.5o0xQ4T4BCI8afp_0lXzjO_wa0kTOkc7dCdCGnJDiro';

// #1
export default function InitGlobe() {
  if (!getGlobeInit()) {
    const globeContainer = document.getElementById('somata') as HTMLDivElement;
    const globe = new Cesium.CesiumWidget(globeContainer, {
      shadows: false,
      scene3DOnly: true,
      skyAtmosphere: false,
      creditViewport: 'no-show',
      creditContainer: document.getElementById('no-show') as HTMLDivElement,
    });
    InitGeolocation(globe);

    // Bind underlying canvas for reference by three.js
    window['globeCanvas'] = globe.canvas;

    // Chain to #2
    setGlobeInit(true);
    // init3D();

    // use three.js to dynamically generate meshes, export them to gltf, and then load them into Cesium
    // Three's camera, scene, and renderer may not even be needed for it
  }
}

const InitGeolocation = (cesium: CesiumType.CesiumWidget | CesiumType.Viewer) => {
  if ('navigator' in window) {
    const geo = navigator.geolocation;
    geo.watchPosition(
      /* normal operation */ 
      (geoData) => {
        console.debug(geoData);
        cesium.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(geoData.coords.longitude, geoData.coords.latitude, 120)
        });
      },
      /* error handler */
      (error) => {
        console.error(error);
      },
      {
        // timeout: 3600,
        // maximumAge: 1200,
        enableHighAccuracy: true,
      }
    );
  }
}