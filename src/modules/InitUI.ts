import Main from "../SILVIC";
import { Ticker } from 'pixi.js';
import { SVGScene } from '@pixi-essentials/svg';
import { PlaceWaypoint } from "./Space";
import { Type } from "typescript";


const readSVG = async (uri: string) => {return await SVGScene.from(uri)};

const extractComponents = async (svg: SVGSVGElement) => {
  const components = {
    layer: {}
  };

  Array.from(svg.childNodes).forEach(async component => {
    // check that the component has an ID and does not belong to the defs layer
    const hasID = component['id'] !== undefined;
    const notDefs = component.nodeName !== 'defs';

    if (hasID && notDefs) {
      const layerID = component['id'] as string;
      component.childNodes.forEach(node => {
        console.debug(node.nodeValue);
      });
      console.debug(layerID);
    }
  });

  return components;
};

const extractProperties = async (element: SVGElement) => {
  const props = { };

  Array.from(element.childNodes).forEach(async childNode => {
    const name = childNode.nodeName.replace('#', '') as string;
    props[name] = {}; // create empty object to hold attributes and values
    const attrs = await childNode['attributes'] as NamedNodeMap | undefined;
    if (attrs) for (let attrID = 0; attrID < attrs.length; attrID++) {
      const propName = (childNode['attributes'] as NamedNodeMap).item(attrID)?.localName;
      const propValue = (childNode['attributes'] as NamedNodeMap).item(attrID)?.value;
      props[name][propName] = propValue; 
    }
  });

  return props;
};

// #4
export default function initUI() {

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Load the IRIS template SVG and parse it's structure for sub-elements and their properties
  readSVG('public/assets/svgs/base/IRIS.svg').then(async svgData => {
    const UI = svgData.content;

    /* -- Extract Components -- */
    const UIComponents = extractComponents(UI);
    console.debug(await UIComponents);

    const Interactron = UI.getElementById('Interactron') as SVGGElement;

    /* -- Extract Component Properties -- */
    const interactronProps = extractProperties(Interactron);
    console.debug(await interactronProps);

    // Add the IRIS UI to the DOM
    document.getElementById('UI')?.appendChild(UI);


    // Get the PolyPlate graphics element
    const polyPlate = Array.from(Interactron.childNodes).filter(childNode => {
      if (childNode.nodeName === 'g') return (childNode as SVGGElement).getAttributeNode('vectornator:layerName')?.nodeValue === 'PolyPlate';
    })[0] as SVGGElement;

      // Ref the fill value from the path element of the poly plate
      const pathElement = Array.from(polyPlate.childNodes).filter(childNode => childNode.nodeName === 'path')[0] as SVGPathElement;
      const enabledFill = '#FFFFFF';
      const defaultFill = pathElement.getAttribute('fill') as string;

    // Turn the polyplate white when pressedq
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