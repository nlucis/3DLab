// import * as Cesium from 'cesium';

import init3D from "./modules/Init3D";
import initUI from "./modules/InitUI";
import InitGlobe from "./modules/Space";

export const onAnimate: {(): void}[] = [];

let globeInitialized = false;
export function getGlobeInit() { return globeInitialized }
export function setGlobeInit(setter: boolean) { globeInitialized = setter }

window.addEventListener('DOMContentLoaded', () => {
  // Inits
  init3D();
  initUI();
  // InitGlobe();

  // Render loop
  // const render = () => {
  //   requestAnimationFrame(render);
  //   onAnimate.forEach(cb => cb());
  // };
  // render();
});