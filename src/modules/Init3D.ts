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


// #3
export default function init3D() {
  const target = document.getElementById('target') as HTMLCanvasElement;

  // Lights..., 
  Renderer = new THREE.WebGLRenderer({ canvas: target, alpha: true });
  Renderer.setSize(window.innerWidth, window.innerHeight);
  Renderer.setPixelRatio(window.devicePixelRatio);
  Renderer.toneMapping = THREE.CineonToneMapping;

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

  // Info Sphere - Point Grid
  const gPoints = new THREE.IcosahedronGeometry(2, 6);
  const mPoints = new THREE.PointsMaterial({
    name: 'point-sphere',
    color: 0xEFAC70,
    size: 0.1,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
  });


  const Visualizer = new THREE.Points(gPoints, mPoints);
  onAnimate.push(() => {
    Visualizer.rotation.x += 0.006;
    Visualizer.rotation.y -= 0.003;
    Visualizer.rotation.z += 0.009;
  });
  Visualizer.position.set(0, 22.2, 0);

  // Using a circle limited to 3 segments to create a 2D triangle
  const gTetraBack = new THREE.CircleGeometry(5, 3);
  const mTetraBack = new THREE.MeshBasicMaterial({ 
    color: 0x2F5CA6,
    side: THREE.BackSide
  });
  const TetraBack = new THREE.Mesh(gTetraBack, mTetraBack);

  // Alignment with visualizer
  TetraBack.rotation.z = THREE.MathUtils.degToRad(90);
  TetraBack.position.set(Visualizer.position.x, Visualizer.position.y + 0.6, Visualizer.position.z + 3);

  Scene.add(
    Visualizer,
    TetraBack
  );
  // Simulate vox flashing
  // let opacityMax = 3.0;
  // let opacityMin = 0.3;
  // setInterval(() => {
  //   mPoints.opacity = THREE.MathUtils.randFloat(opacityMin, opacityMax);
  // }, 64);

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
  const smaa = new SMAAPass(window.innerWidth, window.innerHeight);
  const scan = new FilmPass(
    0.12,
    0.72,
    window.innerHeight * 2.0,
    0
  );

  /* NOTE: clear alphas must be a value less than 1 or the TAA pass wont show */
  composer.addPass(new TAARenderPass(Scene, Camera, 0x120A0E, 1.0));
  composer.addPass(new TexturePass(cesiumTex, 0.36));
  composer.addPass(bloom);
  composer.addPass(scan);
  composer.addPass(smaa);

  // Test rotating the rotary rotator (lol)
  const rotaryDial = document.getElementById('ui-rotary-dial') as HTMLObjectElement;
  let rotationAngle = 0;
  onAnimate.push(() => {
    rotaryDial.style.rotate = `${rotationAngle}deg`;
    cesiumTex.needsUpdate = true;
    composer.render();
    rotationAngle += 1;
  });

  // Chain #4
  initUI();
}