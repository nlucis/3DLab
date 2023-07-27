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
      class UIStateComponent {
        private _id: string | false;
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

        constructor(ID?: string, domElement?: SVGGElement | SVGAElement) {
          if (!ID) {
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

          if (domElement) {
            const foundLayerName = domElement.getAttribute('vectornator:layerName') || undefined;
            if (foundLayerName) this._name = foundLayerName;
            else this._name = 'Unknown';
          }
        }
      }

      const comp = new UIStateComponent(UILayer.id, UILayer as SVGAElement | SVGGElement);
      console.debug(comp);
    });

    // Add the IRIS UI to the DOM
    document.getElementById('UI')?.appendChild(UI);

    // Create a list of all the target component keys
    const componentNames: string[] = [];
    const getKeys = async (fromObject: any, addTo?: string[]) => {
      const keys = addTo || [];
      return keys;
    };
    getKeys(UIComponents, componentNames).then(async () => {

      const gNodes = document.getElementsByTagName('g');
      const pathNodes = document.getElementsByTagName('path');

      const parseNodes = (nodes: HTMLCollectionOf<SVGGElement | SVGPathElement>) => {
        Array.from(nodes).forEach(node => {
          const nodeName = node.getAttribute('vectornator:layerName');
          if (nodeName !== null && componentNames.includes(nodeName)) {

            // Top-Level components
            if (UIComponents[nodeName] !== undefined) {
              UIComponents[nodeName]['main'] = new UIComponent(node);
            } 
              
            // Nested components
            else {
              const topLevel = Object.keys(UIComponents);
              topLevel.forEach(key => {
                if (UIComponents[key] && Object.keys(UIComponents[key]).includes(nodeName)) {
                  UIComponents[key][nodeName] = new UIComponent(node);
                }
              });
            }
          }
        })
      };

      parseNodes(gNodes);
      parseNodes(pathNodes);
    });
  })
  
  // Setup the default state for each component
  .then(() => {
    UIComponents.Dialer.main?.setOpacity(0.0);
    UIComponents.Keypad.main?.setOpacity(0.0);
    UIComponents.TextDisplay.main?.setOpacity(0.0);
    UIComponents.Visualizer.Oculum?.setOpacity(0.0);

    // TODO: this works but shouldn't; fix population logic to resolve issue
    // UIComponents.DataWaypointCreator.FinalizeAdd.setOpacity(0.0);
    const addButton = UIComponents.DataWaypointCreator.AddButton?.getDomElement();
    if (addButton) addButton.style.pointerEvents = 'all';
    addButton?.addEventListener('pointerdown', pd => {
      PlaceWaypoint();
    });

    // TODO: this too must be fixed
    const stateSwitches = UIComponents.StateSwitches.main?.getDomElement();
    if (stateSwitches) {
      Array.from(stateSwitches.children as HTMLCollection).forEach(child => {
        console.debug(child.getAttribute('vectornator:layerName'));
        if (child.getAttribute('vectornator:layerName') === 'GyroscopeAndGeomap') {
          Array.from(child.children as HTMLCollection).forEach(subChild => {
            if (subChild.getAttribute('vectornator:layerName') === 'GeomapTpggle') {
              // subChild.style.pointerEvents = 'all';
              subChild.addEventListener('pointerdown', pd => {gotoPosition()});
            }
          });
        }
      });
    }

    // TODO: this also needs to be fixed
    // const messagesGroup = UIComponents.StateSwitches.Messages.getDomElement() as SVGGElement | SVGPathElement;
    // Array.from(messagesGroup.children as HTMLCollection).forEach(child => { 
    //   const subElementName = child.getAttribute('vectornator:layerName');
    //   if (subElementName === 'MessageTypes' || subElementName === 'NewMessageIcon') {
    //     // child.style.opacity = '0';
    //   }
    // });

    // TODO: this also needs to be fixed
    // UIComponents.ModeChange.ModeList.setOpacity(0.0);
  });

  let finalizeEnabled: boolean = false;

  // Call Main() in SILVIC
  Main();
}