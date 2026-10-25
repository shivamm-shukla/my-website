import * as THREE from 'three';

/** Procedural clay character: one deferred library, no downloaded model or video. */
export function createRobotScene(host, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'robot-canvas'; canvas.setAttribute('aria-hidden','true');
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.25;
  host.appendChild(canvas);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(31,240/290,.1,30);
  camera.position.set(0,.27,5.65); camera.lookAt(0,.1,0);
  const group=new THREE.Group(); scene.add(group);
  const materials=[], geometries=new Set(), bindings=[];
  let styles=getComputedStyle(document.documentElement);
  const colour=token=>new THREE.Color(styles.getPropertyValue(token).trim());
  function material(token,extra={}) {
    const result=new THREE.MeshPhysicalMaterial({color:colour(token),roughness:.3,metalness:0,clearcoat:.45,clearcoatRoughness:.24,...extra});
    materials.push(result);bindings.push([result,token]);return result;
  }
  const shell=material('--robot-shell');
  const visor=material('--robot-visor',{roughness:.22,clearcoat:.9});
  const visorRim=material('--robot-visor-border',{roughness:.4});
  const blue=material('--robot-blue',{roughness:.24});
  const eyeMaterial=material('--robot-eye',{emissive:colour('--robot-eye'),emissiveIntensity:.65,roughness:.2});
  const cheek=material('--robot-cheek',{roughness:.48,clearcoat:.15});
  const bodyMaterial=material('--robot-white',{vertexColors:true,roughness:.4,clearcoat:.25});
  const antennaMaterial=material('--robot-blue',{emissive:colour('--robot-blue'),emissiveIntensity:.24});
  function mesh(geometry,surface,position,scale,parent=group) {
    geometries.add(geometry);const result=new THREE.Mesh(geometry,surface);
    result.position.set(...position);if(scale)result.scale.set(...scale);parent.add(result);return result;
  }
  const sphere=new THREE.SphereGeometry(1,32,24);
  const capsule=new THREE.CapsuleGeometry(.105,.21,8,20);
  const head=new THREE.Group();head.position.set(0,.46,0);group.add(head);
  mesh(sphere,shell,[0,0,0],[.71,.55,.49],head);
  mesh(sphere,visorRim,[0,-.025,.375],[.568,.357,.19],head);
  mesh(sphere,visor,[0,-.02,.421],[.537,.318,.16],head);
  const face=new THREE.Group();head.add(face);
  const eyes=[-1,1].map(side=>mesh(sphere,eyeMaterial,[side*.19,.035,.578],[.061,.103,.033],face));
  [-1,1].forEach(side=>mesh(sphere,cheek,[side*.357,-.133,.526],[.065,.029,.018],face));
  const smilePoints=Array.from({length:17},(_,index)=>{const x=-.10+index*.0125;return new THREE.Vector3(x,-.17+.7*x*x,.588-.04*Math.abs(x));});
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smilePoints),20,.012,8,false),eyeMaterial,[0,0,0],null,face);
  mesh(new THREE.CapsuleGeometry(.028,.16,5,12),shell,[0,.647,0],null,head);
  mesh(sphere,antennaMaterial,[0,.787,0],[.078,.078,.078],head);
  const bodyGeometry=new THREE.CapsuleGeometry(.305,.27,10,28);
  const positions=bodyGeometry.attributes.position, vertexColours=new Float32Array(positions.count*3);
  function paintBody() {
    const lilac=colour('--robot-lilac'),peach=colour('--robot-peach'),mixed=new THREE.Color();
    for(let index=0;index<positions.count;index++) {mixed.copy(lilac).lerp(peach,THREE.MathUtils.smoothstep(-positions.getY(index),.09,.28));mixed.toArray(vertexColours,index*3);}
    bodyGeometry.setAttribute('color',new THREE.BufferAttribute(vertexColours,3));
  }
  paintBody();mesh(bodyGeometry,bodyMaterial,[0,-.40,-.025],[1,1,1.02]);
  mesh(sphere,blue,[0,-.35,.296],[.070,.070,.026]);
  const leftHand=mesh(capsule,shell,[-.55,-.42,0]);leftHand.rotation.z=-.34;
  const rightArm=new THREE.Group();group.add(rightArm);rightArm.position.set(.57,options.pose==='wave'?.03:-.36,.035);
  const rightHand=mesh(capsule,shell,[0,0,0],null,rightArm);rightHand.rotation.z=-.3;
  const ambient=new THREE.HemisphereLight(colour('--robot-light-ambient'),colour('--robot-light-fill'),2.4);
  const key=new THREE.DirectionalLight(colour('--robot-light-key'),3.3);key.position.set(-3,4,5);
  const fill=new THREE.DirectionalLight(colour('--robot-light-fill'),1.2);fill.position.set(3,1,3);
  const rim=new THREE.DirectionalLight(colour('--robot-light-ambient'),2.2);rim.position.set(0,3,-3);scene.add(ambient,key,fill,rim);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const shadowContext=shadowCanvas.getContext('2d'),shadowTexture=new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.22});materials.push(shadowMaterial);
  const shadow=mesh(new THREE.PlaneGeometry(1.9,1.1),shadowMaterial,[0,-1.01,0],null,scene);shadow.rotation.x=-Math.PI/2;
  function paintShadow() {
    if(!shadowContext)return;
    shadowContext.clearRect(0,0,128,128);
    const rgb=colour('--robot-stage-shadow').getStyle();
    const gradient=shadowContext.createRadialGradient(64,64,1,64,64,62);
    gradient.addColorStop(0,rgb);gradient.addColorStop(1,rgb.replace('rgb(','rgba(').replace(')',',0)'));
    shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,128,128);shadowTexture.needsUpdate=true;
  }
  paintShadow();
  let disposed=false,visible=true,frame=0,last=0,elapsed=0,pointerX=0,pointerY=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
  const render=()=>{if(!disposed)renderer.render(scene,camera)};
  const resize=()=>{if(disposed)return;const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render()};
  const observer=new ResizeObserver(resize);observer.observe(host);
  const updateAppearance=()=>{
    styles=getComputedStyle(document.documentElement);
    for(const [surface,token] of bindings)surface.color.copy(colour(token));
    eyeMaterial.emissive.copy(colour('--robot-eye'));antennaMaterial.emissive.copy(colour('--robot-blue'));
    ambient.color.copy(colour('--robot-light-ambient'));ambient.groundColor.copy(colour('--robot-light-fill'));
    key.color.copy(colour('--robot-light-key'));fill.color.copy(colour('--robot-light-fill'));rim.color.copy(colour('--robot-light-ambient'));
    paintBody();paintShadow();render();
  };
  const appearance=new MutationObserver(updateAppearance);appearance.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  function tick(now) {
    frame=0;if(disposed||!visible||document.hidden||reduced.matches)return;
    const step=coarse.matches?1000/30:1000/60;
    if(now-last>=step-1) {
      elapsed+=Math.min((now-last)/1000,.05);last=now;
      group.position.y=Math.sin(elapsed*1.7)*.055;group.rotation.z=Math.sin(elapsed*.7)*.025;
      head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,pointerX*.18+Math.sin(elapsed*.55)*.045,.07);
      head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,pointerY*.07,.07);face.position.x=THREE.MathUtils.lerp(face.position.x,pointerX*.013,.1);
      const phase=elapsed%6.7,blink=phase>6.38?1-Math.sin((phase-6.38)/.32*Math.PI)*.92:1;
      eyes.forEach(eye=>{eye.scale.y=.103*blink});
      rightArm.rotation.z=options.pose==='wave'?-.65+(elapsed%7<1.6?Math.sin(elapsed*7)*.15:0):.13;
      rightArm.rotation.x=options.pose==='think'?-.7:0;shadow.scale.setScalar(1-Math.sin(elapsed*1.7)*.05);render();
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {cancelAnimationFrame(frame);frame=0;last=performance.now();if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);else render()}
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{rootMargin:'40px'});intersection.observe(host);
  const pointer=event=>{pointerX=Math.max(-1,Math.min(1,(event.clientX/window.innerWidth-.5)*2));pointerY=Math.max(-1,Math.min(1,(event.clientY/window.innerHeight-.5)*2));};
  if(options.follow)window.addEventListener('pointermove',pointer,{passive:true});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  const contextLost=event=>{event.preventDefault();cancelAnimationFrame(frame);host.classList.remove('is-3d');options.onError?.()};
  canvas.addEventListener('webglcontextlost',contextLost);
  rightArm.rotation.z=options.pose==='wave'?-.65:.13;
  resize();render();host.classList.add('is-3d');options.onReady?.();sync();
  return {dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();appearance.disconnect();intersection.disconnect();
    window.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);canvas.removeEventListener('webglcontextlost',contextLost);
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(surface=>surface.dispose());shadowTexture.dispose();renderer.dispose();canvas.remove();host.classList.remove('is-3d');
  }};
}
