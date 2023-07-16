import { onAnimate } from "..";
import Main from "../SILVIC";


// #4
export default function initUI() {

  const IRIS = {
    Base: document.getElementById('ui-base') as HTMLObjectElement, // should usually always be visible
    Rotary: {
      Zone: document.getElementById('ui-rotary-zone') as HTMLObjectElement,
      Selector: document.getElementById('ui-rotary-selector') as HTMLObjectElement,
      Dial: document.getElementById('ui-rotary-dial') as HTMLObjectElement,
    },
  };

  /* Set toggling for static UI components */
  // IRIS.Rotary.Zone.style.opacity = '0';
  // IRIS.Rotary.Dial.style.opacity = '0';
  // IRIS.Rotary.Selector.style.opacity = '0';

  // The icon dial stays stationary, but the selector rotates around it to encode the selected mode based on angle

  /* Logic for moving UI components e.g. ... */ 
  let angle = 0;
  onAnimate.push(() => {
    IRIS.Rotary.Selector.style.rotate = `${angle}deg`;
    angle++;
  });

  // Using a Three.js circle geometry object with 6 segments, grabbing the vertex coord for each segment...


  // Uses HTML Overlays in Cesium to control location and scaling of datapoint tags

  // Call Main() in SILVIC
  Main();
}