// Coordinates are local to each normalized ear, in glTF Y-up / front +Z.
// Keep calibration separate from the renderer and future product GLB.
export const earModels = [
 {id:'ear-02',label:'귀 모델 02',description:'깊은 귓바퀴',path:'./assets/models/ear-02.glb',thumbnail:'./assets/thumbnails/ear-02.webp',
  anchors:{
   lobe:{position:[-.185,-1.10,.475],rotation:[0,.2,.1],scale:.85},
   helix:{position:[.63,.68,.75],rotation:[0,.65,.2],scale:.75},
   conch:{position:[-.105,-.13,-.15],rotation:[0,-.35,0],scale:.65},
   tragus:{position:[-.615,-.158,.14],rotation:[0,-.55,.1],scale:.55}
  }}
];
