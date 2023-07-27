import Main from "../SILVIC";
import { Ticker } from 'pixi.js';
import { SVGScene } from '@pixi-essentials/svg';
import { PlaceWaypoint, gotoPosition } from "./Space";
import { Type } from "typescript";
import UIComponent from "../components/UIComponent";
import { generateUUID } from "three/src/math/MathUtils";

import {
  openDB,
  DBSchema,
  IDBPDatabase
} from 'idb';


const readSVG = async (uri: string) => {return await SVGScene.from(uri)};

export const UIComponents = {
  TextDisplay: {
    main: <UIComponent | undefined> undefined,
    DialogueText: <UIComponent | undefined> undefined,
    EditorMode: <UIComponent | undefined> undefined,
    Timestamp: <UIComponent | undefined> undefined,
    TextWindow: <UIComponent | undefined> undefined,
  },
  Scrollbar: {
    main: <UIComponent | undefined> undefined,
    Scroller: <UIComponent | undefined> undefined,
    ToTop: <UIComponent | undefined> undefined,
    ToBot: <UIComponent | undefined> undefined,
  },
  Keypad: {
    main: <UIComponent | undefined> undefined,
    KeypadToggle: <UIComponent | undefined> undefined,
    CloseKeypad: <UIComponent | undefined> undefined,
    RowTop: {
      Key_P: <UIComponent | undefined> undefined,
      Key_O: <UIComponent | undefined> undefined,
      Key_I: <UIComponent | undefined> undefined,
      Key_U: <UIComponent | undefined> undefined,
      Key_Y: <UIComponent | undefined> undefined,
      Key_T: <UIComponent | undefined> undefined,
      Key_R: <UIComponent | undefined> undefined,
      Key_E: <UIComponent | undefined> undefined,
      Key_W: <UIComponent | undefined> undefined,
      Key_Q: <UIComponent | undefined> undefined,
    },
    RowMid: {
      Key_L: <UIComponent | undefined> undefined,
      Key_K: <UIComponent | undefined> undefined,
      Key_J: <UIComponent | undefined> undefined,
      Key_H: <UIComponent | undefined> undefined,
      Key_G: <UIComponent | undefined> undefined,
      Key_F: <UIComponent | undefined> undefined,
      Key_D: <UIComponent | undefined> undefined,
      Key_S: <UIComponent | undefined> undefined,
      Key_A: <UIComponent | undefined> undefined,
    },
    RowBot: {
      Key_M: <UIComponent | undefined> undefined,
      Key_N: <UIComponent | undefined> undefined,
      Key_B: <UIComponent | undefined> undefined,
      Key_V: <UIComponent | undefined> undefined,
      Key_C: <UIComponent | undefined> undefined,
      Key_X: <UIComponent | undefined> undefined,
      Key_Z: <UIComponent | undefined> undefined,
    },
    RowMod: {
      Enter: <UIComponent | undefined> undefined,
      Delete: <UIComponent | undefined> undefined,
      Comma: <UIComponent | undefined> undefined,
      Stop: <UIComponent | undefined> undefined,
      Space: <UIComponent | undefined> undefined,
    }
  },
  Visualizer: {
    Window: <UIComponent | undefined> undefined,
    Oculum: <UIComponent | undefined> undefined,
  },
  Dialer: {
    main: <UIComponent | undefined> undefined,
    RotaryDial: {
      main: <UIComponent | undefined> undefined,
      Video: <UIComponent | undefined> undefined,
      Node: <UIComponent | undefined> undefined,
      Audio: <UIComponent | undefined> undefined,
      Beacon: <UIComponent | undefined> undefined,
      Image: <UIComponent | undefined> undefined,
      Tasklist: <UIComponent | undefined> undefined,
      defaultActive: "Video"
    },
    IRIS: {
      main: <UIComponent | undefined> undefined,
      Cancel: <UIComponent | undefined> undefined,
    },
  },
  DataWaypointCreator: {
    main: <UIComponent | undefined> undefined,
    Reticle: {
      main: <UIComponent | undefined> undefined,
      ReticleLeft: <UIComponent | undefined> undefined,
      ReticleRight: <UIComponent | undefined> undefined,
    },
    AddButton: <UIComponent | undefined> undefined,
    FinalizeAdd: {
      main: <UIComponent | undefined> undefined,
      Cancel: <UIComponent | undefined> undefined,
      Accept: <UIComponent | undefined> undefined,
    }
  },
  ModeChange: {
    ModeList: {
      main: <UIComponent | undefined> undefined,
      Routines: <UIComponent | undefined> undefined,
      Reminders: <UIComponent | undefined> undefined,
      Queries: <UIComponent | undefined> undefined,
      Notes: <UIComponent | undefined> undefined,
      Dialogue: <UIComponent | undefined> undefined,
    },
    ActiveModeFrame: <UIComponent | undefined> undefined,
  },
  StateSwitches: {
    main: <UIComponent | undefined> undefined,
    Messages: {
      main: /* MessagesIcon */ <UIComponent | undefined> undefined,
      NewMessageIndicator: <UIComponent | undefined> undefined,
      MessageTypes: {
        main: <UIComponent | undefined> undefined,
        AudioFile: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        },
        MemeLog: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        },
        GameInvite: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        },
        GatheringInvite: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        },
        SecretMessage: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        },
        PenPals: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        },
        LoveLetter: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        },
        DataFile: {
          main: <UIComponent | undefined> undefined,
          newMessage: <UIComponent | undefined> undefined,
        }
      }
    },
    GyroscopeToggle: <UIComponent | undefined> undefined,
    GeomapToggle: <UIComponent | undefined> undefined,
    Config: <UIComponent | undefined> undefined,
    Connections: <UIComponent | undefined> undefined,
    PromptConsole: <UIComponent | undefined> undefined,
  },
  Interactron: <UIComponent | undefined> undefined,
};

// #4
export default function initUI() {

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  let textDisplay: UIComponent;

  // Load the IRIS template SVG and parse it's structure for sub-elements and their properties then serialize them 
  // into the client-user's local DB
  readSVG('public/assets/svgs/base/IRIS_All.svg').then(async svgData => {
    const UI = svgData.content;

    Array.from(UI.children as HTMLCollection).forEach(UILayer => {

      // Get, set, and save the state of the personal UI
      class Part {
        private _name: string;
        public getName(): string {return this._name};
        public properties: {[key:string]: string} = {};
        public setProperty(propertyName: string, value: string): typeof this.properties {
          this.parseProperties(this.domElement);
          const hasProp = Object.keys(this.properties).includes(propertyName);
          if (hasProp) {
            this.domElement.setAttribute(propertyName, `${value}`);
          }
          return this.properties;
        }
        public getProperties(): typeof this.properties {
          this.parseProperties(this.domElement);
          return this.properties;
        }
        public domElement: SVGGElement | SVGAElement;

        protected setName(to: string): string | false {
          this._name = to;
          return this._name || false;
        }
        public parseProperties = (partData: SVGAElement | SVGGElement) => {
          partData.getAttributeNames().forEach(name => {
            if (
              name != 'clip-path' &&
              name != 'clip-rule' && 
              name != 'filter'    &&
              name != 'id'        &&
              !name.includes('vectornator:')
            ) {
              this.properties[name] = `${partData.getAttribute(name)}`;
            }
          });
          return this.properties;
        }
        constructor (partData: SVGAElement | SVGGElement) {
          this.domElement = partData;
          this._name = partData.getAttribute('vectornator:layerName') || 'Unknown';
          this.parseProperties(partData);
        }
      };

      class UIStateComponent {
        private _id: string | false;
        public domElement: SVGGElement | SVGAElement;
        public getId(): string {
          return this._id;
        }
        protected setId(ID: string): string | false {
          // if (AUTHORITY_TO_CHANGE) { /* Update the IndexDB entry */ return true; }
          this._id = ID;
          return this._id;
        }
        private _name: string | null;
        public getName(): string {
          if (this._name === null) {
            this._name = 'Unknown';
          }
          return this._name;
        };
        protected setName(name: string): string | false {this._name = name ; return this._name};

        public parts: Part[] = [];

        public setProperty(prop: string, value: string): void {
          this.domElement.setAttribute(prop, value);
        }

        constructor(ID: string, domElement: SVGGElement | SVGAElement) {
          this.domElement = domElement;
          if (ID === '' || ID === null || ID === undefined) {
            this._id = generateUUID();
          } else {
            this._name = ID;
            let newID = '';
            Array.from(ID).forEach((charVal: string, charNum: number) => {
              newID += `${
                charNum === 0 ? charVal.toLocaleLowerCase() 
                : (charVal === Array.from(ID)[charNum].toLocaleLowerCase()) ? charVal 
                  : `-${charVal.toLocaleLowerCase()}`
              }`;
              this._id = newID;
            });
          }
            const foundLayerName = domElement.getAttribute('vectornator:layerName') || domElement.getAttribute('id');
            if (foundLayerName) this._name = foundLayerName;
            else this._name = 'Unknown';
            
            Array.from(domElement.children).forEach(childElement => {
              const part = new Part(childElement as SVGGElement | SVGAElement | SVGPathElement);
              part.parseProperties(part.domElement);
              if (part.getName() !== 'Unknown') this.parts.push(part);
            });
        }
      }
      const comp = new UIStateComponent(UILayer.id, UILayer as SVGAElement | SVGGElement);

      // Set default states
      comp.parts.forEach(part => {
        const compName = comp.getName();
        const partName = part.getName();
        console.debug(compName, partName);
        if (partName == 'ModeList') {
          part.domElement.setAttribute('style', 'opacity: 0;');
        }
        if (
          compName == 'TextWindow' ||
          compName == 'Keypad'
        ) {
          comp.setProperty('style', 'opacity: 0;');
        }
        if (compName == 'PlaceWaypoint') {
          console.debug(partName, part);
          if (partName == 'Finalize') {
            part.domElement.setAttribute('style', 'opacity: 0;');
          }
          part.setProperty('style', 'opacity: 0;');
        }
        if (compName == 'Interactron') {
          if (part.getName() == 'ActiveState') {
            part.domElement.setAttribute('style', 'opacity: 0;');
          }
        }
        if (compName == 'WaypointType') {
          comp.setProperty('style', 'opacity: 0;');
        }

        
      });
    });

    // Add the IRIS UI to the DOM
    document.getElementById('UI')?.appendChild(UI);
  });
  let finalizeEnabled: boolean = false;

  // Call Main() in SILVIC
  Main();
}