import * as THREE from 'three';

import { SMAAPass        } from 'three/examples/jsm/postprocessing/SMAAPass';
import { FilmPass        } from 'three/examples/jsm/postprocessing/FilmPass';
import { TexturePass     } from 'three/examples/jsm/postprocessing/TexturePass';
import { EffectComposer  } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import * as PIXI from 'pixi.js';
import { renderTarget } from '..';

export let Renderer: THREE.WebGLRenderer;
export let Camera: THREE.PerspectiveCamera;
export const Scene: THREE.Scene = new THREE.Scene();


export default function initRendering(application: Phaser.Game) {
  const target = document.getElementById('target') as HTMLCanvasElement;

  Renderer = new THREE.WebGLRenderer({ canvas: target, alpha: true });
  Renderer.setSize(window.innerWidth, window.innerHeight);
  Renderer.setPixelRatio(window.devicePixelRatio);
  Renderer.toneMapping = THREE.CineonToneMapping;
  Renderer.toneMappingExposure = 0.01

  // Post-Processing
  const composer = new EffectComposer(Renderer);
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(1000, 1000), 
    /* Strength */ 0.224, 
    /* Radius   */ 0.222, 
    /* Threshold*/ 0.012
  );
  const scan = new FilmPass(
    0.24,
    0.72,
    window.innerHeight * 2.0,
    0
  );

  // Layers
  const layer1 = new THREE.CanvasTexture(renderTarget);
  composer.addPass(new TexturePass(layer1)); // if the alpha is too high, bloom ends up over-exposing the layer

  // Post-Processing and FX
  composer.addPass(bloom);
  composer.addPass(scan);

  // Runtime loop
  PIXI.Ticker.shared.add(() => {
    layer1.needsUpdate = true;
    composer.render();
  });
}