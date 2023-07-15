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