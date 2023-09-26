export default {
    antialias: true,
    antialiasGL: true,
    // audio: {context},
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoMobilePipeline: true,
    autoFocus: true,
    autoRound: true,
    backgroundColor: 0x1A1A27,
    // canvas
    // canvasStyle

    type: Phaser.CANVAS,

    callbacks: {
      preBoot: () => {}, 
      postBoot: () => {}
    },

    desynchronized: true,
    disableContextMenu: true,
    // dom
    expandParent: true,
    failIfMajorPerformanceCaveat: true,
    // fullscreenTarget

    // images
    // input: 
    // loader
    mode: Phaser.Scale.RESIZE,
    // max
    // min
    // parent
    // pipeline
    physics: {
      default: 'matter',
      matter: {
        "plugins.attractors": true,
        autoUpdate: true,
        constraintIterations: 32,
        debug: true,
        enabled: true,
        gravity: {x: 0, y: 0},
        positionIterations: 32,
        velocityIterations: 32,
      }
    },
    // render
    // scale
    transparent: true,
    
    title: 'TILLI - Talking Interlocutive Large-Language Interface |',
    version: '0.1\n',
    url: 'https://nlucis.github.io/tilli'
} as Phaser.Types.Core.GameConfig;