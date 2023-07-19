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
import { Cesium3DTileStyle } from "@cesium/engine";
import { onAnimate } from '../index';

// configs
const Cesium: typeof CesiumType = window['Cesium'];
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDM0OTQ5Yi1lYjQ1LTRkMjQtYjllMC00YjkzOWNkZmIzMDYiLCJpZCI6ODIyOTgsImlhdCI6MTY4OTIxODI0MX0.5o0xQ4T4BCI8afp_0lXzjO_wa0kTOkc7dCdCGnJDiro';

// #1
export default function Initgeomap() {

  Cesium.Model
  Cesium.Primitive
  Cesium.Entity

  if (!getGlobeInit()) {
    const cesiumContainer = document.getElementById('somata') as HTMLDivElement;
    const geomap = new Cesium.Viewer(cesiumContainer, {
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: false,
        },
      },
      msaaSamples: 0,
      skyBox: false,
      shadows: true,
      scene3DOnly: true,
      skyAtmosphere: false,
      sceneMode: Cesium.SceneMode.SCENE3D,
      creditContainer: document.getElementById('no-show') as HTMLDivElement, // will be displayed on load and in console instead

      terrain: Cesium.Terrain.fromWorldTerrain(),
      targetFrameRate: 24,
      shouldAnimate: false,

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
  console.debug(tileset); 
  tileset.outlineColor = Cesium.Color.WHITE;
  geomap.scene.primitives.add(tileset);
});


    // Add horizon sihouette
    const outliner = geomap.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createSilhouetteStage());
    outliner.uniforms.color = Cesium.Color.WHITE;
    outliner.uniforms.length = 0.12;

    // geomap.postProcessStages.add(
    //   geomap.postProcessStages.ambientOcclusion 
    // )
    
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

    setInterval(() => {

      const upAxisVector = new THREE.Vector3(
        Cesium.Math.toDegrees(geomap.camera.up.x),
        Cesium.Math.toDegrees(geomap.camera.up.y),
        Cesium.Math.toDegrees(geomap.camera.up.z),
      );
      const rightAxisVector = new THREE.Vector3(
        Cesium.Math.toDegrees(geomap.camera.right.x),
        Cesium.Math.toDegrees(geomap.camera.right.y),
        Cesium.Math.toDegrees(geomap.camera.right.z),
      );
      const forwardVector = new THREE.Vector3(
        Cesium.Math.toDegrees(geomap.camera.direction.x),
        Cesium.Math.toDegrees(geomap.camera.direction.y),
        Cesium.Math.toDegrees(geomap.camera.direction.z),
      );
      
      // console.debug(
      //   `\nUp Axis Vector:`,    upAxisVector,
      //   `\nRight Axis Vector:`, rightAxisVector,
      //   `\nForward Vector:`,    forwardVector
      // );
      }, 1000);

      // Cleanup the Cesium bloat
      document.getElementById('no-show')?.childNodes.forEach(childNode => childNode.remove());

    // Chain to #2
    init3D();

    // use three.js to dynamically generate meshes, export them to gltf, and then load them into Cesium
    // Three's camera, scene, and renderer may not even be needed for it

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
          trs: false,
        })
        
        .then(gltf => {
          const blob = new Blob([ gltf as ArrayBuffer ], {type: 'application/octet-stream'});
          const uri = URL.createObjectURL(blob);
          const position = Cesium.Cartesian3.fromDegrees(geoData.coords.longitude, geoData.coords.latitude);
          
          const moon = new Cesium.Moon();
          const sun = new Cesium.Sun();
          sun.glowFactor = 0.6;
          console.debug(moon, sun);
          cesium.scene.moon = moon;
          cesium.scene.sun = sun;

            Cesium.Model.fromGltfAsync({
              url: uri, 
              allowPicking: true,
              scene: cesium.scene,
              upAxis: CesiumType.Axis.Y,
              forwardAxis: CesiumType.Axis.Z,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
                position,
                new Cesium.HeadingPitchRoll()
            )})

            .then(model => {
              model.outlineColor = Cesium.Color.ORANGE;
              cesium.scene.primitives.add(model);
            });
            cesium.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(geoData.coords.longitude, geoData.coords.latitude, 200)})
        });
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