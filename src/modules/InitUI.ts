import Main from "../SILVIC";
import { Ticker } from 'pixi.js';
import { SVGScene } from '@pixi-essentials/svg';
import { PlaceWaypoint } from "./Space";
import { Type } from "typescript";
import UIComponent from "../components/UIComponent";


const readSVG = async (uri: string) => {return await SVGScene.from(uri)};


// TODO: Optimize this to work recursively
const extractComponents = async (svg: SVGSVGElement) => {
  const components = {
    layers: {
      // props: {}
      // parts
        // components
          // properties
    }
  };

  const extractPath = (pathElement: any) => {

    const pathAttributes = (pathElement['attributes'] as NamedNodeMap); 
    const pathName = pathAttributes.getNamedItem('vectornator:layerName')?.nodeValue;
    const pathData = pathAttributes.getNamedItem('d')?.nodeValue as string;

    const path = {
      pathName: pathName,
      pathData: pathData,
      props: {}
    };

    for (let attrID = 0; attrID < pathAttributes.length; attrID++) {
      const nodeName = pathAttributes.item(attrID)?.nodeName as string;
      const nodeData = pathAttributes.item(attrID)?.nodeValue;
      if (nodeName !== 'd' && nodeName !== 'vectornator:layerName') path.props[nodeName] = nodeData;
    }

    return path;
  };

  Array.from(svg.childNodes).forEach(async component => {

    // if a component has children and an ID, it is a layer, otherwise it is a group (g)
    const hasID = (component['id'] !== undefined && component['id'] !== null);

    // Top-Level layers
    if (component.hasChildNodes() && hasID && component.nodeName === 'g') {
      components.layers[component['id']] = {
        id: component['id'],
        paths: {},
        groups: {},
        opacity: 0,
      };

      // console.debug(componentElement);
      // componentElement.style.opacity = components.layers[component['id']].opacity;

      // console.debug(`Component Attributes:`, component['attributes']);

      Array.from(component['children'] as SVGElement[]).forEach(child => {

        // Get groups within each layer
        if (child.nodeName === 'g') {
      const componentElement = document.getElementById(component['id']) as HTMLElement;
          const groupName = child['attributes']['vectornator:layerName'].value;
          components.layers[component['id']].groups[groupName] = {paths: {}};

          // Extract out all paths at a flattened depth
          Array.from(child.children).forEach(subChild => {

            if (subChild.nodeName === 'g') {

              // drill down to nested paths
              // console.debug(
              //   subChild.children,
              //   subChild.getAttribute('vectornator:layerName')
              // );
              // Array.of(subChild.children).forEach(child => {
              //   console.debug(`child:`, child);
              // });
            }

            else

            if (subChild.nodeName === 'path') {
              const path = extractPath(subChild);
              components.layers[component['id']].groups[groupName].paths[path.pathName] = {
                data: path.pathData,
                props: path.props
              }
            }
          });
          // get the sub-groups
          // extract the path data and props from each sub group
        }
        
        // Get the paths within each layer
        if (child.nodeName === 'path') {
          const pathName = child['attributes']['vectornator:layerName'].value;
          const pathAttributes = child['attributes'] as NamedNodeMap;

          components.layers[component['id']].paths[pathName] = {
            /* NOTE: if this needs to be broken down into individual points, split the string using the following: 
             * MoveTo - "M"{pixel_number}, "m"{pixel_number}
             * LineTo - {number}"L"{number}, {number}"l"{number}, "H", "h", "V", "v"
             * Cubic Bezier Curve - "C", "c", "S", "s"
             * Elliptical Arc Curve - "A", "a"
             * ClosePath - "Z", "z"
            */
            data: pathAttributes.getNamedItem('d')?.nodeValue, 
            props: {}
          };

          // populate props data
          for (let attrID = 0; attrID < pathAttributes.length; attrID++) {
            const propName = pathAttributes.item(attrID)?.nodeName;
            const propData = pathAttributes.item(attrID)?.nodeValue;
            if (propName !== 'd') components.layers[component['id']].paths[pathName].props[propName] = propData;
          }
        }
      });
    }

    // if a child does not have a layerName attribute, it is a base component

    // TODO: remove the sample1 and sample2 text elements
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

  let textDisplay: UIComponent;

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
        
      const gNodes = document.getElementsByTagName('g');
      const pathNodes = document.getElementsByTagName('path');

      const parseNodes = (nodes: HTMLCollectionOf<SVGGElement | SVGPathElement>) => {

        Array.from(nodes).forEach(node => {
          const nodeName = node.getAttribute('vectornator:layerName');
        if (nodeName !== null) {
          // console.debug(`node`, nodeName);

          if (nodeName === 'TextDisplay') {
            textDisplay = new UIComponent(node);
            textDisplay.setOpacity(0);
          }
          if (nodeName === 'Keypad') {
            node.style.opacity = '0';
          }
          if (nodeName === 'MessageTypes') {
            node.style.opacity = '0';
            node.addEventListener('', () => {});
          }
          if (nodeName === 'NewMessageIcon'
            || nodeName === 'Dialer'
            || nodeName === 'FinalizeAdd'
            || nodeName === 'Routines'
          ) {
            node.style.opacity = '0';
          }
        }
        })
      };

      parseNodes(gNodes);
      parseNodes(pathNodes);

        // console.debug(`groups`, groups);


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