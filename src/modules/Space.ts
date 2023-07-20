// dependencies
import * as THREE from "three";
import { 
  GLTFExporter, 
  GLTFExporterOptions 
} from 'three/examples/jsm/exporters/GLTFExporter';
import * as Cesium from 'cesium';

// modules
import init3D, { 
  Camera 
} from "./Init3D";
import { 
  onAnimate, 
  getGlobeInit, 
  setGlobeInit, 
} from "..";
import { Cesium3DTileStyle } from "@cesium/engine";

// configs
window['Cesium'];
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDM0OTQ5Yi1lYjQ1LTRkMjQtYjllMC00YjkzOWNkZmIzMDYiLCJpZCI6ODIyOTgsImlhdCI6MTY4OTIxODI0MX0.5o0xQ4T4BCI8afp_0lXzjO_wa0kTOkc7dCdCGnJDiro';

// Global cesium viewer ref
export let geomap: Cesium.Viewer;

// #1
export default function Initgeomap() {

  Cesium.Model
  Cesium.Primitive
  Cesium.Entity

  if (!getGlobeInit()) {
    const cesiumContainer = document.getElementById('somata') as HTMLDivElement;
    geomap = new Cesium.Viewer(cesiumContainer, {
      msaaSamples: 0,
      scene3DOnly: true,
      skyAtmosphere: false,
      sceneMode: Cesium.SceneMode.SCENE3D,
      creditContainer: document.getElementById('no-show') as HTMLDivElement, // will be displayed on load and in console instead
      terrain: Cesium.Terrain.fromWorldTerrain({requestVertexNormals: true}),

      // Viewer specific clutter elements
      infoBox: false,
      vrButton: false,
      timeline: false,
      geocoder: false,
      animation: false,
      homeButton: false,
      fullscreenButton: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
    });

    // Generate buildings
    Cesium.createOsmBuildingsAsync({
    showOutline: false,

    // @ts-ignore 
    customShader: new Cesium.CustomShader({
      mode: Cesium.CustomShaderMode.REPLACE_MATERIAL,
      lightingModel: Cesium.LightingModel.UNLIT,
      fragmentShaderText: `
        // Color tiles by distance to the camera
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
        {
            material.diffuse = vec3(0.1, 0.1, 0.3);
            material.diffuse.g = +fsInput.attributes.positionEC.z / 1.0e4;
            material.diffuse.b = -fsInput.attributes.positionEC.z / 1.0e4;
            material.diffuse.r = -fsInput.attributes.positionEC.y / 1.0e4;
        }
        `,
    }),
    })
    .then(tileset => {
      geomap.scene.primitives.add(tileset);
    });

    // Add horizon sihouette
    const outliner = geomap.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createSilhouetteStage());
    outliner.uniforms.color = Cesium.Color.WHITE;
    outliner.uniforms.length = 0.12;
    
    // Swap the rendering canvas to an offscreen instance
    geomap.scene.canvas.style.opacity = '0';

    // Bind underlying canvas for reference by three.js
    window['geomapCanvas'] = geomap.canvas;

    setGlobeInit(true);
    InitHardwareSensors(geomap);

    const ObserverTelemetry = {
      roll: geomap.camera.roll,
      pitch: geomap.camera.pitch,
      heading: geomap.camera.heading,
      position: geomap.camera.position,
      direction: geomap.camera.direction,
      reference: {
        up: geomap.camera.up,
        right: geomap.camera.right,
      }
    };
    geomap.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);

    // geomap.trackedEntity

    // setInterval(() => {

    //   const upAxisVector = new THREE.Vector3(
    //     Cesium.Math.toDegrees(geomap.camera.up.x),
    //     Cesium.Math.toDegrees(geomap.camera.up.y),
    //     Cesium.Math.toDegrees(geomap.camera.up.z),
    //   );
    //   const rightAxisVector = new THREE.Vector3(
    //     Cesium.Math.toDegrees(geomap.camera.right.x),
    //     Cesium.Math.toDegrees(geomap.camera.right.y),
    //     Cesium.Math.toDegrees(geomap.camera.right.z),
    //   );
    //   const forwardVector = new THREE.Vector3(
    //     Cesium.Math.toDegrees(geomap.camera.direction.x),
    //     Cesium.Math.toDegrees(geomap.camera.direction.y),
    //     Cesium.Math.toDegrees(geomap.camera.direction.z),
    //   );
      
    //   // console.debug(
    //   //   `\nUp Axis Vector:`,    upAxisVector,
    //   //   `\nRight Axis Vector:`, rightAxisVector,
    //   //   `\nForward Vector:`,    forwardVector
    //   // );
    //   }, 1000);

    // Clean up bloat
    document.getElementById('no-show')?.childNodes.forEach(childNode => childNode.remove());

    // Chain to #2
    init3D();

    geomap.scene.sunBloom = true;

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

const InitHardwareSensors = (cesium: Cesium.CesiumWidget | Cesium.Viewer) => {

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

    const sun = new Cesium.Sun();
    const moon = new Cesium.Moon();
    sun.glowFactor = 0.6;
    cesium.scene.sun = sun;
    cesium.scene.moon = moon;

    // GPS polling
    const geo = navigator.geolocation;
    geo.getCurrentPosition(
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

  // updateLocation();
}

// Called to create a new data waypoint on the geomap where the reticle is pointing
export const PlaceWaypoint = () => {

  // Get screen center pixel
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // get the pick ray that correlates to the reticle position
  const ray = geomap.camera.getPickRay(new Cesium.Cartesian2(centerX, centerY));

  // @ts-ignore | ray is never undefined
  const hitPosition = geomap.scene.globe.pick(ray, geomap.scene);
  console.log(ray, hitPosition);
  geomap.entities.add({
    position: hitPosition,
    point: {
      color: Cesium.Color.MAGENTA,
      pixelSize: 12,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  });

  const g_testCube = new THREE.BoxGeometry(2, 2, 2);
  const m_testCube = new THREE.MeshBasicMaterial({ color: 0xFFAC00 });
  const o_testCube = new THREE.Mesh(g_testCube, m_testCube);
  const exporter = new GLTFExporter();

        exporter.parseAsync(o_testCube, {
          animations: [],
          binary: true,
          embedImages: true,
          forceIndices: false,
          includeCustomExtensions: false,
          maxTextureSize: Infinity,
          onlyVisible: true,
          trs: true,
        })
        
        .then(gltf => {
          const blob = new Blob([ gltf as ArrayBuffer ], {type: 'application/octet-stream'});
          const uri = URL.createObjectURL(blob);

          // use three.js to dynamically generate meshes, export them to gltf, and then load them into the geomap
            Cesium.Model.fromGltfAsync({
            cull: true,
            url: uri, 
            allowPicking: true,
            scene: geomap.scene,
            upAxis: Cesium.Axis.Y,
            forwardAxis: Cesium.Axis.Z,
            showOutline: true,
            outlineColor: Cesium.Color.WHITE,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            backFaceCulling: true,
            modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
              hitPosition as Cesium.Cartesian3,
              new Cesium.HeadingPitchRoll()
          )})
          .then(model => {
            geomap.scene.primitives.add(model);
          });
        });
  return hitPosition;
};
window['PlaceWaypoint'] = PlaceWaypoint;

export const gotoPosition = (lat?: number, lon?: number, alt?: number) => {
  navigator.geolocation.getCurrentPosition(location => {
    geomap.scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon || location.coords.longitude, lat || location.coords.latitude, alt || 222)
    });
  }, err => console.error(err));
};
window['gotoPosition'] = gotoPosition;

// IndexDB - Save Local
export const SaveLocal = () => {};

// IPFS - Save Global
export const SaveGlobal = () => {};