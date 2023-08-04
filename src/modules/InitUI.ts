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

class TextWindow {
  private TextFrame: SVGAElement | SVGGElement | SVGPathElement | SVGUseElement;
  private self: SVGAElement | SVGGElement | SVGPathElement;
  public isVisible: boolean = false;
  public toggleVisibility(): void {
    console.debug(this.isVisible);
    this.isVisible = !this.isVisible;
    this.self.setAttribute('style', `'opacity: ${this.isVisible ? 1 : 0};`)
    this.self.style.opacity = `${this.isVisible ? 1 : 0};`;
  }
  constructor(domElement: SVGAElement | SVGGElement | SVGPathElement) {
    this.self = domElement;
    const textFrame = Array.from(domElement.children).filter(child => {
      return (child.getAttribute('vectornator:layerName') == 'TextFrame')
    })[0];
    this.TextFrame = textFrame as SVGUseElement;
    domElement.style.opacity = '0';
  }
}


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
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  console.debug(
    `\nWindow Width:`, windowWidth, 
    `\nWindow Height:`, windowHeight, 
    `\nCX:`, centerX, 
    `\nCY:`, centerY
  );
  let textDisplay: UIComponent;

  // Load the IRIS template SVG and parse it's structure for sub-elements and their properties then serialize them 
  // into the client-user's local DB

  /* -- Load Base UI according to display orientation */
    readSVG(`public/assets/svgs/base/MinimalUI.svg`).then(async svgData => {
      const UI = svgData.content;

      // Extract props for rebuilding layout components
      let x = 0;
      let y = 0;
      let elWidth = windowWidth;
      let elHeight = windowHeight;
      const viewBox = `${centerX} ${centerY} ${elWidth} ${elHeight}`;
      UI.setAttribute('viewBox', viewBox);

      const mainLayout = UI.getElementById('Layer-1');
      const usageSpinner = (
        Array
        .from(mainLayout?.children as HTMLCollection)
        .filter(child => {if (child.getAttribute('vectornator:layerName') === 'UsageSpinner') return child})[0] as SVGElement
      );

      document.getElementById('UI')?.appendChild(UI);
    });


  // Main Loop in SILVIC
  animate();
  Main();
}

const animations: Function[] = [];
const animate = () => {
  animations.forEach(anim => anim());
  requestAnimationFrame(animate);
};