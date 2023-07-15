// import * as Cesium from 'cesium';

import InitGlobe from "./modules/Space";

export const onAnimate: {(): void}[] = [];

let globeInitialized = false;
export function getGlobeInit() { return globeInitialized }
export function setGlobeInit(setter: boolean) { globeInitialized = setter }

window.addEventListener('DOMContentLoaded', () => {
  // Inits
  InitGlobe();

  // Render loop
  const render = () => {
    requestAnimationFrame(render);
    onAnimate.forEach(cb => cb());
  };
  render();
});