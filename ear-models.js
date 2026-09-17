// Coordinates are local to each normalized ear, in glTF Y-up / front +Z.
// Keep calibration separate from the renderer and future product GLB.
export const earModels = [
 {id:'ear-01',label:'귀 모델 01',description:'굴곡 있는 스캔형',path:'./assets/models/ear-01.glb',thumbnail:'./assets/thumbnails/ear-01.webp',
  anchors:{
   lobe:{position:[-.21,-1.26,.555],rotation:[0,.15,0],scale:.85},
   helix:{position:[.52,.74,.49],rotation:[0,.6,.25],scale:.75},
   conch:{position:[-.135,-.055,-.155],rotation:[0,-.4,0],scale:.65},
   tragus:{position:[-.605,-.20,.17],rotation:[0,-.55,.1],scale:.55}
  }},
 {id:'ear-02',label:'귀 모델 02',description:'깊은 귓바퀴',path:'./assets/models/ear-02.glb',thumbnail:'./assets/thumbnails/ear-02.webp',
  anchors:{
   lobe:{position:[-.185,-1.10,.475],rotation:[0,.2,.1],scale:.85},
   helix:{position:[.63,.68,.75],rotation:[0,.65,.2],scale:.75},
   conch:{position:[-.105,-.13,-.15],rotation:[0,-.35,0],scale:.65},
   tragus:{position:[-.615,-.158,.14],rotation:[0,-.55,.1],scale:.55}
  }},
 {id:'ear-03',label:'귀 모델 03',description:'완만한 조형귀',path:'./assets/models/ear-03.glb',thumbnail:'./assets/thumbnails/ear-03.webp',
  anchors:{
   lobe:{position:[-.17,-1.25,.32],rotation:[0,.12,.1],scale:.85},
   helix:{position:[.82,.525,1.12],rotation:[0,.5,.25],scale:.75},
   conch:{position:[.05,.075,.305],rotation:[0,-.3,0],scale:.65},
   tragus:{position:[-.45,-.297,-.005],rotation:[0,-.55,.1],scale:.55}
  }}
];
