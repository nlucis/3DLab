import Main from "../SILVIC";
import { Ticker } from 'pixi.js';
import { SVGScene } from '@pixi-essentials/svg';
import { PlaceWaypoint } from "./Space";


const readSVG = async (uri: string) => {return await SVGScene.from(uri)};

// #4
export default function initUI() {

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Template Components
  const interactron = {
    core: <SVGGElement | undefined> undefined
  };

  // Parse the template SVG structure for sub-elements
  readSVG('public/assets/svgs/base/Template.svg').then(svgData => {

    // Get the main Artboard
    const artboard = svgData.content.getElementById('ArtboardFrame').getElementsByTagName('rect')[0];
    const artboardWidth = parseInt(artboard.getAttribute('height') as string);
    const artboardHeight = parseInt(artboard.getAttribute('width') as string);

    const abAspectRatio = artboardWidth / artboardHeight;
    console.debug(abAspectRatio);

    // Add the base template to DOM
    document.getElementById('UI')?.appendChild(svgData.content); 


    // Extract sub-elements
    /* -- Interactron -- */
    const Interactron = svgData.content.getElementById('Interactron') as SVGGElement;

    // Override inherited point-events property
    Interactron.setAttribute('style', `pointer-events: all;`);

    // Get the PolyPlate graphics element
    const polyPlate = Array.from(Interactron.childNodes).filter(childNode => {
      if (childNode.nodeName === 'g') return (childNode as SVGGElement).getAttributeNode('vectornator:layerName')?.nodeValue === 'PolyPlate';
    })[0] as SVGGElement;

      // Ref the fill value from the path element of the poly plate
      const pathElement = Array.from(polyPlate.childNodes).filter(childNode => childNode.nodeName === 'path')[0] as SVGPathElement;
      const enabledFill = '#FFFFFF';
      const defaultFill = pathElement.getAttribute('fill') as string;

    // Turn the polyplate white when pressed
    Interactron.addEventListener('pointerdown', p => {pathElement.setAttribute('fill', enabledFill); PlaceWaypoint()}); // Testing effect by placing waypoints on click
    Interactron.addEventListener('pointerup'  , p => {pathElement.setAttribute('fill', defaultFill)});
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
  // IRIS.Finalizer.style.opacity = '0';
  // IRIS.Rotary.Zone.style.opacity = '0';
  // IRIS.Rotary.Dial.style.opacity = '0';
  // IRIS.Rotary.Selector.style.opacity = '0';

  let finalizeEnabled: boolean = false;

  // Toggling test
  // document.addEventListener('pointerdown', ev => {
  //   finalizeEnabled = !finalizeEnabled;
  //   IRIS.Base.style.opacity = `${finalizeEnabled ? 0 : 1}`;
  //   IRIS.Finalizer.style.opacity = `${finalizeEnabled ? 1 : 0}`;
  // });

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