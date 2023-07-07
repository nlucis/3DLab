import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
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
  Camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1e-3, 1e+3);
  Camera.position.set(0, 0, -100);

  // Scene...
  Scene.background = new THREE.Color(0.003, 0.006, 0.009);
  Scene.fog = new THREE.FogExp2( 0x000104, 0.0000675 );

  const portalGeom = new THREE.TorusGeometry(12);
  const portalMats = new THREE.MeshBasicMaterial();
  const PORTAL = new THREE.Mesh(portalGeom, portalMats);
  // Scene.add(PORTAL);
  
  // Load the prefab design
  const loader = new GLTFLoader();
  loader.load('models/IRIS.glb', (gltf) => {
    // gltf.scene.scale.set(11, 11, 11);
    // onAnimate.push(() => {
    //   gltf.scene.lookAt(Camera.position);
    // });
    // Camera.add(gltf.scene);
    // Scene.add(gltf.scene);
  });

  // Attempt at sphere with subsurface scattering
  const gSphere = new THREE.SphereGeometry(12, 36, 36);
  const mSphere = new THREE.MeshPhysicalMaterial({
    name: 'sphere',
    opacity: 1,
    color: 0x1A1A27,
    transparent: true,

    emissive: 0xFFFFFF,
    emissiveIntensity: 0.1,
    
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    side: THREE.FrontSide,
    transmission: 0.6,
  });
  const Sphere = new THREE.Mesh(gSphere, mSphere);
  const lAmbient = new THREE.AmbientLight(0xFFFFFF, 20);
  const lPoint = new THREE.PointLight(0xFF00AC, 3, 0, 1);
  Camera.add(lPoint);
  lAmbient.position.set(0, 0, 10);
  lPoint.position.set(16, 0, 0);
  Scene.add(
    Sphere, 
    lAmbient, 
    lPoint
  );

  // Post-Processing
  const composer = new EffectComposer(Renderer);
  composer.addPass(new TAARenderPass(Scene, Camera, 0xFFFFFF, 1));



  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 
    /* Strength */0.618, 
    /* Radius   */0.369, 
    /* Threshold*/0.001
  );
  console.debug(bloom.bloomTintColors);
  composer.addPass(bloom);
  
  const afterImage = new AfterimagePass(0.6);
  composer.addPass(afterImage);

  const smaa = new SMAAPass(window.innerWidth, window.innerHeight);
  composer.addPass(smaa);


  // Action!
  const controls = new OrbitControls(Camera, composer.renderer.domElement);
  const render = () => {
    requestAnimationFrame(render);
    onAnimate.forEach(cb => cb());
    composer.render();
  };
  render();
});