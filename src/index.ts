import * as THREE from 'three';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
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

  // Lights...
  Renderer = new THREE.WebGLRenderer({ canvas: target, alpha: false, antialias: true });
  Renderer.setPixelRatio(window.devicePixelRatio);
  Renderer.setSize(window.innerWidth, window.innerHeight);
  Renderer.toneMapping = THREE.CineonToneMapping;
  Renderer.toneMappingExposure = 1.36;

  // camera...
  Camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1e-1, 1e+3);
  Camera.position.set(0, 0, -100);
  Scene.background = new THREE.Color(0.024, 0.012, 0.024);

  // IRIS Ring
  const gIRIS = new THREE.TorusGeometry(12, 1, 64, 64);
  const mIRIS = new THREE.MeshPhysicalMaterial({
    name: 'IRIS',
    opacity: 0.72,
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

  // Alpha & Omega arms
  const gArms = new THREE.CapsuleGeometry(0.3, 16);
  const mArms = new THREE.MeshPhysicalMaterial({
    color: 0xFF6C11,
    emissive: 0xFFAC00,
    emissiveIntensity: 0.64,
  });
  const AlphaArm = new THREE.Mesh(gArms, mArms);
  const OmegaArm = new THREE.Mesh(gArms, mArms);
  AlphaArm.position.set(0, +16 + 6, 0);
  OmegaArm.position.set(0, -16 - 6, 0);

  onAnimate.push(() => {
    IRIS.lookAt(Camera.position);
  });
  Scene.add(
    IRIS, 
  );

  // Info Sphere - Point Grid
  const gPoints = new THREE.IcosahedronGeometry(9, 12);
  const mPoints = new THREE.PointsMaterial({
    name: 'point-sphere',
    color: 0x7C7C7C,
    size: 0.1,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  let opacityMax = 3.0;
  let opacityMin = 0.3;

  // Simulate vox flashing
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

  // Visualizer ring for the orbital zone | overlaps with the centroid UI
  let r = 14.2;
  let w = 0.6;
  const gOrbitalZone = new THREE.RingGeometry(r - w, r, 64, 64);
  const OrbitalZone = new THREE.Mesh(gOrbitalZone, mArms);
  onAnimate.push(() => OrbitalZone.lookAt(Camera.position));

  // Orbital Zone - point sphere cloud where dynamic interactibles are added and displayed | since it is just a list of points, no material or mesh is needed
  const gOrbitalSphere = new THREE.IcosahedronGeometry(w + (r * 1.2), 1);
  const rawCoords = <number[]> gOrbitalSphere.getAttribute('position').array;
  const vecCoords = <THREE.Vector3[]> [];
  for (let n = 0; n < rawCoords.length / 3; n += 3) vecCoords.push(new THREE.Vector3(rawCoords[n+0], rawCoords[n+1], rawCoords[n+2]));

  Scene.add(OrbitalZone);
  
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


  // Post-Processing & FX
  const composer = new EffectComposer(Renderer);

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(), 
    /* Strength */0.369, 
    /* Radius   */0.222, 
    /* Threshold*/0.012
  );
  const afterImage = new AfterimagePass(0.72);
  const smaa = new SMAAPass(window.innerWidth, window.innerHeight);
  composer.addPass(new TAARenderPass(Scene, Camera, 0xFFFFFF, 0.5));
  composer.addPass(bloom);
  composer.addPass(afterImage);
  composer.addPass(smaa);

  // Touch & Click recognition
  const controls = new ArcballControls(Camera, composer.renderer.domElement, Scene);
  controls.setGizmosVisible(false);

  // Capture pointer events
  controls.addEventListener('pointerup', p => {});
  controls.addEventListener('pointerdown', p => {});
  controls.addEventListener('pointermove', p => {});

  // Capture touch events
  controls.addEventListener('touchstart', t => {});
  controls.addEventListener('touchmove', t => {});
  controls.addEventListener('touchend', t => {});

  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = true;

  // Action!
  const render = () => {
    requestAnimationFrame(render);
    onAnimate.forEach(cb => cb());
    composer.render();
  };
  render();
});