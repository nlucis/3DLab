// import * as Cesium from 'cesium';
import * as Phaser from 'phaser';
import initRendering from './modules/InitRendering';
import PhaserConf from './configs/PhaserConf';

// Globals
const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const cx = winWidth / 2;
const cy = winHeight / 2

// 2D Context
export const renderTarget = new OffscreenCanvas(winWidth, winHeight);
renderTarget.oncontextlost = (ctx) => {};
renderTarget.oncontextrestored = (ctx) => {};
const context2D = renderTarget.getContext('2d');


// Using Phaser because despite being a game engine, it does everything I need and more
window.addEventListener('DOMContentLoaded', async () => {


  class boot extends Phaser.Scene {
    constructor() {
      super('scene');  ;
    }

    init(): void {
      this.cameras.main.centerOn(0, 0);
      this.cameras.main.setBackgroundColor(0x1A1A27);
    }

    create(): void {
      const image =this.add.image(0, 0, 'untitled').setOrigin();
      this.events.on('update', () => {
        // image.x++;
      });
      console.debug(image);
    }

    update(): void {}

    // Use readSVG to break apart the layout into it's component elements then load them into phaser's cache
    preload(): void {
        const metaDevice = this.load.svg('untitled', 'assets/svgs/nu-interactron.svg', {
          scale: 10
        });
        console.debug(metaDevice);
    }
  }

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const cx = winWidth / 2;
const cy = winHeight / 2;

  // Views
  const App = new Phaser.Game({...PhaserConf, 

    // @ts-ignore | Phaser absolutely does support offscreen canvas, but the typedefs dont reflect this
    context: context2D as CanvasRenderingContext2D,

    width: winWidth,
    height: winHeight,
    scene: [
      boot
    ],
  });

  initRendering(App);
});