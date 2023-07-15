import initUI from "./InitUI";
import * as THREE from 'three';
;
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import {EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { onAnimate } from "..";

export let Camera: THREE.PerspectiveCamera;
export let Renderer: THREE.WebGLRenderer;
export const Scene: THREE.Scene = new THREE.Scene();
export const meshes: THREE.Mesh[] = [];


// #3
export default function init3D() {
  const target = document.getElementById('target') as HTMLCanvasElement;

  // Lights..., 
  Renderer = new THREE.WebGLRenderer({ canvas: target, alpha: true });
  Renderer.setSize(window.innerWidth, window.innerHeight);
  // Renderer.setPixelRatio(window.devicePixelRatio);
  // Renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Renderer.toneMappingExposure = 3;
  Renderer.setClearColor(0x000000, 0)

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

    // Alpha & Omega arms
  const gArms = new THREE.CapsuleGeometry(0.24, 12);
  const mArms = new THREE.MeshPhysicalMaterial({
    color: 0xFF6C11,
    emissive: 0xFF6C33,
    emissiveIntensity: 0.64,
    transparent: true,
    opacity: 1
  });
  const mRays = new THREE.MeshBasicMaterial();
  const AlphaArm = new THREE.Mesh(gArms, mRays);
  const OmegaArm = new THREE.Mesh(gArms, mRays);
  OmegaArm.position.set(0, -16 - 6, 0);
  AlphaArm.position.set(0, +16 + 6, 0);

  // IRIS Ring
  const gIRIS = new THREE.TorusGeometry(11, 1, 64, 64);
  const mIRIS = new THREE.MeshBasicMaterial({
    name: 'IRIS',
    opacity: 1.2,
    color: 0xFEECEE,
    transparent: true,
    side: THREE.DoubleSide,
    dithering: true
  });
  
  const IRIS = new THREE.Mesh(gIRIS, mIRIS);

    // Visualizer ring for the orbital zone | overlaps with the centroid UI
  let r = 12;
  let w = 0.6;
  const gOrbitalZone = new THREE.RingGeometry(12.3, 12.7, 64, 64);
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
  const gPoints = new THREE.IcosahedronGeometry(1400, 36);
  const mPoints = new THREE.PointsMaterial({
    name: 'point-sphere',
    color: 0xFFFFFF,
    size: 0.1,
    opacity: 1.0,
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
    // GridPoints.rotation.x += 0.006;
    GridPoints.rotation.y -= 0.003;
    // GridPoints.rotation.z += 0.009;
  });

  GridPoints.position.set(Camera.position.x, Camera.position.y, Camera.position.z);
  Scene.add(GridPoints);

  // GridPoints.scale.set(0.4, 0.4, 0.4);

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
  const mInteractible = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    // opacity: 0.64,
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
  // Scene.add(TestInteractible);

  // Backdrop hemisphere
  const gBackdrop = new THREE.SphereGeometry(13.5, 64, 64);
  const mBackdrop = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    // transparent: true,
    // opacity: 0.93
  });

  const Backdrop = new THREE.Mesh(gBackdrop, mBackdrop);
  // Scene.add(Backdrop);

  // const overlayTex = new THREE.CanvasTexture(overlay.view as OffscreenCanvas);

  // Convert the Cesium globe canvas to a texture for layering as well
  const cesiumTex = new THREE.CanvasTexture(window['geomapCanvas']);

  // Post-Processing
  const composer = new EffectComposer(Renderer);
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(1000, 1000), 
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

  /* NOTE: clear alphas must be a value less than 1 or the TAA pass wont show */
  composer.addPass(new TAARenderPass(Scene, Camera, 0x000000, 1.0));
  composer.addPass(new TexturePass(cesiumTex, 0.36));
  // composer.addPass(new TexturePass(overlayTex, 0.99));
  composer.addPass(bloom);
  // composer.addPass(scan);
  // composer.addPass(afterImage);
  composer.addPass(smaa);

  onAnimate.push(() => {
    // Camera.updateProjectionMatrix();

    cesiumTex.needsUpdate = true;
    // overlayTex.needsUpdate = true;

    // overlay.render();
    composer.render();
  });

  // Chain #4
  initUI();
}