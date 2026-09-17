import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const viewport=document.querySelector('#viewport'),canvas=document.querySelector('#stage');
const loading=document.querySelector('#loading'),fallback=document.querySelector('#fallback');
const names={spark:'듀오 스파크 링',mini:'미니 원터치 링',cubic:'큐빅 링',pearl:'진주 링'};
const placeNames={lobe:'귓볼',helix:'헬릭스',conch:'이너컨츠',tragus:'트라거스'};
const requestedProduct=new URLSearchParams(location.search).get('product');
let product=names[requestedProduct]?requestedProduct:'spark',place='lobe';
let renderer,scene,camera,controls,ear,piercing,resizeObserver,frameId=0,fitDistance=6;
const defaultDirection=new THREE.Vector3(.35,.1,1).normalize();
const basicAnchors={
 lobe:{position:[-.1,-1.12,.25],rotation:[0,0,0],scale:.8},
 helix:{position:[-.69,.8,.29],rotation:[0,.3,-.4],scale:.7},
 conch:{position:[.08,-.08,.22],rotation:[0,0,0],scale:.7},
 tragus:{position:[.43,-.36,.34],rotation:[0,.45,0],scale:.55}
};
function showError(message){loading.hidden=true;fallback.hidden=false;document.querySelector('#errorMessage').textContent=message;}
function disposeObject(object){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 object?.traverse(node=>{
  if(node.geometry)geometries.add(node.geometry);
  for(const material of Array.isArray(node.material)?node.material:[node.material]){
   if(!material)continue;materials.add(material);
   for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
  }
 });
 geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());textures.forEach(item=>item.dispose());
}
function normalizeModel(object){
 const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const scale=3/Math.max(size.x,size.y,size.z);object.position.sub(center);
 const wrapper=new THREE.Group();wrapper.add(object);wrapper.scale.setScalar(scale);return wrapper;
}
function render(){if(renderer)renderer.render(scene,camera);}
function fitCamera(front=false){
 const bounds=new THREE.Box3().setFromObject(ear),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const fov=THREE.MathUtils.degToRad(camera.fov);
 fitDistance=Math.max(size.y/(2*Math.tan(fov/2)),size.x/(2*Math.tan(fov/2)*camera.aspect))*1.24;
 camera.position.copy(center).addScaledVector(front?new THREE.Vector3(0,0,1):defaultDirection,fitDistance);
 camera.near=.01;camera.far=fitDistance*12;camera.updateProjectionMatrix();
 controls.target.copy(center);controls.minDistance=fitDistance*.68;controls.maxDistance=fitDistance*1.65;
 controls.update();controls.saveState();render();
}
function resize(){
 const {width,height}=viewport.getBoundingClientRect();if(width<=0||height<=0)return;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(width,height,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();if(ear)fitCamera();render();
}
function makeBasicEar(){
 const group=new THREE.Group(),skin=new THREE.MeshStandardMaterial({color:0xd5ad98,roughness:.68});
 const bowl=new THREE.Mesh(new THREE.SphereGeometry(1,40,32),skin);bowl.scale.set(.72,1.35,.19);group.add(bowl);
 const helix=new THREE.Mesh(new THREE.TorusGeometry(.9,.115,12,80),skin);helix.scale.set(.76,1.38,1);helix.position.z=.12;group.add(helix);
 const antihelix=new THREE.Mesh(new THREE.TorusGeometry(.5,.1,12,64,4.4),skin);antihelix.scale.set(.8,1.4,1);antihelix.position.set(.03,.05,.2);antihelix.rotation.z=-.6;group.add(antihelix);
 const lobe=new THREE.Mesh(new THREE.SphereGeometry(.32,24,20),skin);lobe.scale.set(.9,1.15,.8);lobe.position.set(-.1,-1.08,.03);group.add(lobe);
 const tragus=new THREE.Mesh(new THREE.SphereGeometry(.17,24,16),skin);tragus.scale.set(.7,1.6,1);tragus.position.set(.43,-.27,.19);group.add(tragus);
 return normalizeModel(group);
}
function makePiercing(){
 const group=new THREE.Group(),gold=new THREE.MeshPhysicalMaterial({color:0xd6ae63,metalness:1,roughness:.22});
 group.add(new THREE.Mesh(new THREE.TorusGeometry(.145,.022,12,64),gold));
 const gemMaterial=new THREE.MeshPhysicalMaterial({color:0xf4eee3,metalness:.08,roughness:.13,clearcoat:1});
 const gem=(x,y,r)=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(r),gemMaterial);m.position.set(x,y,.022);group.add(m);};
 if(product==='spark'){gem(-.1,.1,.038);gem(.1,-.1,.032);}
 if(product==='cubic')for(let i=0;i<8;i++){const a=i*Math.PI/4;gem(Math.cos(a)*.145,Math.sin(a)*.145,.021);}
 if(product==='pearl'){const m=new THREE.Mesh(new THREE.SphereGeometry(.05,20,16),gemMaterial);m.position.set(.12,0,.03);group.add(m);}
 return group;
}
function attachPiercing(){
 if(piercing){scene.remove(piercing);disposeObject(piercing);}piercing=makePiercing();
 const anchor=basicAnchors[place];piercing.position.fromArray(anchor.position);
 piercing.rotation.fromArray([...anchor.rotation,'XYZ']);piercing.scale.setScalar(anchor.scale);scene.add(piercing);
 document.querySelector('#selectionText').textContent='귀 모델 01 · '+placeNames[place];
 document.querySelector('#productName').textContent=names[product];render();
}
function animate(){frameId=requestAnimationFrame(animate);if(controls.update())render();}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 scene=new THREE.Scene();scene.background=new THREE.Color(0xf3f0ec);
 scene.add(new THREE.HemisphereLight(0xfff8ed,0xc5c3c2,2));
 const key=new THREE.DirectionalLight(0xffffff,2.3);key.position.set(-3,4,6);scene.add(key);
 camera=new THREE.PerspectiveCamera(35,1,.01,100);controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.enablePan=false;
 controls.minPolarAngle=Math.PI*.28;controls.maxPolarAngle=Math.PI*.7;
 controls.minAzimuthAngle=-.95;controls.maxAzimuthAngle=.95;controls.addEventListener('change',render);
 ear=makeBasicEar();scene.add(ear);resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);
 resize();attachPiercing();loading.hidden=true;animate();
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frameId);showError('그래픽 연결이 중단되었습니다. 다시 시도해 주세요.');});
}catch(error){showError('이 기기에서 3D 화면을 시작하지 못했습니다. WebGL을 지원하는 최신 브라우저에서 다시 시도해 주세요.');console.error(error);}
document.querySelectorAll('[data-place]').forEach(button=>button.addEventListener('click',()=>{
 place=button.dataset.place;document.querySelectorAll('[data-place]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});if(renderer)attachPiercing();
}));
document.querySelector('#productSelect').value=product;
document.querySelector('#productSelect').addEventListener('change',event=>{product=event.target.value;if(renderer)attachPiercing();});
document.querySelector('#resetView').addEventListener('click',()=>{if(ear)fitCamera();});
document.querySelector('#frontView').addEventListener('click',()=>{if(ear)fitCamera(true);});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(frameId);resizeObserver?.disconnect();controls?.dispose();disposeObject(ear);disposeObject(piercing);renderer?.dispose();});
