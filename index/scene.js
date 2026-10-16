import {BASE_COLORS,GENETIC_CODE,AMINO_NAMES,anticodon,clamp,STAGES} from './biology.js';
const mix=(a,b,t)=>a+(b-a)*t;
export function molecularScene(state,model){
  const items=[],labels=[];
  const ball=(pos,r,color,id,scale)=>items.push({kind:'ball',pos,r,color,id,scale});
  const rod=(a,b,r,color,id)=>{if(Math.hypot(...a.map((v,i)=>v-b[i]))>.00001)items.push({kind:'rod',a,b,r,color,id});};
  const label=(pos,text,style='pill',color='#38524c',id)=>labels.push({pos,text,style,color,id});
  const base=(pos,b,id,r=.15)=>{ball(pos,r,BASE_COLORS[b],id);label(pos,b,'base','#304337',id);};
  const ring=(center,rx,ry,color,axis='xy',radius=.035)=>{for(let i=0;i<64;i++){const point=k=>{const a=k/64*Math.PI*2;return axis==='xy'?[center[0]+rx*Math.cos(a),center[1]+ry*Math.sin(a),center[2]]:[center[0]+rx*Math.cos(a),center[1],center[2]+ry*Math.sin(a)];};rod(point(i),point(i+1),radius,color);}};
  const n=model.coding.length,dx=.49,xAt=i=>(i-(n-1)/2)*dx;
  const codonX=i=>xAt(i*3+1);
  function rna({y=-1.1,z=.65,count=n,positions=null,offset=0,sequence=model.rna,r=.145}={}){
    let last=null;
    for(let i=0;i<Math.min(count,sequence.length);i++){
      const p=positions?positions(i):[xAt(i)+offset,y,z];
      const selected=state.stage===3&&Math.floor(i/3)===state.codon;
      if(last)rod(last,p,selected?.065:.045,selected?'#4f8268':'#8da79c','rna');base(p,sequence[i],'rna-'+i,selected?r*1.18:r);last=p;
    }
  }
  if(state.overview){
    ring([0,0,-.6],5.9,3.15,'#ceded4');ring([0,0,.4],5.9,3.15,'#e0e9e2');ring([-2,0,0],2.2,2.2,'#7ba692');ring([-2,0,.1],2.26,2.26,'#adccbb');
    for(let i=0;i<15;i++){const x=-3.2+i*.16,t=i*.64,p=[x,.65*Math.cos(t),.65*Math.sin(t)],q=[x,-.65*Math.cos(t),-.65*Math.sin(t)];ball(p,.09,'#59988d','dna');ball(q,.09,'#8f89b4','dna');rod(p,q,.045,BASE_COLORS[model.coding[i]],'dna');}
    ball([.15,.1,.1],.2,'#f2c271','pore');ring([.15,.1,.15],.3,.45,'#ddaf61');
    for(let i=0;i<9;i++)base([.5+i*.31,-.18+.12*Math.sin(i),.5],model.rna[i],'rna',.12);
    ball([3.5,-.45,.0],.7,'#c1b5da','ribosome',[1,.65,.55]);ball([3.5,.12,-.25],.9,'#a593c5','ribosome',[1,.8,.55]);
    label([-2,2.55,0],'NUKLEUS');label([3,2.1,0],'SITOPLASMA');label([.15,.95,.2],'Pori inti');label([-3,-1.3,.8],'DNA tetap di nukleus');label([3.6,-1.35,.5],'Ribosom');label([1.4,.6,.5],'mRNA →');
    return {items,labels,context:'Sel eukariotik · lokasi proses'};
  }
  if(state.stage<=1){
    const trans=state.stage===1,p=state.progress,formed=trans?clamp(Math.floor(p)-1,0,n):0,bubble=trans&&p>=1&&p<20,polyX=trans?xAt(clamp(p-2,0,n-1)):0;
    let previous=[null,null];
    for(let i=0;i<n;i++){
      const x=xAt(i),t=i*2*Math.PI/10.5;
      let flatten=state.flat?1:0;
      if(trans)flatten=Math.max(flatten,bubble?clamp(1-Math.abs(x-polyX)/1.15,0,1):0);
      const a=[x,mix(Math.cos(t)*.83,.92,flatten),mix(Math.sin(t)*.83,0,flatten)],b=[x,-a[1],-a[2]];
      for(const [s,pt,col]of [[0,a,'#619b90'],[1,b,'#9586b6']]){ball(pt,.105,col,s?'template':'coding');if(previous[s])rod(previous[s],pt,.055,col,s?'template':'coding');previous[s]=pt;}
      const ca=a.map((v,j)=>mix(v,b[j],.25)),cb=a.map((v,j)=>mix(v,b[j],.75));
      rod(a,ca,.06,BASE_COLORS[model.coding[i]],'coding-'+i);rod(b,cb,.06,BASE_COLORS[model.template[i]],'template-'+i);
      base(ca,model.coding[i],'coding-'+i,.135);base(cb,model.template[i],'template-'+i,.135);
      if(!bubble||Math.abs(x-polyX)>1.05)rod(ca,cb,.018,'#bac8bc');
      if(state.stage===0&&state.progress>=1&&i===7){label([x,1.65,0],`${model.coding[i]}–${model.template[i]}: pasangan basa`);}
    }
    const endAngle=(n-1)*2*Math.PI/10.5,fy=state.flat?.92:Math.cos(endAngle)*.83,fz=state.flat?0:Math.sin(endAngle)*.83;
    label([xAt(0)-.38,1.03,0],'5′','end','#2d7d69');label([xAt(0)-.38,-1.03,0],'3′','end','#8370a8');label([xAt(n-1)+.38,fy,fz],'3′','end','#2d7d69');label([xAt(n-1)+.38,-fy,-fz],'5′','end','#8370a8');
    if(!trans){
      label([-2.5,1.65,.1],'Untai pengode','pill','#2c7564');label([2.3,-1.65,.1],'Untai cetakan','pill','#786393');
      const selected=clamp(state.codon??0,0,5),left=xAt(selected*3)-.20,right=xAt(selected*3+2)+.20,corners=[];
      for(const x of [left,right])for(const y of [-1.10,1.10])for(const z of [-.98,.98])corners.push([x,y,z]);
      for(let i=0;i<8;i++)for(const axis of [1,2,4]){const j=i^axis;if(j>i)rod(corners[i],corners[j],.013,'#acb88d','selection');}
      label([(left+right)/2,2.4,.05],`Triplet ${selected+1}: ${model.coding.slice(selected*3,selected*3+3)}`,'caption','#718348');
    }
    else{
      label([-4.95,1.9,-.05],'Promoter (skematis)','pill','#6b6f79');
      if(p<1){ball([-4.7,.6,-.3],.18,'#91b7bd','transcription-factor');ball([-4.4,.85,-.2],.16,'#91b7bd','transcription-factor');}
      if(p<21){ball([polyX,.08,-.40],.8,'#c0afd8','polymerase',[.83,1,.65]);ball([polyX-.25,.44,-.5],.40,'#a998c6','polymerase');label([polyX,1.55,-.1],'RNA polimerase II','pill','#715b99');}
      const ty=p>=21?-1.4:-1.35;rna({y:ty,z:.5,count:formed});
      if(formed>0){label([xAt(0)-.42,ty,.5],'5′','end','#528d7c');label([xAt(formed-1)+.42,ty,.5],'3′','end','#528d7c');label([-1,-2.2,.6],`RNA baru: ${formed}/18 basa`);}
      const f=p-Math.floor(p);
      if(p>=1&&p<19&&f>0){const i=formed,target=[xAt(i),ty,.5],incoming=[target[0]+.4*(1-f),target[1]-.8*(1-f),target[2]+.4*(1-f)];base(incoming,model.rna[i],'incoming',.15);}
      label([1,2.4,0],'Cetakan 3′ → 5′  ·  RNA tumbuh 5′ → 3′','caption');
    }
    return {items,labels,context:trans?'Nukleus · DNA disalin menjadi RNA':'Nukleus · struktur DNA'};
  }
  if(state.stage===2){
    const step=Math.floor(state.progress),cut=step>=2,exporting=step===4;
    if(exporting){
      ring([0,0,-.2],.55,2.7,'#a8c5b6','xy',.05);ring([.16,0,-.2],.55,2.7,'#c7dacd','xy',.04);ball([0,0,.25],.36,'#e6bd79','pore');
      const fraction=state.progress-step,offset=-2.7+fraction*4.8;
      rna({positions:i=>[(i-8.5)*.34+offset,.12*Math.sin(i*.4),.65],r:.12});ball([-3.2+offset,0,.65],.2,'#cfaa55','cap');for(let i=0;i<4;i++)ball([3.1+offset+i*.18,-.1-i*.07,.65],.08,BASE_COLORS.A,'polyA');label([-3.3,1.8,0],'NUKLEUS');label([3.2,1.8,0],'SITOPLASMA');label([0,-1.5,.6],'Pori inti');
    }else{
      const intron='GUAUAG',seq=cut?model.rna:model.rna.slice(0,6)+intron+model.rna.slice(6),stepx=cut?.49:.39;
      for(let i=0;i<seq.length;i++){
        const isIntron=!cut&&i>=6&&i<12,px=(i-(seq.length-1)/2)*stepx,py=isIntron?.85+Math.sin((i-6)/5*Math.PI)*.6:0;
        const pos=[px,py,.2];if(i){const j=i-1,prevIntron=!cut&&j>=6&&j<12;rod([(j-(seq.length-1)/2)*stepx,prevIntron?.85+Math.sin((j-6)/5*Math.PI)*.6:0,.2],pos,.045,isIntron?'#d6ae69':'#97b5a3','rna');}base(pos,seq[i],isIntron?'intron':'rna',.14);
      }
      if(!cut)label([-.5,2.05,.3],'Intron ilustratif','pill','#a9792e');
      if(cut&&step===2){const off=state.progress-step;for(let i=0;i<6;i++)base([-.8+i*.32,1.4+off*.3,.3],intron[i],'intron',.105);label([.1,2.2,.3],'Intron dipotong dan dilepas','pill','#936b24');}
      if(step>=1){ball([-4.65,0,.2],.23,'#cfaa55','cap');label([-4.45,-.8,.3],'Tudung 5′','pill','#9c7a32');}
      if(step>=3){for(let i=0;i<5;i++){const pos=[4.55+i*.22,-.12-i*.1,.2];ball(pos,.09,BASE_COLORS.A,'polyA');if(i)rod([pos[0]-.22,pos[1]+.1,.2],pos,.025,'#cfb279','polyA');}label([4.4,.9,.3],'Ekor poli-A','pill','#9c7a32');}
      label([-4.3,.8,.2],'5′','end');label([4.25,-.8,.2],'3′','end');label([-2,-1.2,.2],cut?'Ekson tersambung':'Ekson 1','caption');label([2,-1.2,.2],cut?'Daerah pengode: 18 basa':'Ekson 2','caption');
    }
    return {items,labels,context:exporting?'Ekspor · nukleus menuju sitoplasma':'Pemrosesan RNA · contoh splicing terpisah'};
  }
  const max=model.translation.length-1,index=clamp(Math.floor(state.progress),0,max),ts=model.translation[index],phase=ts.phase;
  const c=ts.codon,entry=phase==='entry',bond=phase==='bond',move=phase==='move',release=phase==='release',stop=phase==='stop';
  const prevCenter=codonX(Math.max(0,c-1));
  let ribX=(entry||bond||stop)?prevCenter:codonX(c);
  if(move)ribX=state.animating?mix(prevCenter,codonX(c),clamp(state.progress-index,0,1)):codonX(c);
  const spread=release?.55:0;
  ball([ribX,-1.02-spread,-.05],1,'#cdc4e3','ribosome-small',[1.6,.35,.55]);
  ball([ribX,.25+spread,-.5],1,'#bca8d6','ribosome-large',[1.65,.85,.48]);
  rna({y:-.55,z:.5});label([xAt(0)-.38,-.6,.5],'5′','end');label([xAt(n-1)+.38,-.6,.5],'3′','end');
  label([ribX,-1.65,.2],'Ribosom','pill','#7b5b9d');label([-2,-2.3,.3],'mRNA dibaca 5′ → 3′','caption');
  if(state.detail)for(const [site,ox]of [['E',-1.47],['P',0],['A',1.47]])label([ribX+ox,-.05,.8],site,'site','#81639c');
  function trna(cx,codon,empty=false,travel=0){
    const z=.75,y=.04+travel;
    const points=[[cx,-.42+y,z],[cx-.12,.12+y,z],[cx-.55,.36+y,z],[cx-.54,.65+y,z],[cx-.18,.77+y,z],[cx-.12,1.08+y,z],[cx-.33,1.3+y,z],[cx-.27,1.58+y,z],[cx,1.65+y,z],[cx+.27,1.58+y,z],[cx+.33,1.3+y,z],[cx+.12,1.08+y,z],[cx+.18,.77+y,z],[cx+.54,.65+y,z],[cx+.55,.36+y,z],[cx+.12,.12+y,z],[cx,-.42+y,z]];
    points.slice(1).forEach((p,i)=>rod(points[i],p,.045,empty?'#aabbb2':'#559f98','trna'));
    if(!empty){const anti=anticodon(codon);for(let j=0;j<3;j++)base([cx+(j-1)*dx,-.34+y,z],anti[j],'anticodon',.09);ball([cx,1.96+y,z],.18,'#dbb47b','amino');}
    return [cx,1.96+y,z];
  }
  let chainAnchor=[ribX,2.0,.75];
  if(phase!=='scan'&&!release){
    if(entry||bond){trna(prevCenter,model.codons[c-1],bond);const f=state.progress-index;const a=trna(codonX(c),model.codons[c],false,entry&&state.animating?(1-f)*.6:0);chainAnchor=bond?a:[prevCenter,2,.75];}
    else if(stop){trna(prevCenter,model.codons[Math.max(0,c-1)]);ball([codonX(c),.45,.85],.27,'#d5a15e','release-factor');rod([codonX(c),-.25,.85],[codonX(c),.45,.85],.09,'#d5a15e','release-factor');label([codonX(c)+.4,1,.9],'Faktor pelepas','pill','#9a733d');chainAnchor=[prevCenter,2,.75];}
    else{trna(ribX,model.codons[c]);if(move&&c>0)trna(ribX-1.47,model.codons[c-1],true);}
    if(!state.detail)label([ribX,.6,1.2],phase==='init'?'tRNA inisiator':'tRNA','pill','#377c76');
  }
  if(release)chainAnchor=[ribX-1,2.5,.5];
  let previous=null;
  for(let i=0;i<ts.completed;i++){
    const reverse=ts.completed-1-i,pos=[chainAnchor[0]-.42*reverse,chainAnchor[1]+Math.sin(reverse*.65)*.3,chainAnchor[2]];
    if(previous)rod(previous,pos,.055,'#bf8d52','peptide');ball(pos,.18,'#d7a76a','peptide-'+i);label([pos[0],pos[1]+.34,pos[2]],model.chain[i],'amino','#8d6332');previous=pos;
  }
  if(ts.completed)label([chainAnchor[0]-.5,2.9,.6],release?'Rantai polipeptida dilepas':'Rantai polipeptida: N → C','caption','#9e743d');
  return {items,labels,context:'Sitoplasma · sintesis rantai polipeptida'};
}
