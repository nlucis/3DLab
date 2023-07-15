import init3D from "./Init3D";
import { onAnimate } from "..";
import * as THREE from "three";
import * as PIXI from 'pixi.js'

// #2
export default function init2D() {

  // Draw interactron via Pixi.js for 2D plane alignment
  const overlay = new PIXI.Application({
    antialias: true,
    autoStart: true,
    backgroundAlpha: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    view: new OffscreenCanvas(window.innerWidth, window.innerHeight)
  });

  const Interactron = new PIXI.Graphics();

  let isDown = false;
  let inFocus = false;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  // Draw the cursor
  const Cursor = new THREE.Vector2(cx, cy);

  /* --- Touch & Click handlers --- */
  // target.onmouseenter = m => inFocus = true;
  // target.onmouseleave = m => inFocus = false;

  // target.onmousedown  = () => {isDown = true;  handleClicks()};
  // target.onmouseup    = () => {isDown = false; handleClicks()};

  // target.ontouchstart = t => {};
  // target.ontouchend   = t => {};

  const handleClicks = () => {
    // Handle toggling the text display when center of app is clicked
    if (isDown && textToggle.contains(Cursor.x, Cursor.y)) toggleTextOverlay();
  };

  // Track current pointer position
  const updateCursor   = (mouse: MouseEvent) => { Cursor.set(mouse.clientX, mouse.clientY)};
  window.onmousemove   = updateCursor;
  window.onpointermove = updateCursor;
  // target.oncontextmenu = () => {Scene.background = new THREE.Color(0xFF00FF)};
  

  let showText = false;
  const textToggle = new PIXI.Circle(cx, cy, 16);
  const toggleTextOverlay = () => {
    console.debug(`toggle ${showText && 'on' || 'off'} text overlay`);
    showText = !showText;
  };

  const coordDebug = new PIXI.Graphics();
  const debugLabel = new PIXI.Text('Test Interactible', {
    align: 'right',
    fontFamily: 'monospace',
    fontSize: '12pt',
    fill: '#FFFFFF',
    dropShadow: true,
    dropShadowDistance: 0,
    dropShadowAlpha: 1,
    dropShadowBlur: 2,
    dropShadowColor: '#000000'
  });
  overlay.stage.addChild(
    coordDebug,
    debugLabel
  );

  onAnimate.push(() => {

    // convert coordinates
    // const testIblePos = new THREE.Vector3(
    //   TestInteractible.position.x, 
    //   TestInteractible.position.y, 
    //   TestInteractible.position.z
    // )
    // .project(Camera)
    // const projected2D = new THREE.Vector2(testIblePos.x * (window.innerWidth / 2)+cx, (-testIblePos.y * (window.innerHeight / 2)+cy));
    // Test the coordinate conversion
    // coordDebug
    //   .clear()
    //   .lineStyle(3, 0xFF3211)
    //   .drawCircle(projected2D.x, projected2D.y, 9)
    //   .beginFill(0xFFFFFF)
    //   .lineStyle(0, 0)
    //   .drawCircle(projected2D.x, projected2D.y, 6)
    //   .endFill()
    // ;
    // debugLabel.x = projected2D.x + (debugLabel.width * 0.2);
    // debugLabel.y = projected2D.y - (debugLabel.height * 0.5);

    // Reset cursor position when pointer leaves the window
    !inFocus && Cursor.set(cx, cy);

    // Set the draw styles
    Interactron.clear();
    Interactron.lineStyle(6, 0xFFFFFF);

    // When clicked down or touched, show the interactron
    if (isDown) {
      Interactron.beginFill(0x229CEF, 0.64);
      Interactron.drawCircle(Cursor.x, Cursor.y, 24);
      Interactron.endFill();
    }
  });

  
  // Convert the Pixi view to a texture for Three to render
  overlay.stage.addChild(Interactron);

  // Chain #3
  init3D();
}