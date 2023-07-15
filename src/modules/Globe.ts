// dependencies
import * as THREE from "three";
import { 
  GLTFExporter, 
  GLTFExporterOptions 
} from 'three/examples/jsm/exporters/GLTFExporter';
import * as CesiumType from 'cesium';

// modules
import init3D, { 
  Camera 
} from "./Init3D";
import { 
  onAnimate, 
  getGlobeInit, 
  setGlobeInit, 
} from "..";

// configs
const Cesium: typeof CesiumType = window['Cesium'];
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDM0OTQ5Yi1lYjQ1LTRkMjQtYjllMC00YjkzOWNkZmIzMDYiLCJpZCI6ODIyOTgsImlhdCI6MTY4OTIxODI0MX0.5o0xQ4T4BCI8afp_0lXzjO_wa0kTOkc7dCdCGnJDiro';


// #1
export default function InitGlobe() {
  if (!getGlobeInit()) {
    const globeContainer = document.getElementById('somata') as HTMLDivElement;
    const globe = new Cesium.Viewer(globeContainer, {
      contextOptions: {
        webgl: {
          alpha: true,
          antialias: true,
          depth: true,
        }
      },
      shadows: false,
      skyBox: false,
      scene3DOnly: true,
      skyAtmosphere: false,
      creditViewport: 'no-show',
      creditContainer: document.getElementById('no-show') as HTMLDivElement,

      terrain: Cesium.Terrain.fromWorldTerrain(),

      // Viewer specific clutter elements
      infoBox: false,
      vrButton: false,
      timeline: false,
      geocoder: false,
      animation: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
    });
    Cesium.createOsmBuildingsAsync().then(tileset => globe.scene.primitives.add(tileset));
    

    // Bind underlying canvas for reference by three.js
    window['globeCanvas'] = globe.canvas;

    setGlobeInit(true);
    InitHardwareSensors(globe);

    const ObserverTelemetry = {
      roll: globe.camera.roll,
      pitch: globe.camera.pitch,
      heading: globe.camera.heading,
      position: globe.camera.position,
      direction: globe.camera.direction,
      reference: {
        up: globe.camera.up,
        right: globe.camera.right,
      }
    };
    globe.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);

    // globe.trackedEntity

    setInterval(() => {

      const upAxisVector = new THREE.Vector3(
        Cesium.Math.toDegrees(globe.camera.up.x),
        Cesium.Math.toDegrees(globe.camera.up.y),
        Cesium.Math.toDegrees(globe.camera.up.z),
      );
      const rightAxisVector = new THREE.Vector3(
        Cesium.Math.toDegrees(globe.camera.right.x),
        Cesium.Math.toDegrees(globe.camera.right.y),
        Cesium.Math.toDegrees(globe.camera.right.z),
      );
      const forwardVector = new THREE.Vector3(
        Cesium.Math.toDegrees(globe.camera.direction.x),
        Cesium.Math.toDegrees(globe.camera.direction.y),
        Cesium.Math.toDegrees(globe.camera.direction.z),
      );
      
      // console.debug(
      //   `\nUp Axis Vector:`,    upAxisVector,
      //   `\nRight Axis Vector:`, rightAxisVector,
      //   `\nForward Vector:`,    forwardVector
      // );
      }, 1000);

    // Chain to #2
    // init3D();

    // use three.js to dynamically generate meshes, export them to gltf, and then load them into Cesium
    // Three's camera, scene, and renderer may not even be needed for it
    const output = new THREE.Scene();
    const g_testBall = new THREE.SphereGeometry();
    const m_testBall = new THREE.MeshBasicMaterial();
    const o_testBall = new THREE.Mesh(g_testBall, m_testBall);

    output.add(o_testBall);
    
    const threeToCesium = new GLTFExporter();
    const exportGLTF = threeToCesium.parseAsync(o_testBall, {
      trs: true,
      binary: false /* return as .glb instead of .gltf? */,
      animations: [],
      embedImages: true,
      onlyVisible: true,
    });
    exportGLTF.then(model => {
      console.debug(model);
      const test = globe.entities.add({
        name: 'test',
        model: {
          uri: model.toString()
        }
      });
      globe.trackedEntity = test;
    });

    globe.scene.sunBloom = true;
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

      (geoData) => {
        SpatialData.geolocation.latitude = geoData.coords.latitude;
        SpatialData.geolocation.longitude = geoData.coords.longitude;
        SpatialData.geolocation.altitude = geoData.coords.altitude;
        SpatialData.geolocation.accuracy.location = geoData.coords.accuracy;
        SpatialData.geolocation.accuracy.altitude = geoData.coords.altitudeAccuracy;
        SpatialData.geolocation.heading = geoData.coords.heading;
        SpatialData.geolocation.queriedAt = geoData.timestamp;
        SpatialData.geolocation.groundSpeed = geoData.coords.speed;
      },

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