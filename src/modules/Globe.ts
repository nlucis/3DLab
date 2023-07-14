import init3D from "./Init3D";
import * as CesiumType from 'cesium';

const Cesium: typeof CesiumType = window['Cesium'];
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDM0OTQ5Yi1lYjQ1LTRkMjQtYjllMC00YjkzOWNkZmIzMDYiLCJpZCI6ODIyOTgsImlhdCI6MTY4OTIxODI0MX0.5o0xQ4T4BCI8afp_0lXzjO_wa0kTOkc7dCdCGnJDiro';

// #1
export default function InitGlobe() {
  const globeContainer = document.getElementById('somata') as HTMLDivElement;
  const globe = new Cesium.CesiumWidget(globeContainer, {
    skyAtmosphere: new Cesium.SkyAtmosphere(),
    // skyBox: new Cesium.SkyBox(),
    creditContainer: document.getElementById('no-show') as HTMLDivElement
    // animation: false,
    // infoBox: false,
    // vrButton: false,
    // homeButton: false,
    // fullscreenButton: true,
    // useDefaultRenderLoop: false,
    // navigationHelpButton: false,
    // navigationInstructionsInitiallyVisible: false,
    // shadows: true,
  });
  window['globeCanvas'] = globe.canvas;

  // Chain to #2
  init3D();

  globe.camera.rotate(new Cesium.Cartesian3(0, 1, 0), 1);
}