import * as THREE from 'three';

// Metadata and geometry are shared by the viewer and thumbnail renderer.
// These remain test products, not real commercial product GLBs.
export const products=[
 {id:'stud',name:'바형 큐빅 피어싱',label:'바형 큐빅',thumbnail:'./assets/thumbnails/product-stud.png',anchorType:'studAnchors'},
 {id:'spark',name:'듀오 스파크 링',label:'듀오 스파크',thumbnail:'./assets/thumbnails/product-spark.png',anchorType:'anchors'},
 {id:'mini',name:'미니 원터치 링',label:'미니 원터치',thumbnail:'./assets/thumbnails/product-mini.png',anchorType:'anchors'},
 {id:'cubic',name:'큐빅 링',label:'큐빅 링',thumbnail:'./assets/thumbnails/product-cubic.png',anchorType:'anchors'},
 {id:'pearl',name:'진주 링',label:'진주 링',thumbnail:'./assets/thumbnails/product-pearl.png',anchorType:'anchors'}
];

function makeGemMaterial(){
 // Transmission is a physical refraction pass, not an opacity fade.
 return new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.03,
  transmission:1,thickness:.16,ior:2.15,dispersion:.06,
  attenuationColor:0xf4faff,attenuationDistance:3.5,
  clearcoat:.5,clearcoatRoughness:.015,envMapIntensity:1.25});
}
function brilliantGeometry(){
 const vertices=[],segments=16;
 const ring=(radius,z,offset=0,count=segments)=>Array.from({length:count},(_,i)=>{
  const a=i*Math.PI*2/count+offset;return [Math.cos(a)*radius,Math.sin(a)*radius,z];
 });
 const table=ring(.064,.105,0,8),star=ring(.094,.076,Math.PI/8,8);
 const crown=ring(.12,.04),girdle=ring(.12,.025),pavilion=ring(.055,-.055,Math.PI/8,8);
 const triangle=(a,b,c)=>vertices.push(...a,...b,...c);
 for(let i=0;i<8;i++){
  const n=(i+1)%8,j=i*2,next=(j+2)%16;
  triangle([0,0,.105],table[i],table[n]);
  triangle(table[i],star[i],table[n]);
  triangle(crown[j],star[i],table[i]);triangle(star[i],crown[next],table[n]);
  triangle(crown[j],crown[j+1],star[i]);triangle(crown[j+1],crown[next],star[i]);
  triangle(pavilion[i],girdle[j+1],girdle[j]);
  triangle(pavilion[i],girdle[next],girdle[j+1]);
  triangle(pavilion[i],pavilion[n],girdle[next]);
  triangle([0,0,-.085],pavilion[n],pavilion[i]);
 }
 for(let i=0;i<segments;i++){
  const n=(i+1)%segments;
  triangle(girdle[i],girdle[n],crown[n]);triangle(girdle[i],crown[n],crown[i]);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geometry.computeVertexNormals();return geometry;
}
export function createPiercing(product){
 if(!products.some(item=>item.id===product))throw new Error('Unknown piercing product');
 const group=new THREE.Group();group.userData.productId=product;
 if(product==='stud'){
  const silver=new THREE.MeshPhysicalMaterial({color:0xe7e9ed,metalness:1,roughness:.16,clearcoat:.2});
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.32,12),silver);
  post.rotation.x=Math.PI/2;post.position.z=-.155;group.add(post);
  const back=new THREE.Mesh(new THREE.SphereGeometry(.052,16,12),silver);back.position.z=-.31;group.add(back);
  const basket=new THREE.Mesh(new THREE.TorusGeometry(.103,.012,8,32),silver);basket.position.z=.014;group.add(basket);
  for(let i=0;i<4;i++){
   const angle=Math.PI/4+i*Math.PI/2;
   const prong=new THREE.Mesh(new THREE.CylinderGeometry(.011,.013,.09,8),silver);
   prong.rotation.x=Math.PI/2;prong.position.set(Math.cos(angle)*.106,Math.sin(angle)*.106,.035);group.add(prong);
   const tip=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),silver);
   tip.position.set(Math.cos(angle)*.106,Math.sin(angle)*.106,.082);group.add(tip);
  }
  group.add(new THREE.Mesh(brilliantGeometry(),makeGemMaterial()));return group;
 }
 const gold=new THREE.MeshPhysicalMaterial({color:0xd6ae63,metalness:1,roughness:.22});
 group.add(new THREE.Mesh(new THREE.TorusGeometry(.145,.022,12,64),gold));
 const gemMaterial=makeGemMaterial();
 const gem=(x,y,r)=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(r),gemMaterial);m.position.set(x,y,.022);group.add(m);};
 if(product==='spark'){gem(-.1,.1,.038);gem(.1,-.1,.032);}
 if(product==='cubic')for(let i=0;i<8;i++){const a=i*Math.PI/4;gem(Math.cos(a)*.145,Math.sin(a)*.145,.021);}
 if(product==='pearl'){const pearlMaterial=new THREE.MeshPhysicalMaterial({color:0xf4eee3,metalness:0,roughness:.22,clearcoat:1});const m=new THREE.Mesh(new THREE.SphereGeometry(.05,20,16),pearlMaterial);m.position.set(.12,0,.03);group.add(m);}
 if(product==='mini'||product==='pearl')gemMaterial.dispose();
 return group;
}
