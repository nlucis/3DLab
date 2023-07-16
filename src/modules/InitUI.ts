import Main from "../SILVIC";


// #4
export default function initUI() {

  const IRIS = {
    Base: document.getElementById('ui-base') as HTMLObjectElement,
    Rotary: {
      Zone: document.getElementById('ui-rotary-zone') as HTMLObjectElement,
      Selector: document.getElementById('ui-rotary-selector') as HTMLObjectElement,
      Dial: document.getElementById('ui-rotary-dial') as HTMLObjectElement,
    },
  };

  // Set toggling for static UI components
  IRIS.Rotary.Zone.style.opacity = '0';
  IRIS.Rotary.Selector.style.opacity = '0';
  IRIS.Rotary.Dial.style.opacity = '0';

  // Logic for moving UI components

  // Uses HTML Overlays in Cesium to control location and scaling of datapoint tags

  // Call Main() in SILVIC
  Main();
}