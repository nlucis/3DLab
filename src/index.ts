// import * as Cesium from 'cesium';
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import {EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';


export let Camera: THREE.PerspectiveCamera;
export let Renderer: THREE.WebGLRenderer;
export const Scene: THREE.Scene = new THREE.Scene();
export const meshes: THREE.Mesh[] = [];
export const onAnimate: {(): void}[] = [];

window.addEventListener('DOMContentLoaded', () => {
  const target = document.getElementById('target') as HTMLCanvasElement;

  // Lights..., 
  Renderer = new THREE.WebGLRenderer({ canvas: target, alpha: true, antialias: true });
  Renderer.setClearAlpha(1);

  Renderer.setPixelRatio(window.devicePixelRatio);
  Renderer.setSize(window.innerWidth, window.innerHeight);
  Renderer.toneMapping = THREE.CineonToneMapping;
  Renderer.toneMappingExposure = 1.36;

  // camera...
  Camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1e-1, 1e+3);
  Camera.position.set(0, 0, -100);

  // controls...
  const controls = new ArcballControls(Camera, target, Scene);
  controls.camera = Camera;
  controls.setTbRadius(0.3);
  controls.radiusFactor = 120;
  controls.enableAnimations = true;
  controls.setGizmosVisible(false);

  // Allow rotation only
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = true;

  // IRIS Ring
  const gIRIS = new THREE.TorusGeometry(12, 1, 64, 64);
  const mIRIS = new THREE.MeshPhysicalMaterial({
    name: 'IRIS',
    opacity: 0.64,
    color: 0xFFECEE,
    transparent: true,

    emissive: 0xFFFFFF,
    emissiveIntensity: 0.24,

    clearcoat: 1,
    clearcoatRoughness: 0.72,
    transmission: 0.36,
    side: THREE.DoubleSide,
    thickness: 20,
  });
  const IRIS = new THREE.Mesh(gIRIS, mIRIS);
  const gOculum_Edge = new THREE.BoxGeometry(1.3, 1.3, 1.3, 3, 3, 3);
  const gOculum_Core = new THREE.BoxGeometry(0.6, 0.6, 0.6, 3, 3, 3);
  const mOculum_Edge = new THREE.MeshBasicMaterial({ color: 0x00ACFF, transparent: true, opacity: 0.72, side: THREE.BackSide });
  const mOculum_Core = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
  const oculumEdge = new THREE.Mesh(gOculum_Edge, mOculum_Edge);
  const oculumCore = new THREE.Mesh(gOculum_Core, mOculum_Core);

  // const Oculum = new InteractiveGroup(Renderer, Camera).add(oculumEdge, oculumCore);
  // Oculum.rotation.z = THREE.MathUtils.degToRad(180);
  Scene.add(oculumCore, oculumEdge);

  // Alpha & Omega arms
  const gArms = new THREE.CapsuleGeometry(0.12, 16);
  const mArms = new THREE.MeshPhysicalMaterial({
    color: 0xFF6C11,
    // emissive: 0xFF6C33,
    emissive: 0x72FF6C,
    emissiveIntensity: 0.64,
    transparent: true,
    opacity: 0.64
  });
  const AlphaArm = new THREE.Mesh(gArms, mArms);
  const OmegaArm = new THREE.Mesh(gArms, mArms);
  OmegaArm.position.set(0, -16 - 6, 0);
  AlphaArm.position.set(0, +16 + 6, 0);


    // Visualizer ring for the orbital zone | overlaps with the centroid UI
  let r = 14.2;
  let w = 0.6;
  const gOrbitalZone = new THREE.RingGeometry(r - w, r, 64, 64);
  const OrbitalZone = new THREE.Mesh(gOrbitalZone, mArms);

  const staticOrbit = new THREE.Group();
  staticOrbit.add(
    AlphaArm,
    OrbitalZone,
    OmegaArm
  );

  onAnimate.push(() => {
    IRIS.lookAt(Camera.position);
    staticOrbit.lookAt(Camera.position);
    staticOrbit.rotation.set(Camera.rotation.x, Camera.rotation.y, Camera.rotation.z);
  });
  Scene.add(IRIS, staticOrbit);

  // Info Sphere - Point Grid
  const gPoints = new THREE.IcosahedronGeometry(9, 12);
  const mPoints = new THREE.PointsMaterial({
    name: 'point-sphere',
    color: 0x7C7C7C,
    size: 0.1,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  // Simulate vox flashing
  // let opacityMax = 3.0;
  // let opacityMin = 0.3;
  // setInterval(() => {
  //   mPoints.opacity = THREE.MathUtils.randFloat(opacityMin, opacityMax);
  //   mPoints.size = THREE.MathUtils.randFloat(0.3, 0.6);
  // }, 64);

  const GridPoints = new THREE.Points(gPoints, mPoints);
  onAnimate.push(() => {
    GridPoints.rotation.x += 0.006;
    GridPoints.rotation.y -= 0.003;
    GridPoints.rotation.z += 0.009;
  });
  Scene.add(GridPoints);


  // Centroid - Selection ring that an interactible aligns with to be slid off the orbital and into a slot stack
  // Slot Stacks - where interactibles are sorted and ordered in a vertical linear fashion, or discarded

  // Orbital Zone - point sphere cloud where dynamic interactibles are added and displayed | since it is just a list of points, no material or mesh is needed
  const gOrbitalSphere = new THREE.IcosahedronGeometry(w + (r * 1.2), 1);
  const rawCoords = <number[]> gOrbitalSphere.getAttribute('position').array;
  const vecCoords = <THREE.Vector3[]> [];
  for (let n = 0; n < rawCoords.length / 3; n += 3) vecCoords.push(new THREE.Vector3(rawCoords[n+0], rawCoords[n+1], rawCoords[n+2]));
  
  // Interactibles - Discrete visual representations of various data - text, images, videos, sound files, or maps
  const TestInteractible = new THREE.Group();
  const gTestInteract_Inner = new THREE.CircleGeometry(0.6, 64);
  const gTestInteract_Outer = new THREE.RingGeometry(0.9, 1.3, 64, 64);
  const mInteractible = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    emissive: 0xFFFFFF,
    emissiveIntensity: 9,
    transparent: true,
    opacity: 1.2,
    transmission: 0.369
  });
  const gInteractBG = new THREE.CircleGeometry(1.6 + 0.3, 64);
  const mInteractBG = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const InteractibleInner = new THREE.Mesh(gTestInteract_Inner, mInteractible);
  const InteractibleOuter = new THREE.Mesh(gTestInteract_Outer, mInteractible);
  const InteractibleBackground = new THREE.Mesh(gInteractBG, mInteractBG);

  // z-ordering
  InteractibleInner.position.setZ(2);
  InteractibleOuter.position.setZ(1);
  InteractibleBackground.position.setZ(0);
  TestInteractible.add(
    InteractibleInner,
    InteractibleOuter,
    InteractibleBackground,
  );

  // Ensure that the visible side is always facing the camera
  const posID = 0;
  onAnimate.push(() => {
    TestInteractible.position.set(vecCoords[posID].x, vecCoords[posID].y, vecCoords[posID].z);
    TestInteractible.lookAt(Camera.position);
  });
  Scene.add(TestInteractible);

  // Backdrop hemisphere
  const gBackdrop = new THREE.SphereGeometry(13.5, 64, 64);
  const mBackdrop = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.93
  });

  const Backdrop = new THREE.Mesh(gBackdrop, mBackdrop);
  Scene.add(Backdrop);

  // Draw interactron via Pixi.js for 2D plane alignment
  const overlay = new PIXI.Application({
    antialias: true,
    autoStart: true,
    backgroundAlpha: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    view: new OffscreenCanvas(window.innerWidth, window.innerHeight)
  });

  let isDown = false;
  let inFocus = false;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  // Draw the cursor
  const Cursor = new THREE.Vector2(cx, cy);
  const Interactron = new PIXI.Graphics();

  /* --- Touch & Click handlers --- */
  target.onmouseenter = m => inFocus = true;
  target.onmouseleave = m => inFocus = false;

  target.onmousedown  = () => {isDown = true;  handleClicks()};
  target.onmouseup    = () => {isDown = false; handleClicks()};

  target.ontouchstart = t => {};
  target.ontouchend   = t => {};

  const handleClicks = () => {
    // Handle toggling the text display when center of app is clicked
    if (isDown && textToggle.contains(Cursor.x, Cursor.y)) toggleTextOverlay();
  };

  // Track current pointer position
  const updateCursor   = (mouse: MouseEvent) => { Cursor.set(mouse.clientX, mouse.clientY)};
  window.onmousemove   = updateCursor;
  window.onpointermove = updateCursor;
  target.oncontextmenu = () => {Scene.background = new THREE.Color(0xFF00FF)};
  

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
    const testIblePos = new THREE.Vector3(
      TestInteractible.position.x, 
      TestInteractible.position.y, 
      TestInteractible.position.z
    )
    .project(Camera)
    const projected2D = new THREE.Vector2(testIblePos.x * (window.innerWidth / 2)+cx, (-testIblePos.y * (window.innerHeight / 2)+cy));
    // Test the coordinate conversion
    coordDebug
      .clear()
      .lineStyle(1, 0xFF0000)
      .drawCircle(projected2D.x, projected2D.y, 24)
      .beginFill(0xFF0000)
      .lineStyle(0, 0)
      .drawCircle(projected2D.x, projected2D.y, 6)
      .endFill()
    ;
    debugLabel.x = projected2D.x + (debugLabel.width * 0.2);
    debugLabel.y = projected2D.y - (debugLabel.height * 0.5);

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
  const overlayTex = new THREE.CanvasTexture(overlay.view as OffscreenCanvas);

  // Post-Processing
  const composer = new EffectComposer(Renderer);
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(), 
    /* Strength */0.369, 
    /* Radius   */0.222, 
    /* Threshold*/0.012
  );
  const afterImage = new AfterimagePass(0.72);
  const smaa = new SMAAPass(window.innerWidth, window.innerHeight);
  const scan = new FilmPass(
    0.12,
    0.72,
    window.innerHeight * 2.0,
    0
  );
  composer.addPass(new TAARenderPass(Scene, Camera, 0xFFFFFF, 0.01));
  composer.addPass(new TexturePass(overlayTex, 0.99 /* must be a value less than 1 or the TAA pass wont show */));
  composer.addPass(bloom);
  composer.addPass(afterImage);
  // adding a film pass because who says it can't be a little pretty?
  composer.addPass(scan);
  composer.addPass(smaa);

  // Render loop
  const render = () => {
    requestAnimationFrame(render);
    Camera.updateProjectionMatrix();
    overlayTex.needsUpdate = true;
    onAnimate.forEach(cb => cb());
    overlay.render();
    composer.render();
  };
  render();
});