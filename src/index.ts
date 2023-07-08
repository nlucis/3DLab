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
  
  // Post-Processing
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
  composer.addPass(smaa);
  composer.addPass(afterImage);
  composer.addPass(crt);
  

  // Attempt at sphere with subsurface scattering
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

  // Lights and FX
  const lAmbient = new THREE.AmbientLight(0xAC9CEF, 36);
  Scene.add(
    Sphere,
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
  onAnimate.push(() => IRIS.lookAt(Camera.position));
  Scene.add(IRIS);

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

  onAnimate.push(() => {
    // AlphaArm.lookAt(IRIS.position);
    AlphaArm.rotation.set(0, 0, 0);
    AlphaArm.position.set(0, +16+6 - Camera.rotation.y, 0);
    // OmegaArm.lookAt(IRIS.position);
  });

  console.debug(
    '\nAlpha Arm - Position:',AlphaArm.position,
    '\nCamera - Position',Camera.position,
    '\nAlpha Arm - Rotation',AlphaArm.rotation,
    '\nCamera - Rotation',Camera.rotation
  );
  Scene.add(
    AlphaArm,
    OmegaArm
  );

  // Point Sphere
  const gPoints = new THREE.IcosahedronGeometry(9, 12);
  const mPoints = new THREE.PointsMaterial({
    name: 'point-sphere',
    color: redShiftMode ? 0xF27F4C : 0x7C7C7C,
    size: 0.1,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  let opacityMax = 2.2;
  let opacityMin = 0.6;

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
  Scene.add(GridPoints);
  console.debug(GridPoints);

  // Touch & Click recognition
  window.addEventListener('pointerdown', pointer => {
    console.debug(pointer);
    const gPulse = new THREE.TorusGeometry();
    const mPulse = new THREE.MeshBasicMaterial();
    const Pulse = new THREE.Mesh(gPulse, mPulse);

    onAnimate.push(() => {
      Pulse.position.set(0, 0, -9);
    });

    Scene.add(Pulse);
  });

  // Action!
  const controls = new OrbitControls(Camera, composer.renderer.domElement);
  const render = () => {
    requestAnimationFrame(render);
    onAnimate.forEach(cb => cb());
    composer.render();
  };
  render();
});