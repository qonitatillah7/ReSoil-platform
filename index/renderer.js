import {clamp} from './biology.js';
import {molecularScene} from './scene.js';
export const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function multiply(a,b){const o=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
export const transform=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15]];
const norm=a=>{const n=Math.hypot(...a)||1;return a.map(x=>x/n);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
export function objectMatrix(item){
  if(item.kind==='ball'){const s=item.scale??[1,1,1],r=item.r,m=identity();m[0]=r*s[0];m[5]=r*s[1];m[10]=r*s[2];m[12]=item.pos[0];m[13]=item.pos[1];m[14]=item.pos[2];return m;}
  const y=norm(item.b.map((v,i)=>v-item.a[i])),x=norm(cross(y,Math.abs(y[2])>.95?[1,0,0]:[0,0,1])),z=cross(x,y),len=Math.hypot(...item.b.map((v,i)=>v-item.a[i])),p=item.a.map((v,i)=>(v+item.b[i])/2),r=item.r;
  return [x[0]*r,x[1]*r,x[2]*r,0,y[0]*len,y[1]*len,y[2]*len,0,z[0]*r,z[1]*r,z[2]*r,0,...p,1];
}
export function unitGeometry(kind){
  const v=[],n=[],add=(p,ns)=>{v.push(...p);n.push(...ns);};
  if(kind==='ball'){
    const point=(a,b)=>[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];
    for(let i=0;i<10;i++)for(let j=0;j<14;j++){const p=[point(i*Math.PI/10,j*Math.PI*2/14),point((i+1)*Math.PI/10,j*Math.PI*2/14),point((i+1)*Math.PI/10,(j+1)*Math.PI*2/14),point(i*Math.PI/10,(j+1)*Math.PI*2/14)];for(const k of [0,1,2,0,2,3])add(p[k],p[k]);}
  }else{
    for(let i=0;i<10;i++){const a=i*Math.PI/5,b=(i+1)*Math.PI/5,p=[[Math.cos(a),-.5,Math.sin(a)],[Math.cos(a),.5,Math.sin(a)],[Math.cos(b),.5,Math.sin(b)],[Math.cos(b),-.5,Math.sin(b)]];for(const k of [0,1,2,0,2,3])add(p[k],[p[k][0],0,p[k][2]]);for(const [h,normal]of [[-.5,[0,-1,0]],[.5,[0,1,0]]]){add([0,h,0],normal);add([Math.cos(a),h,Math.sin(a)],normal);add([Math.cos(b),h,Math.sin(b)],normal);}}
  }return {vertices:v,normals:n};
}
const VERT=`attribute vec3 aPos;attribute vec3 aNormal;uniform mat4 uM;uniform mat4 uVP;varying vec3 vN;void main(){vN=mat3(uM)*aNormal;gl_Position=uVP*uM*vec4(aPos,1.0);}`;
const FRAG=`precision mediump float;uniform vec3 uColor;varying vec3 vN;void main(){vec3 n=normalize(vN);float d=max(dot(n,normalize(vec3(-0.5,0.9,1.0))),0.0);float l=0.64+0.36*d;gl_FragColor=vec4(uColor*l,1.0);}`;
export class MolecularRenderer{
  constructor(canvas,overlay,{onPick=()=>{},onFallback=()=>{}}={}){
    this.canvas=canvas;this.overlay=overlay;this.labelContext=overlay.getContext('2d');this.onPick=onPick;this.pointers=new Map();this.azimuth=.05;this.elevation=.20;this.radius=12.8;this.scene={items:[],labels:[]};this.width=1;this.height=1;this.pickable=[];
    try{this.gl=canvas.getContext('webgl',{alpha:true,antialias:true});if(!this.gl)throw Error('No WebGL');this.initGL();}catch(e){this.gl=null;const replacement=canvas.cloneNode();canvas.replaceWith(replacement);this.canvas=replacement;this.ctx=replacement.getContext('2d');onFallback();}
    this.installControls();this.observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>this.render()):null;this.observer?.observe(this.canvas);
  }
  initGL(){const g=this.gl,p=g.createProgram(),shader=(type,src)=>{const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error('Shader failed');return s;};g.attachShader(p,shader(g.VERTEX_SHADER,VERT));g.attachShader(p,shader(g.FRAGMENT_SHADER,FRAG));g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw Error('Program failed');g.useProgram(p);this.program=p;this.a={p:g.getAttribLocation(p,'aPos'),n:g.getAttribLocation(p,'aNormal')};this.u={m:g.getUniformLocation(p,'uM'),vp:g.getUniformLocation(p,'uVP'),color:g.getUniformLocation(p,'uColor')};this.geometry={};
    for(const kind of ['ball','rod']){const data=unitGeometry(kind),buffers={};for(const [k,arr]of [['p',data.vertices],['n',data.normals]]){const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array(arr),g.STATIC_DRAW);buffers[k]=b;}this.geometry[kind]={...buffers,count:data.vertices.length/3};}
    g.enable(g.DEPTH_TEST);g.clearColor(0,0,0,0);this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;});this.canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;this.initGL();this.render();});
  }
  setState(state,model){this.state={...state};this.model=model;this.scene=molecularScene(state,model);this.render();}
  resetCamera(view='perspective'){this.azimuth=view==='top'?0:view==='side'?.7:.05;this.elevation=view==='top'?1.45:view==='side'?.4:.20;this.radius=view==='top'?14.2:12.8;this.render();}
  installControls(){const c=this.canvas;
    c.addEventListener('pointerdown',e=>{this.start=[e.clientX,e.clientY];this.pointers.set(e.pointerId,[e.clientX,e.clientY]);c.setPointerCapture?.(e.pointerId);});
    c.addEventListener('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;const before=[...this.pointers.values()],p=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,[e.clientX,e.clientY]);if(this.pointers.size===2){const after=[...this.pointers.values()],d=Math.hypot(before[0][0]-before[1][0],before[0][1]-before[1][1]),dn=Math.hypot(after[0][0]-after[1][0],after[0][1]-after[1][1]);if(dn)this.radius=clamp(this.radius*d/dn,6,28);}else{this.azimuth-=(e.clientX-p[0])*.006;this.elevation=clamp(this.elevation+(e.clientY-p[1])*.005,-.7,1.5);}this.render();});
    c.addEventListener('pointerup',e=>{if(this.pointers.size===1&&this.start&&Math.hypot(e.clientX-this.start[0],e.clientY-this.start[1])<7){const r=c.getBoundingClientRect();this.pick(e.clientX-r.left,e.clientY-r.top);}this.pointers.delete(e.pointerId);});
    for(const t of ['pointercancel','lostpointercapture'])c.addEventListener(t,e=>this.pointers.delete(e.pointerId));
    c.addEventListener('wheel',e=>{e.preventDefault();this.radius=clamp(this.radius*Math.exp(e.deltaY*.001),6,28);this.render();},{passive:false});
  }
  pick(x,y){const found=this.pickable.filter(p=>Math.hypot(p.x-x,p.y-y)<Math.max(p.radius,14)).sort((a,b)=>a.depth-b.depth)[0];if(found)this.onPick(found.id);}
  resize(){const b=this.canvas.getBoundingClientRect();this.width=Math.max(1,b.width);this.height=Math.max(1,b.height);this.ratio=Math.min(globalThis.devicePixelRatio||1,2);for(const c of [this.canvas,this.overlay]){const w=Math.round(this.width*this.ratio),h=Math.round(this.height*this.ratio);if(c.width!==w||c.height!==h){c.width=w;c.height=h;}}}
  matrices(){const aspect=this.width/this.height,r=this.radius*Math.max(1,1.65/aspect),target=[0,.12,0],eye=[r*Math.sin(this.azimuth)*Math.cos(this.elevation),r*Math.sin(this.elevation),r*Math.cos(this.azimuth)*Math.cos(this.elevation)],z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x),view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];const f=1/Math.tan(19*Math.PI/180),near=.1,far=120,proj=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*near*far/(near-far),0];this.vp=multiply(proj,view);}
  project(p){const v=transform(this.vp,p);return {x:(v[0]/v[3]*.5+.5)*this.width,y:(.5-v[1]/v[3]*.5)*this.height,depth:v[2]/v[3],visible:v[3]>0};}
  render(){this.resize();this.matrices();if(this.gl&&!this.lost)this.drawGL();else if(this.ctx)this.drawSoftware();this.drawLabels();}
  drawGL(){const g=this.gl;g.viewport(0,0,this.canvas.width,this.canvas.height);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(this.program);g.uniformMatrix4fv(this.u.vp,false,this.vp);let bound='';for(const item of this.scene.items){const geo=this.geometry[item.kind];if(bound!==item.kind){for(const [a,b]of [[this.a.p,geo.p],[this.a.n,geo.n]]){g.bindBuffer(g.ARRAY_BUFFER,b);g.enableVertexAttribArray(a);g.vertexAttribPointer(a,3,g.FLOAT,false,0,0);}bound=item.kind;}g.uniformMatrix4fv(this.u.m,false,objectMatrix(item));g.uniform3fv(this.u.color,rgb(item.color));g.drawArrays(g.TRIANGLES,0,geo.count);}}
  drawSoftware(){const c=this.ctx;c.setTransform(this.ratio,0,0,this.ratio,0,0);c.clearRect(0,0,this.width,this.height);const list=this.scene.items.map(o=>({...o,screen:this.project(o.kind==='ball'?o.pos:o.a.map((v,i)=>(v+o.b[i])/2))})).sort((a,b)=>b.screen.depth-a.screen.depth);for(const o of list){if(!o.screen.visible)continue;c.fillStyle=o.color;c.strokeStyle=o.color;if(o.kind==='rod'){const a=this.project(o.a),b=this.project(o.b),r=this.project([o.a[0],o.a[1]+o.r,o.a[2]]);c.lineWidth=Math.max(1,Math.hypot(r.x-a.x,r.y-a.y)*2);c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}else{const p=o.screen,s=o.scale??[1,1,1],rp=this.project([o.pos[0]+o.r,o.pos[1],o.pos[2]]),radius=Math.max(1,Math.hypot(rp.x-p.x,rp.y-p.y)),rx=radius*s[0],ry=radius*s[1];const grad=c.createRadialGradient(p.x-rx*.3,p.y-ry*.35,1,p.x,p.y,Math.max(rx,ry));grad.addColorStop(0,o.color);grad.addColorStop(1,o.color);c.fillStyle=grad;c.beginPath();c.ellipse(p.x,p.y,rx,ry,0,0,Math.PI*2);c.fill();}}}
  drawLabels(){const ctx=this.labelContext;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.clearRect(0,0,this.width,this.height);this.pickable=[];for(const o of this.scene.items)if(o.kind==='ball'&&o.id){const p=this.project(o.pos),r=this.project([o.pos[0]+o.r,o.pos[1],o.pos[2]]);this.pickable.push({...p,radius:Math.max(9,Math.hypot(p.x-r.x,p.y-r.y)),id:o.id});}
    const labels=this.scene.labels.filter(l=>this.state?.labels!==false||l.style==='base'||l.style==='end');
    labels.sort((a,b)=>this.project(b.pos).depth-this.project(a.pos).depth);
    for(const l of labels){const p=this.project(l.pos);if(!p.visible)continue;const small=this.width<500;let font=l.style==='base'?(small?8:11):l.style==='end'?12:l.style==='site'?14:l.style==='amino'?10:small?8:10;ctx.font=`${l.style==='base'||l.style==='end'||l.style==='site'?'600':'500'} ${font}px ui-sans-serif,system-ui,sans-serif`;const w=ctx.measureText(l.text).width;let x=clamp(p.x,w/2+8,this.width-w/2-8),y=clamp(p.y,65,this.height-55);ctx.textAlign='center';ctx.textBaseline='middle';
      if(l.style==='pill'){ctx.fillStyle='#ffffffed';ctx.strokeStyle='#d9e4db';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-w/2-9,y-11,w+18,22,6);ctx.fill();ctx.stroke();}
      ctx.fillStyle=l.color;ctx.fillText(l.text,x,y);
    }
  }
  dispose(){this.observer?.disconnect();if(this.gl){for(const g of Object.values(this.geometry))for(const k of ['p','n'])this.gl.deleteBuffer(g[k]);this.gl.deleteProgram(this.program);}}
}
