import { onAnimate } from "..";
import Main from "../SILVIC";
import * as PIXI from 'pixi.js';
import { SVGScene } from '@pixi-essentials/svg';


export const UICanvas: OffscreenCanvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
export const UI = new PIXI.Application({
  hello: true,
  view: UICanvas,
  antialias: true,
  autoStart: true,
  backgroundAlpha: 0,
  width: window.innerWidth,
  height: window.innerHeight
});

// #4
export default function initUI() {


  const debugCircle = new PIXI.Graphics();
  debugCircle.lineStyle({
    alpha: 1,
    cap: PIXI.LINE_CAP.ROUND,
    color: 0xFFFFFF, 
    width: 3,
  });
  debugCircle.drawCircle(window.innerWidth / 2, window.innerHeight / 2, 64);
    UI.stage.addChild(debugCircle);

  const loadSVG = async () => {
    const keypadToggleURI = 'public/assets/svgs/animated/KeypadToggle.svg';
    const svgViewport = UI.stage.addChild(new PIXI.Container());
    return await SVGScene.from(keypadToggleURI);
  };

  loadSVG().then(svg => {
    svg.x = (window.innerWidth / 2) - (svg.width / 2);
    svg.y = (window.innerHeight / 2) - (svg.height / 2);
    UI.stage.addChild(svg);
    console.debug(svg);
  });


  const IRIS = {
    Base: document.getElementById('ui-base') as HTMLObjectElement, // should usually always be visible
    Finalizer: document.getElementById('ui-finalize-waypoint') as HTMLObjectElement,
    Rotary: {
      Zone: document.getElementById('ui-rotary-zone') as HTMLObjectElement,
      Selector: document.getElementById('ui-rotary-selector') as HTMLObjectElement,
      Dial: document.getElementById('ui-rotary-dial') as HTMLObjectElement,
    },
  };

  /* Set toggling for static UI components */
  IRIS.Finalizer.style.opacity = '0';
  IRIS.Rotary.Zone.style.opacity = '0';
  IRIS.Rotary.Dial.style.opacity = '0';
  IRIS.Rotary.Selector.style.opacity = '0';

  let finalizeEnabled: boolean = false;

  // Toggling test
  document.addEventListener('pointerdown', ev => {
    finalizeEnabled = !finalizeEnabled;
    // IRIS.Base.style.opacity = `${finalizeEnabled ? 0 : 1}`;
    IRIS.Finalizer.style.opacity = `${finalizeEnabled ? 1 : 0}`;
  });

  /* Logic for moving UI components e.g. ... */ 
  // The icon dial stays stationary, but the selector rotates around it to encode the selected mode based on angle
  // let angle = 0;
  // onAnimate.push(() => {
  //   IRIS.Rotary.Selector.style.rotate = `${angle}deg`;
  //   angle++;
  // });

  // Uses HTML Overlays in Cesium to control location and scaling of datapoint tags
  
  // Call Main() in SILVIC
  Main();
}