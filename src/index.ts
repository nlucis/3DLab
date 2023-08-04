// import * as Cesium from 'cesium';
import * as Phaser from 'phaser';
import init3D from './modules/Init3D';
import { Scene } from './modules/Init3D';
export const onAnimate: {(): void}[] = [];

export const winWidth = window.innerWidth;
export const winHeight = window.innerHeight;
export const cx = winWidth / 2;
export const cy = winHeight / 2;
export const renderTarget = new OffscreenCanvas(winWidth, winHeight);

// Using Phaser because despite being a game engine, it does everything I need and more
window.addEventListener('DOMContentLoaded', async () => {

    class scene extends Phaser.Scene {
    constructor() {
      super('scene');
    }
    init(): void {
        console.debug('inittin');
        this.cameras.main.setBackgroundColor(0xFFAC00);
    }
      create(): void {}

      update(): void {}

      preload(): void {}
  }

  renderTarget.oncontextlost = (ctx) => {};
  renderTarget.oncontextrestored = (ctx) => {};
  const context2D = renderTarget.getContext('2d');

  console.debug(renderTarget, context2D);
  const app = new Phaser.Game({
    antialias: true,
    antialiasGL: true,
    // audio: {context},
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoMobilePipeline: true,
    autoFocus: true,
    autoRound: true,
    backgroundColor: 0xFFAC00,
    // canvas
    // canvasStyle

    type: Phaser.CANVAS,
    // @ts-ignore | Phaser absolutely does support offscreen canvas, but the typedefs dont reflect this
    context: context2D as CanvasRenderingContext2D,

    callbacks: {
      preBoot: () => {}, 
      postBoot: () => {}
    },

    desynchronized: true,
    disableContextMenu: true,
    // dom
    expandParent: true,
    failIfMajorPerformanceCaveat: true,
    // fullscreenTarget

    // width: winWidth - 12,
    // height: winHeight - 12,

    // images
    // input: 
    // loader
    mode: Phaser.Scale.RESIZE,
    // max
    // min
    // parent
    // pipeline
    physics: {
      default: 'matter',
      matter: {
        "plugins.attractors": true,
        autoUpdate: true,
        constraintIterations: 32,
        debug: true,
        enabled: true,
        gravity: {x: 0, y: 0},
        positionIterations: 32,
        velocityIterations: 32,
      }
    },
    // render
    // scale
    scene: scene,
    transparent: true,
    
    
    title: 'TILLI - Talking Interlocutive Large-Language Interface |',
    version: '0.1\n',
    url: 'https://nlucis.github.io/tilli'
  });
  init3D();
});