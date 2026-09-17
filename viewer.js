import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { earModels } from './ear-models.js?v=20260917-sky-stud';

const viewport=document.querySelector('#viewport'),canvas=document.querySelector('#stage');
const loading=document.querySelector('#loading'),fallback=document.querySelector('#fallback');
const names={stud:'바형 큐빅 피어싱',spark:'듀오 스파크 링',mini:'미니 원터치 링',cubic:'큐빅 링',pearl:'진주 링'};
const placeNames={lobe:'귓볼',helix:'헬릭스',conch:'이너컨츠',tragus:'트라거스'};
const requestedProduct=new URLSearchParams(location.search).get('product');
let product=names[requestedProduct]?requestedProduct:'stud',place='lobe',closeup=false;
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
 closeup=false;document.querySelector('#focusProduct').setAttribute('aria-pressed','false');
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
function focusPiercing(){
 if(!piercing)return;
 const damping=controls.enableDamping;controls.enableDamping=false;controls.update();
 const center=piercing.localToWorld(new THREE.Vector3(0,0,.05));
 const size=new THREE.Box3().setFromObject(piercing).getSize(new THREE.Vector3());
 const distance=Math.max(1.1,Math.max(size.x,size.y,size.z)*4);
 controls.target.copy(center);camera.position.copy(center).addScaledVector(defaultDirection,distance);
 controls.minDistance=.55;controls.maxDistance=fitDistance*1.65;
 controls.update();controls.enableDamping=damping;
 closeup=true;document.querySelector('#focusProduct').setAttribute('aria-pressed','true');render();
}
function resize(){
 const {width,height}=viewport.getBoundingClientRect();if(width<=0||height<=0)return;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(width,height,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();if(ear){const focused=closeup;fitCamera();if(focused)focusPiercing();}render();
}
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
function makePiercing(){
 const group=new THREE.Group();
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
function attachPiercing(){
 if(piercing){piercing.parent?.remove(piercing);disposeObject(piercing);}piercing=makePiercing();
 const anchor=(product==='stud'?currentModel.studAnchors:currentModel.anchors)[place];piercing.position.fromArray(anchor.position);
 if(anchor.quaternion)piercing.quaternion.fromArray(anchor.quaternion);
 else piercing.rotation.fromArray([...anchor.rotation,'XYZ']);
 piercing.scale.setScalar(anchor.scale);ear.add(piercing);
 document.querySelector('#selectionText').textContent=currentModel.label+' · '+placeNames[place];
 document.querySelector('#productName').textContent=names[product];if(closeup)focusPiercing();else render();
}
function animate(){frameId=requestAnimationFrame(animate);if(controls.update())render();}
async function loadEar(id){
 const model=earModels.find(item=>item.id===id);
 if(!model)return;
 const token=++loadToken;requestedModel=model;
 loading.textContent=model.label+' 불러오는 중…';loading.hidden=false;fallback.hidden=true;
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
  showError(model.label+' 로딩에 실패했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.');
  console.warn('Ear model load fallback:',error.message);
 }
}
async function loadEnvironment(){
 try{
  hdriTexture=await new RGBELoader().loadAsync('./assets/hdri/qwantani_morning_puresky_1k.hdr');
  hdriTexture.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer);
  environmentTarget=pmrem.fromEquirectangular(hdriTexture);pmrem.dispose();
  scene.environment=environmentTarget.texture;scene.environmentIntensity=1;
  scene.environmentRotation.y=.9;
  scene.background=hdriTexture;scene.backgroundBlurriness=.025;scene.backgroundIntensity=.9;
  scene.backgroundRotation.set(-.55,.9,0);
  renderer.toneMappingExposure=.9;fillLight.intensity=.35;keyLight.intensity=.35;
  render();
 }catch(error){
  const notice=document.querySelector('#notice');notice.textContent='자연광 조명을 불러오지 못해 기본 조명으로 표시합니다.';notice.hidden=false;
  console.warn('HDRI fallback:',error.message);
 }
}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 renderer.transmissionResolutionScale=.75;
 scene=new THREE.Scene();scene.background=new THREE.Color(0xe7f1f8);
 fillLight=new THREE.HemisphereLight(0xf1f7ff,0xd8c8b8,2);scene.add(fillLight);
 keyLight=new THREE.DirectionalLight(0xffffff,2.3);keyLight.position.set(-3,4,6);scene.add(keyLight);
 camera=new THREE.PerspectiveCamera(35,1,.01,100);controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.enablePan=false;controls.enabled=false;
 controls.minPolarAngle=Math.PI*.28;controls.maxPolarAngle=Math.PI*.7;
 controls.minAzimuthAngle=-.95;controls.maxAzimuthAngle=.95;controls.addEventListener('change',render);
 resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);
 resize();loadEar('ear-02');animate();loadEnvironment();
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frameId);showError('그래픽 연결이 중단되었습니다. 다시 시도해 주세요.');});
}catch(error){showError('이 기기에서 3D 화면을 시작하지 못했습니다. WebGL을 지원하는 최신 브라우저에서 다시 시도해 주세요.');console.error(error);}
document.querySelectorAll('[data-place]').forEach(button=>button.addEventListener('click',()=>{
 place=button.dataset.place;document.querySelectorAll('[data-place]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});if(ear)attachPiercing();
}));
document.querySelector('#productSelect').value=product;
document.querySelector('#productSelect').addEventListener('change',event=>{product=event.target.value;if(ear)attachPiercing();});
document.querySelector('#resetView').addEventListener('click',()=>{if(ear)fitCamera();});
document.querySelector('#frontView').addEventListener('click',()=>{if(ear)fitCamera(true);});
document.querySelector('#focusProduct').addEventListener('click',()=>{if(ear)focusPiercing();});
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
 model:currentModel?.id,requested:requestedModel?.id,place,product,closeup,loading:!loading.hidden,error:!fallback.hidden,
 cache:[...modelCache.keys()],hdri:Boolean(scene?.environment),camera:camera?.position.toArray(),
 bounds:ear?new THREE.Box3().setFromObject(ear).getSize(new THREE.Vector3()).toArray():null,
 memory:renderer?.info.memory,heap:performance.memory?.usedJSHeapSize
 ,dpr:renderer?.getPixelRatio(),backgroundBlur:scene?.backgroundBlurriness,exposure:renderer?.toneMappingExposure,
 limits:controls?[controls.minDistance,controls.maxDistance,controls.minPolarAngle,controls.maxPolarAngle]:null,
 gem:product==='stud'&&piercing?(()=>{const m=piercing.children.at(-1).material;return {transmission:m.transmission,ior:m.ior,roughness:m.roughness,dispersion:m.dispersion,opacity:m.opacity};})():null
})});
window.addEventListener('pagehide',async event=>{
 if(event.persisted)return;
 cancelAnimationFrame(frameId);resizeObserver?.disconnect();controls?.dispose();
 // Cached ears share resources with their active instances; dispose once on teardown.
 const objects=await Promise.allSettled([...modelCache.values()]);
 const collection=new THREE.Group();objects.forEach(item=>{if(item.status==='fulfilled')collection.add(item.value);});
 disposeObject(collection);environmentTarget?.dispose();hdriTexture?.dispose();renderer?.dispose();
});
