import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { earModels } from './ear-models.js';

const viewport=document.querySelector('#viewport'),canvas=document.querySelector('#stage');
const loading=document.querySelector('#loading'),fallback=document.querySelector('#fallback');
const names={spark:'듀오 스파크 링',mini:'미니 원터치 링',cubic:'큐빅 링',pearl:'진주 링'};
const placeNames={lobe:'귓볼',helix:'헬릭스',conch:'이너컨츠',tragus:'트라거스'};
const requestedProduct=new URLSearchParams(location.search).get('product');
let product=names[requestedProduct]?requestedProduct:'spark',place='lobe';
let renderer,scene,camera,controls,ear,piercing,resizeObserver,frameId=0,fitDistance=6;
let environmentTarget,hdriTexture,keyLight,fillLight;
let currentModel,requestedModel,loadToken=0;
const modelCache=new Map(),loader=new GLTFLoader();
const debug=new URLSearchParams(location.search).get('debug')==='anchors';
const defaultDirection=new THREE.Vector3(.35,.1,1).normalize();
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
 object.traverse(node=>{if(node.isMesh)node.material.side=THREE.DoubleSide;});
 const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 if(bounds.isEmpty()||![size.x,size.y,size.z].every(Number.isFinite)||Math.max(size.x,size.y,size.z)<=0)throw new Error('Empty or invalid model bounds');
 const scale=3/Math.max(size.x,size.y,size.z);object.position.sub(center);
 const wrapper=new THREE.Group();wrapper.add(object);wrapper.scale.setScalar(scale);return wrapper;
}
function render(){if(renderer)renderer.render(scene,camera);}
function fitCamera(front=false){
 // Drain residual OrbitControls damping before replacing the camera pose.
 // Otherwise a reset immediately after dragging keeps drifting away.
 const damping=controls.enableDamping;controls.enableDamping=false;controls.update();
 const bounds=new THREE.Box3().setFromObject(ear),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const fov=THREE.MathUtils.degToRad(camera.fov);
 fitDistance=Math.max(size.y/(2*Math.tan(fov/2)),size.x/(2*Math.tan(fov/2)*camera.aspect))*1.24;
 camera.position.copy(center).addScaledVector(front?new THREE.Vector3(0,0,1):defaultDirection,fitDistance);
 camera.near=.01;camera.far=fitDistance*12;camera.updateProjectionMatrix();
 controls.target.copy(center);controls.minDistance=fitDistance*.68;controls.maxDistance=fitDistance*1.65;
 controls.update();controls.saveState();controls.enableDamping=damping;render();
}
function resize(){
 const {width,height}=viewport.getBoundingClientRect();if(width<=0||height<=0)return;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(width,height,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();if(ear)fitCamera();render();
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
 if(piercing){piercing.parent?.remove(piercing);disposeObject(piercing);}piercing=makePiercing();
 const anchor=currentModel.anchors[place];piercing.position.fromArray(anchor.position);
 if(anchor.quaternion)piercing.quaternion.fromArray(anchor.quaternion);
 else piercing.rotation.fromArray([...anchor.rotation,'XYZ']);
 piercing.scale.setScalar(anchor.scale);ear.add(piercing);
 document.querySelector('#selectionText').textContent=currentModel.label+' · '+placeNames[place];
 document.querySelector('#productName').textContent=names[product];render();
}
function animate(){frameId=requestAnimationFrame(animate);if(controls.update())render();}
function markSelectedEar(id){
 document.querySelectorAll('[data-ear]').forEach(button=>{const active=button.dataset.ear===id;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
async function loadEar(id){
 const model=earModels.find(item=>item.id===id);
 if(!model)return;
 const token=++loadToken;requestedModel=model;
 loading.textContent=model.label+' 불러오는 중…';loading.hidden=false;fallback.hidden=true;
 markSelectedEar(id);
 try{
  if(!modelCache.has(id)){
   const task=loader.loadAsync(model.path,event=>{
    if(token!==loadToken)return;
    loading.textContent=model.label+' 불러오는 중'+(event.total?' '+Math.round(event.loaded/event.total*100)+'%':'…');
   }).then(gltf=>normalizeModel(gltf.scene));
   modelCache.set(id,task);
   task.catch(()=>{if(modelCache.get(id)===task)modelCache.delete(id);});
  }
  const next=await modelCache.get(id);
  if(token!==loadToken)return;
  if(piercing){piercing.parent?.remove(piercing);disposeObject(piercing);piercing=null;}
  if(ear)scene.remove(ear);
  ear=next;currentModel=model;scene.add(ear);
  attachPiercing();fitCamera();loading.hidden=true;controls.enabled=true;
 }catch(error){
  if(token!==loadToken)return;
  markSelectedEar(currentModel?.id);
  showError(model.label+' 로딩에 실패했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.');
  console.warn('Ear model load fallback:',error.message);
 }
}
function buildModelUI(){
 const list=document.querySelector('#earList');list.replaceChildren();
 for(const model of earModels){
  const button=document.createElement('button');button.className='ear-card';button.dataset.ear=model.id;button.setAttribute('aria-pressed','false');
  const img=document.createElement('img');img.src=model.thumbnail;img.alt='';img.width=46;img.height=58;
  const text=document.createElement('span'),label=document.createElement('b'),description=document.createElement('small');
  label.textContent=model.label;description.textContent=model.description;text.append(label,description);button.append(img,text);
  button.addEventListener('click',()=>loadEar(model.id));list.append(button);
 }
}
async function loadEnvironment(){
 try{
  hdriTexture=await new RGBELoader().loadAsync('./assets/hdri/photo_studio_01_1k.hdr');
  hdriTexture.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer);
  environmentTarget=pmrem.fromEquirectangular(hdriTexture);pmrem.dispose();
  scene.environment=environmentTarget.texture;scene.environmentIntensity=.9;
  scene.background=hdriTexture;scene.backgroundBlurriness=.65;scene.backgroundIntensity=.85;
  renderer.toneMappingExposure=.85;fillLight.intensity=.55;keyLight.intensity=.8;
  render();
 }catch(error){
  const notice=document.querySelector('#notice');notice.textContent='스튜디오 조명을 불러오지 못해 기본 조명으로 표시합니다.';notice.hidden=false;
  console.warn('HDRI fallback:',error.message);
 }
}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 scene=new THREE.Scene();scene.background=new THREE.Color(0xf3f0ec);
 fillLight=new THREE.HemisphereLight(0xfff8ed,0xc5c3c2,2);scene.add(fillLight);
 keyLight=new THREE.DirectionalLight(0xffffff,2.3);keyLight.position.set(-3,4,6);scene.add(keyLight);
 camera=new THREE.PerspectiveCamera(35,1,.01,100);controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.enablePan=false;controls.enabled=false;
 controls.minPolarAngle=Math.PI*.28;controls.maxPolarAngle=Math.PI*.7;
 controls.minAzimuthAngle=-.95;controls.maxAzimuthAngle=.95;controls.addEventListener('change',render);
 resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);
 resize();buildModelUI();loadEar('ear-01');animate();loadEnvironment();
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frameId);showError('그래픽 연결이 중단되었습니다. 다시 시도해 주세요.');});
}catch(error){showError('이 기기에서 3D 화면을 시작하지 못했습니다. WebGL을 지원하는 최신 브라우저에서 다시 시도해 주세요.');console.error(error);}
document.querySelectorAll('[data-place]').forEach(button=>button.addEventListener('click',()=>{
 place=button.dataset.place;document.querySelectorAll('[data-place]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});if(ear)attachPiercing();
}));
document.querySelector('#productSelect').value=product;
document.querySelector('#productSelect').addEventListener('change',event=>{product=event.target.value;if(ear)attachPiercing();});
document.querySelector('#resetView').addEventListener('click',()=>{if(ear)fitCamera();});
document.querySelector('#frontView').addEventListener('click',()=>{if(ear)fitCamera(true);});
document.querySelector('#retry').addEventListener('click',()=>{
 if(renderer&&scene&&requestedModel&&!renderer.getContext().isContextLost())loadEar(requestedModel.id);else location.reload();
});
function sampleAnchor(x,y){
 if(!ear)return null;
 const rect=canvas.getBoundingClientRect(),pointer=new THREE.Vector2((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);
 const ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);
 const hits=ray.intersectObject(ear,true).filter(hit=>!piercing?.children.includes(hit.object));
 if(!hits.length)return null;
 const point=ear.worldToLocal(hits[0].point.clone());
 return {model:currentModel.id,place,position:point.toArray()};
}
if(debug)window.__sampleAnchor=sampleAnchor;
if(debug)canvas.addEventListener('click',event=>{
 if(!event.shiftKey)return;
 window.__lastAnchor=sampleAnchor(event.clientX,event.clientY);
 console.info('Anchor sample',window.__lastAnchor);
});
Object.defineProperty(window,'__viewerState',{get:()=>({
 model:currentModel?.id,requested:requestedModel?.id,place,loading:!loading.hidden,error:!fallback.hidden,
 cache:[...modelCache.keys()],hdri:Boolean(scene?.environment),camera:camera?.position.toArray(),
 bounds:ear?new THREE.Box3().setFromObject(ear).getSize(new THREE.Vector3()).toArray():null,
 memory:renderer?.info.memory,heap:performance.memory?.usedJSHeapSize
 ,dpr:renderer?.getPixelRatio(),backgroundBlur:scene?.backgroundBlurriness,exposure:renderer?.toneMappingExposure,
 limits:controls?[controls.minDistance,controls.maxDistance,controls.minPolarAngle,controls.maxPolarAngle]:null
})});
window.addEventListener('pagehide',async event=>{
 if(event.persisted)return;
 cancelAnimationFrame(frameId);resizeObserver?.disconnect();controls?.dispose();
 // Cached ears share resources with their active instances; dispose once on teardown.
 const objects=await Promise.allSettled([...modelCache.values()]);
 const collection=new THREE.Group();objects.forEach(item=>{if(item.status==='fulfilled')collection.add(item.value);});
 disposeObject(collection);environmentTarget?.dispose();hdriTexture?.dispose();renderer?.dispose();
});
