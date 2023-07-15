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
    InitHardwareSensors(globe);

    // Bind underlying canvas for reference by three.js
    window['globeCanvas'] = globe.canvas;

    // Chain to #2
    setGlobeInit(true);
    // init3D();

    // use three.js to dynamically generate meshes, export them to gltf, and then load them into Cesium
    // Three's camera, scene, and renderer may not even be needed for it
  }
}

export const SpatialData = {
  orientation: {
    alpha: <number | null> null,
    beta:  <number | null> null,
    gamma: <number | null> null
  },
  acceleration: {
    xAxis: <number | null> null,
    yAxis: <number | null> null,
    zAxis: <number | null> null,
    gravitational:{
      xAxis: <number | null> null,
      yAxis: <number | null> null,
      zAxis: <number | null> null
    },
    pollingRate: 0,
  },
  geolocation: {
    latitude:  <number | null> null,
    longitude: <number | null> null,
    altitude:  <number | null> null,
    heading:   <number | null> null,
    groundSpeed: <number | null> null,
    accuracy: {
      altitude: <number | null> null,
      location: <number | null> null
    },
      queriedAt: 0
  }
};

const InitHardwareSensors = (cesium: CesiumType.CesiumWidget | CesiumType.Viewer) => {

  // Accelerometer polling
  window.ondevicemotion = (accelerometer) => {
    SpatialData.acceleration.xAxis = accelerometer.acceleration?.x || -Infinity;
    SpatialData.acceleration.yAxis = accelerometer.acceleration?.y || -Infinity;
    SpatialData.acceleration.zAxis = accelerometer.acceleration?.z || -Infinity;
    SpatialData.acceleration.gravitational.xAxis = accelerometer.accelerationIncludingGravity?.x || -Infinity;
    SpatialData.acceleration.gravitational.yAxis = accelerometer.accelerationIncludingGravity?.y || -Infinity;
    SpatialData.acceleration.gravitational.zAxis = accelerometer.accelerationIncludingGravity?.z || -Infinity;
  };
  
  // Gyroscope polling
  window.ondeviceorientation = (gyroscope) => {
    SpatialData.orientation.alpha = gyroscope.alpha;
    SpatialData.orientation.beta = gyroscope.beta;
    SpatialData.orientation.gamma = gyroscope.gamma;
  };

  if ('navigator' in window) {

    // External device for Interactron activation (e.g. HID)
    const hid = navigator['hid'];

    // GPS polling
    const geo = navigator.geolocation;
    geo.watchPosition(

      /* normal operation */ 
      (geoData) => {
        console.debug(geoData);
        SpatialData.geolocation.latitude = geoData.coords.latitude;
        SpatialData.geolocation.longitude = geoData.coords.longitude;
        SpatialData.geolocation.altitude = geoData.coords.altitude;
        SpatialData.geolocation.accuracy.location = geoData.coords.accuracy;
        SpatialData.geolocation.accuracy.altitude = geoData.coords.altitudeAccuracy;
        SpatialData.geolocation.heading = geoData.coords.heading;
        SpatialData.geolocation.queriedAt = geoData.timestamp;
        SpatialData.geolocation.groundSpeed = geoData.coords.speed;
      },

      /* error handler */
      (error) => {
        console.error(error);
      },

      /* options */
      {
        timeout: 36000,
        maximumAge: 1200,
        enableHighAccuracy: true,
      }
    );
  }

  // Needs work but this should be able to orient the camera to match the spatial orientation of the user's device
  const updateLocation = () => setTimeout(() => {
    console.debug('updating location data');
    cesium.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(SpatialData.geolocation.longitude || 0, SpatialData.geolocation.latitude || 0, 222),
      // orientation: {
      //   roll: 18.0,
      //   pitch: Cesium.Math.toRadians(90),
      //   heading: Cesium.Math.toRadians(90),
      //   up: new Cesium.Cartesian3(0, -1, 0),
      //   direction: new Cesium.Cartesian3(SpatialData.orientation.beta || 0, SpatialData.orientation.gamma || 0, SpatialData.orientation.alpha || 0),
      // },
      // complete: updateLocation
    });
  }, 1200);

  updateLocation();
}