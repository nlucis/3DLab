import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { 
  HalftonePass, 
  HalftonePassParameters 
} from 'three/examples/jsm/postprocessing/HalftonePass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

import * as GeometryUtils from 'three/examples/jsm/utils/GeometryUtils';

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
  Renderer.toneMappingExposure = 0.8;


  // camera...
  Camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1e-1, 1e+3);
  Camera.position.set(0, 0, -100);

  // Scene...

  // Tints entire scene color to red for nighttime
  let redShiftMode = false;
  if (redShiftMode) {
    Scene.fog = new THREE.FogExp2( 0xFF0000, 0.012 );
    Scene.background = new THREE.Color(0, 0, 0);
  } else {
    Scene.background = new THREE.Color(0.024, 0.012, 0.024);
  }
  
  // Lights
  const lAmbient = new THREE.AmbientLight(0xAC9CEF, 36);
  Scene.add(
    lAmbient, 
  );

  // IRIS Ring
  const gIRIS = new THREE.TorusGeometry(12, 1, 64, 64);
  const mIRIS = new THREE.MeshPhysicalMaterial({
    name: 'contactRing',
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
    emissiveIntensity: 0.36,
  });
  const AlphaArm = new THREE.Mesh(gArms, mArms);
  const OmegaArm = new THREE.Mesh(gArms, mArms);
  AlphaArm.position.set(0, +16 + 6, 0);
  OmegaArm.position.set(0, -16 - 6, 0);

  const statics = new THREE.Group();
  statics.add(IRIS, AlphaArm, OmegaArm);
  onAnimate.push(() => statics.lookAt(Camera.position));
  Scene.add(statics);



  // Info Sphere - Point Grid
  const gPoints = new THREE.IcosahedronGeometry(9, 12);
  const mPoints = new THREE.PointsMaterial({
    name: 'point-sphere',
    color: redShiftMode ? 0xF27F4C : 0x7C7C7C,
    size: 0.1,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  // // Info Sphere - Blue Shell
  const gSphere = new THREE.SphereGeometry(9, 36, 36);
  const mSphere = new THREE.MeshPhysicalMaterial({
    name: 'sphere',
    opacity: 0.36,
    color: 0x2A1CAF,
    transparent: true,

    emissive: 0xFFFFFF,
    emissiveIntensity: 0.24,
    
  // a slight clearcoat creates a softened edge that works well with bloom
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    transmission: 0.6,
    side: THREE.BackSide
  });
  const Sphere = new THREE.Mesh(gSphere, mSphere);
  onAnimate.push(() => Sphere.lookAt(Camera.position));

  let opacityMax = 3.0;
  let opacityMin = 0.3;

  // Simulate vox flashing
  setInterval(() => {
    mPoints.opacity = THREE.MathUtils.randFloat(opacityMin, opacityMax);
    mPoints.size = THREE.MathUtils.randFloat(0.3, 0.6);
  }, 64);

  const GridPoints = new THREE.Points(gPoints, mPoints);
  onAnimate.push(() => {
    GridPoints.rotation.x += 0.006;
    GridPoints.rotation.y -= 0.003;
    GridPoints.rotation.z += 0.009;
  });
  Scene.add(
    GridPoints,
    Sphere
  );
  // Use this to get the actual vertex positions of the mesh's geometry
  // const vertices = <number[]> gPoints.getAttribute('position').array;
  // const pointVectors = <THREE.Vector3[]> [];


  // Post-Processing & FX
  const composer = new EffectComposer(Renderer);
  composer.addPass(new TAARenderPass(Scene, Camera, 0xFFFFFF, 1));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(), 
    /* Strength */0.369, 
    /* Radius   */0.222, 
    /* Threshold*/0.001
  );
  const afterImage = new AfterimagePass(0.6);
  const smaa = new SMAAPass(window.innerWidth, window.innerHeight);
  const crt = new FilmPass(0.6, 0.3, (window.innerHeight / 2) * 3, 0);
  
  composer.addPass(bloom);
  composer.addPass(crt);
  composer.addPass(afterImage);
  composer.addPass(smaa);

  // Touch & Click recognition
  const controls = new OrbitControls(Camera, composer.renderer.domElement);
  controls.target // how does one set this??

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
  
  controls.getDistance
  controls.getPolarAngle
  controls.getAzimuthalAngle
  controls.maxPolarAngle
  controls.maxAzimuthAngle
  controls.rotateSpeed
  
  controls.touches
  controls.mouseButtons

  // Action!
  const render = () => {
    requestAnimationFrame(render);
    onAnimate.forEach(cb => cb());
    composer.render();
  };
  render();
});