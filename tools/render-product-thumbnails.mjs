// Build-time only. Run against an isolated QA browser displaying the local
// HTTP viewer: node tools/render-product-thumbnails.mjs <browser-CDP-websocket>
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

if(!process.argv[2])throw new Error('Pass the isolated QA browser CDP websocket URL');
const socket=new WebSocket(process.argv[2]);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
let sequence=0;const pending=new Map();
socket.addEventListener('message',event=>{
 const message=JSON.parse(event.data),task=pending.get(message.id);
 if(task){pending.delete(message.id);message.error?task.reject(message.error):task.resolve(message.result);}
});
function call(method,params={},sessionId){
 return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params,sessionId}));});
}
try{
 const {targetInfos}=await call('Target.getTargets');
 const target=targetInfos.find(item=>item.type==='page'&&/^http:\/\/(127\.0\.0\.1|localhost):\d+\//.test(item.url));
 if(!target)throw new Error('Open the local HTTP viewer in this QA browser first');
 const {sessionId}=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true});
 const result=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
  const THREE=await import('three');
  const {RGBELoader}=await import('three/addons/loaders/RGBELoader.js');
  const {products,createPiercing}=await import('./piercing-products.js?v=20260917-catalog');
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(256,256);renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.9;renderer.transmissionResolutionScale=1;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xf6f4f1);
  const hdr=await new RGBELoader().loadAsync('./assets/hdri/qwantani_morning_puresky_1k.hdr');
  hdr.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(hdr);
  scene.environment=environment.texture;scene.environmentRotation.y=.9;
  scene.add(new THREE.HemisphereLight(0xf1f7ff,0xd8c8b8,.35));
  const light=new THREE.DirectionalLight(0xffffff,.35);light.position.set(-3,4,6);scene.add(light);
  const camera=new THREE.PerspectiveCamera(35,1,.01,10),images=[];
  for(const item of products){
   const object=createPiercing(item.id);scene.add(object);
   const bounds=new THREE.Box3().setFromObject(object),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
   const distance=Math.max(size.x,size.y,size.z)/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*1.24;
   camera.position.copy(center).addScaledVector(new THREE.Vector3(.65,.28,1).normalize(),distance);
   camera.lookAt(center);renderer.render(scene,camera);
   images.push({id:item.id,data:renderer.domElement.toDataURL('image/png')});
   scene.remove(object);
   const geometry=new Set(),materials=new Set();object.traverse(node=>{if(node.geometry)geometry.add(node.geometry);if(node.material)materials.add(node.material);});
   geometry.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());
  }
  pmrem.dispose();environment.dispose();hdr.dispose();renderer.dispose();renderer.forceContextLoss();return images;
 })()`},sessionId);
 if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
 const folder=new URL('../assets/thumbnails/',import.meta.url);await mkdir(folder,{recursive:true});
 for(const item of result.result.value){
  const bytes=Buffer.from(item.data.split(',')[1],'base64'),destination=new URL(`product-${item.id}.png`,folder);
  await writeFile(destination,bytes);console.log(`${fileURLToPath(destination)} ${bytes.length} bytes`);
 }
}finally{socket.close();}
