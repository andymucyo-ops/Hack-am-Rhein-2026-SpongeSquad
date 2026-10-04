const LOGICAL_W = 1920;
const LOGICAL_H = 1150;
const ORDER = ['apartments','sidewalk','street','parking lot'];

// Game-balancing estimates, not hydraulic/thermal engineering calculations.
// stormMm = approximate reduction in peak surface ponding during the demo storm.
// coolC   = approximate reduction in hottest hard-surface temperature.
const SECTIONS = {
  apartments:{title:'Apartments',subtitle:'Roof sponge area',options:[
    {id:'unchanged',label:'Unchanged',file:'apartments/unchanged.png',stormMm:0,coolC:0,info:'The existing roof is the baseline: rain runs off quickly and the roof stores more solar heat than a vegetated surface.'},
    {id:'green roof',label:'Green roof',file:'apartments/green roof.png',stormMm:5,coolC:1.6,info:'A planted roof holds part of each rainfall event in its substrate and vegetation. Evapotranspiration also lowers roof temperatures during hot weather.'},
    {id:'green-blue roof',label:'Blue-green roof',file:'apartments/green-blue roof.png',stormMm:8,coolC:1.3,info:'A blue-green roof adds temporary water storage to a planted roof. It delays runoff for longer while still providing vegetation, evaporation and habitat.'}
  ]},
  sidewalk:{title:'Sidewalk',subtitle:'Sponge area',options:[
    {id:'unchanged',label:'Unchanged',file:'sidewalk/unchanged.png',stormMm:0,coolC:0,info:'The conventional sidewalk is mostly sealed, so rainfall has little access to soil and root space.'},
    {id:'street tree + permeatable pavement + bioswale (vegetated drainage strip)',label:'Tree + permeable paving + bioswale',file:'sidewalk/street tree + permeatable pavement + bioswale (vegetated drainage strip).png',stormMm:10,coolC:4.3,info:'Permeable paving admits runoff while the bioswale stores and filters it in planted soil. The street tree adds shade, interception and evapotranspiration while gaining a larger, wetter rooting volume.'}
  ]},
  street:{title:'Street',subtitle:'Surface + detention',options:[
    {id:'unchanged',label:'Unchanged',file:'street/unchanged.png',stormMm:0,coolC:0,info:'Conventional asphalt sheds water rapidly from the carriageway and stores substantial heat in summer.'},
    {id:'permeable asphalt',label:'Permeable asphalt',file:'street/permeable asphalt.png',stormMm:9,coolC:.6,info:'Open-graded asphalt lets rainfall pass through the road surface. A coarse stone detention layer beneath stores water temporarily before slow infiltration or controlled release.'},
    {id:'permeable paving blocks',label:'Permeable paving blocks',file:'street/permeable paving blocks.png',stormMm:11,coolC:1.1,info:'Water passes through porous joints and voids between paving blocks into a detention layer below. This creates temporary subsurface storage without giving up the usable street surface.'}
  ]},
  'parking lot':{title:'Parking lot',subtitle:'Large sponge area',options:[
    {id:'unchanged',label:'Unchanged',file:'parking lot/unchanged.png',stormMm:0,coolC:0,info:'The sealed parking lot is the baseline: nearly all rainfall becomes runoff and the large hard surface heats strongly in sunshine.'},
    {id:'constructed wetland',label:'Constructed wetland',file:'parking lot/constructed wetland.png',stormMm:16,coolC:2.4,info:'A constructed wetland holds stormwater in shallow planted basins. Wetland vegetation and soils slow, filter and biologically treat runoff while creating habitat.'},
    {id:'retention pools',label:'Retention ponds',file:'parking lot/retention pools.png',stormMm:18,coolC:1.8,info:'Retention ponds give stormwater a dedicated place to collect instead of flooding streets. They attenuate the peak flow and can release or infiltrate water gradually after the storm.'},
    {id:'floodable park',label:'Floodable park',file:'parking lot/floodable park.png',stormMm:14,coolC:2.8,info:'A floodable park is normal public space most of the time, but its lower areas safely accept water during cloudbursts. One piece of land therefore serves both recreation and temporary flood storage.'},
    {id:'native vegetation',label:'Native habitat',file:'parking lot/native vegetation.png',stormMm:10,coolC:3.4,info:'De-sealing the parking area and restoring locally appropriate vegetation gives rainfall access to living soil. The result improves infiltration, cooling and habitat at the same time.'}
  ]}
};

const FALLBACK_COORDS = {
  apartments:{unchanged:{x:8,y:0},'green roof':{x:0,y:13},'green-blue roof':{x:1,y:14}},
  sidewalk:{unchanged:{x:444,y:224},'street tree + permeatable pavement + bioswale (vegetated drainage strip)':{x:446,y:221}},
  street:{all:{x:712,y:433}},
  'parking lot':{all:{x:1245,y:500}}
};
const FALLBACK_LINEUP_Y = {
  sidewalk:{unchanged:121,'street tree + permeatable pavement + bioswale (vegetated drainage strip)':118},
  street:{all:166},
  'parking lot':{all:66}
};

const state={
  weather:'mild',displayScale:.60,darkMode:false,
  selected:{},coords:FALLBACK_COORDS,lineupY:FALLBACK_LINEUP_Y,
  images:new Map(),nodes:new Map(),ready:false
};
ORDER.forEach(s=>state.selected[s]='unchanged');

const mount=document.querySelector('#pixiMount');
const canvas=document.createElement('canvas');
canvas.width=LOGICAL_W;canvas.height=LOGICAL_H;
canvas.setAttribute('aria-label','Interactive dissected sponge-city street');
mount.appendChild(canvas);
const ctx=canvas.getContext('2d',{alpha:false});

function key(s){return s.trim().toLowerCase().replace('gree-blue','green-blue').replace(/\s+/g,' ')}
function option(section,id){return SECTIONS[section].options.find(o=>o.id===id)}
function imgKey(section,id){return `${section}|${id}`}
function setHoverInfo(section,id){
  const o=option(section,id);
  const title=document.querySelector('#hoverTitle');
  const text=document.querySelector('#hoverText');
  if(!title||!text)return;
  title.textContent=o.label;
  text.textContent=o.info||'';
}
function resetHoverInfo(){
  const title=document.querySelector('#hoverTitle');
  const text=document.querySelector('#hoverText');
  if(!title||!text)return;
  title.textContent='Hover over an intervention';
  text.textContent='Each option changes how this street section stores water, infiltrates rainfall or reduces heat.';
}

async function readCoordinates(){
  try{
    const res=await fetch('./assets/coordinates.txt',{cache:'no-store'});
    if(!res.ok)throw new Error('coordinates.txt not found');
    const raw=await res.text();
    const assembled={}; const lineupY={};
    let section=null; let mode='assembled';
    for(const source of raw.split(/\r?\n/)){
      const line=source.trim();
      if(!line)continue;
      if(/^--\s*horizontal lineup\s*--$/i.test(line)){mode='lineup';section=null;continue}
      if(/^disclaimer:/i.test(line))continue;
      if(line.endsWith(':')){section=key(line.slice(0,-1));if(mode==='assembled')assembled[section]??={};else lineupY[section]??={};continue}
      if(!section||!line.includes(':'))continue;
      const i=line.indexOf(':'); const name=key(line.slice(0,i)); const rhs=line.slice(i+1).trim();
      if(mode==='assembled'){
        const m=rhs.match(/(-?\d+)\s*,\s*(-?\d+)/);
        if(m)assembled[section][name]={x:+m[1],y:+m[2]};
      }else{
        const m=rhs.match(/^-?\d+/);
        if(m)lineupY[section][name]=+m[0];
      }
    }
    const merged={...FALLBACK_COORDS};
    for(const [s,v] of Object.entries(assembled))merged[s]={...(merged[s]||{}),...v};
    const mergedY={...FALLBACK_LINEUP_Y};
    for(const [s,v] of Object.entries(lineupY))mergedY[s]={...(mergedY[s]||{}),...v};
    return {coords:merged,lineupY:mergedY};
  }catch(err){
    console.warn('Using embedded coordinate fallback:',err);
    return {coords:FALLBACK_COORDS,lineupY:FALLBACK_LINEUP_Y};
  }
}
function coordFor(section,id){const b=state.coords[section]||{};return b[key(id)]||b.all||b.unchanged||{x:0,y:0}}
function lineupYFor(section,id,baseY){const b=state.lineupY[section]||{};return b[key(id)]??b.all??baseY}
function loadImage(url){
  return new Promise((resolve,reject)=>{
    const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(`Could not load ${url}`));im.src=encodeURI(url);
  });
}
async function loadAssets(){
  const failures=[];
  for(const section of ORDER){for(const o of SECTIONS[section].options){
    try{state.images.set(imgKey(section,o.id),await loadImage(`./assets/${o.file}`))}
    catch(err){failures.push(err.message);console.error(err)}
  }}
  return failures;
}
function setupNodes(){ORDER.forEach((section,z)=>{const t=target(section);state.nodes.set(section,{section,z,x:t.x,y:t.y,scale:1,tx:t.x,ty:t.y,ts:1,old:null,fade:1})})}
function target(section){
  const p=coordFor(section,state.selected[section]);
  return {x:p.x,y:p.y,scale:1};
}
function retarget(){for(const section of ORDER){const n=state.nodes.get(section);if(!n)continue;const t=target(section);n.tx=t.x;n.ty=t.y;n.ts=1}}

function buildControls(){
  const grid=document.querySelector('#controlsGrid');grid.innerHTML='';
  for(const section of ORDER){
    const card=document.createElement('article');card.className='section-card';
    card.innerHTML=`<div class="section-head"><h2>${SECTIONS[section].title}</h2><span>${SECTIONS[section].subtitle}</span></div>`;
    const choices=document.createElement('div');choices.className='choices';
    for(const o of SECTIONS[section].options){
      const b=document.createElement('button');b.type='button';b.className='choice-btn'+(o.id==='unchanged'?' active':'');
      b.dataset.section=section;b.dataset.option=o.id;
      b.textContent=o.label;
      b.onclick=()=>swap(section,o.id);
      b.addEventListener('mouseenter',()=>setHoverInfo(section,o.id));
      b.addEventListener('focus',()=>setHoverInfo(section,o.id));
      b.addEventListener('mouseleave',resetHoverInfo);
      b.addEventListener('blur',resetHoverInfo);
      choices.appendChild(b);
    }
    card.appendChild(choices);grid.appendChild(card);
  }
}
function applyDisplayScale(scale){
  state.displayScale=scale;
  document.documentElement.style.setProperty('--scene-scale',String(scale));
  document.querySelectorAll('.scale-btn').forEach(b=>{
    const on=Number(b.dataset.scale)===scale;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));
  });
}
function setTheme(dark){
  state.darkMode=!!dark;
  document.body.classList.toggle('dark',state.darkMode);
  const btn=document.querySelector('#themeToggle');
  if(btn){btn.classList.toggle('active',state.darkMode);btn.setAttribute('aria-pressed',String(state.darkMode));btn.textContent=state.darkMode?'☀ Light mode':'🌙 Dark mode';}
  const meta=document.querySelector('#themeColorMeta');
  if(meta)meta.setAttribute('content',state.darkMode?'#0b1620':'#ddecf5');
  try{localStorage.setItem('sponge-theme',state.darkMode?'dark':'light')}catch{}
}
function initTheme(){
  let dark=false;
  try{dark=localStorage.getItem('sponge-theme')==='dark'}catch{}
  setTheme(dark);
}
function bindTop(){
  document.querySelectorAll('.weather-btn').forEach(b=>b.onclick=()=>setWeather(b.dataset.weather));
  document.querySelectorAll('.scale-btn').forEach(b=>b.onclick=()=>applyDisplayScale(Number(b.dataset.scale)));
  const themeBtn=document.querySelector('#themeToggle');
  if(themeBtn)themeBtn.onclick=()=>setTheme(!state.darkMode);
}
function swap(section,id){
  if(state.selected[section]===id)return;
  const previous=state.selected[section];state.selected[section]=id;const n=state.nodes.get(section);
  if(n){n.old={id:previous,alpha:1};n.fade=0;const t=target(section);n.tx=t.x;n.ty=t.y}
  document.querySelectorAll('.choice-btn').forEach(b=>{if(b.dataset.section===section)b.classList.toggle('active',b.dataset.option===id)});updateMetrics();
}

const clouds=[];const drops=[];const streams=[];const splashes=[];let lightning=0;let lightningWait=4+Math.random()*5;let stormBandOffset=0;
function resetClouds(dark=false){
  clouds.length=0;
  const defs=dark?[]:[[20,80,1.22],[610,155,1.0],[1190,70,1.2],[1630,205,.82]];
  defs.forEach((d,i)=>clouds.push({x:d[0],y:d[1],s:d[2],speed:(dark?4.5:3)+i*.4,dark}));
}
function drawCloud(c){
  ctx.save();ctx.translate(c.x,c.y);ctx.scale(c.s,c.s);ctx.fillStyle=c.dark?'#2e4256':'#fffdf8';
  const blobs=[[52,67,48,34],[91,50,57,46],[137,38,68,56],[190,54,61,47],[235,68,46,33],[118,73,83,38],[179,76,79,35]];
  ctx.beginPath();for(const [x,y,rx,ry] of blobs){ctx.moveTo(x+rx,y);ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2)}ctx.fill();ctx.restore();
}
function drawStormBand(dt){
  // Two perfectly repeating opaque cloud bands. The lower, darker clone sits mostly behind
  // a brighter upper band. Both are shifted ~50 px upward from the previous version.
  const TILE=640;
  stormBandOffset=(stormBandOffset+18*dt)%TILE;
  const blobs=[
    [0,54,118,58],[112,38,128,70],[245,50,142,64],[382,33,126,72],[510,52,136,60],[640,42,118,66]
  ];
  const layer=(y,color,phase)=>{
    ctx.fillStyle=color;
    const shift=(stormBandOffset+phase)%TILE;
    for(let base=-TILE-shift;base<LOGICAL_W+TILE;base+=TILE){
      ctx.beginPath();
      for(const [x,cy,rx,ry] of blobs){ctx.moveTo(base+x+rx,y+cy);ctx.ellipse(base+x,y+cy,rx,ry,0,0,Math.PI*2)}
      ctx.fill();
    }
  };
  ctx.save();
  layer(30,'#273a50',58);   // darker clone, slightly lower/back
  layer(-20,'#4b6787',0);   // front band: a bit darker and bluer, but still lighter than the back band
  ctx.restore();
}
function ensureRain(){
  if(!drops.length)for(let i=0;i<360;i++){const depth=Math.random();drops.push({x:Math.random()*LOGICAL_W,y:Math.random()*LOGICAL_H,len:10+depth*30,width:.7+depth*1.7,speed:1050+depth*1650+Math.random()*450,drift:-90-Math.random()*130,alpha:.32+depth*.58})}
  if(!streams.length)for(let i=0;i<92;i++){const depth=Math.random();streams.push({x:Math.random()*(LOGICAL_W+300),y:Math.random()*(LOGICAL_H+500)-500,len:150+depth*360,width:.65+depth*1.15,speed:1400+depth*1700,drift:-65-Math.random()*65,alpha:.18+depth*.38})}
}
function drawRain(dt){
  ensureRain();
  // Long continuous rain streams form the storm's dense curtain.
  ctx.save();ctx.lineCap='round';
  for(const r of streams){
    ctx.globalAlpha=r.alpha;ctx.strokeStyle='rgba(184,226,247,.96)';ctx.lineWidth=r.width;
    ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+r.drift*.12,r.y+r.len);ctx.stroke();
    r.x+=r.drift*dt;r.y+=r.speed*dt;
    if(r.y>LOGICAL_H+80||r.x<-160){r.x=Math.random()*(LOGICAL_W+300)+40;r.y=-r.len-Math.random()*700}
  }
  // Keep the existing individual drops on top for depth and sparkle.
  for(const d of drops){ctx.globalAlpha=d.alpha;const grad=ctx.createLinearGradient(d.x,d.y,d.x+d.drift*.025,d.y+d.len);grad.addColorStop(0,'rgba(225,248,255,.15)');grad.addColorStop(.45,'rgba(176,226,250,.95)');grad.addColorStop(1,'rgba(78,157,213,.8)');ctx.strokeStyle=grad;ctx.lineWidth=d.width;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.drift*.018,d.y+d.len);ctx.stroke();d.x+=d.drift*dt;d.y+=d.speed*dt;if(d.y>LOGICAL_H+50||d.x<-80){d.x=Math.random()*(LOGICAL_W+250)+30;d.y=-80-Math.random()*500}}
  ctx.restore();ctx.globalAlpha=1;ctx.fillStyle='rgba(118,165,192,.16)';ctx.fillRect(0,865,LOGICAL_W,285);
  if(Math.random()<.72){splashes.push({x:Math.random()*LOGICAL_W,y:885+Math.random()*105,r:1,a:.58});if(splashes.length>85)splashes.shift()}
  ctx.save();ctx.lineWidth=1.3;for(const s of splashes){ctx.globalAlpha=s.a;ctx.strokeStyle='#d9f3ff';ctx.beginPath();ctx.ellipse(s.x,s.y,s.r*3,s.r,0,0,Math.PI*2);ctx.stroke();s.r+=18*dt;s.a-=1.1*dt}ctx.restore();ctx.globalAlpha=1;
  for(let i=splashes.length-1;i>=0;i--)if(splashes[i].a<=0)splashes.splice(i,1);
}
function setWeather(w){
  state.weather=w;document.querySelectorAll('.weather-btn').forEach(b=>{const on=b.dataset.weather===w;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});resetClouds(w==='rainstorm');if(w==='rainstorm'){lightning=0;lightningWait=3+Math.random()*5}updateMetrics();
}
function performanceValues(){
  let stormReduction=0,cooling=0;
  for(const s of ORDER){const o=option(s,state.selected[s]);stormReduction+=o.stormMm;cooling+=o.coolC}
  const basePonding=state.weather==='rainstorm'?46:0;
  const baseSurfaceTemp=state.weather==='heatwave'?57:state.weather==='rainstorm'?23:31;
  return {
    ponding:Math.max(0,Math.round(basePonding-stormReduction)),
    temp:Math.max(state.weather==='rainstorm'?16:22,Math.round((baseSurfaceTemp-cooling)*10)/10)
  };
}
function updateMetrics(){
  const m=performanceValues();
  document.querySelector('#floodValue').textContent=`${m.ponding} mm`;
  document.querySelector('#heatValue').textContent=`${m.temp.toFixed(1)}°C`;
  document.querySelector('#floodBar').style.width=Math.min(100,m.ponding/50*100)+'%';
  document.querySelector('#heatBar').style.width=Math.min(100,Math.max(0,(m.temp-15)/45*100))+'%';
}

function drawBackground(dt){
  const grd=ctx.createLinearGradient(0,0,0,LOGICAL_H);
  if(state.weather==='rainstorm'){grd.addColorStop(0,'#6f899d');grd.addColorStop(1,'#c0d1da')}
  else if(state.weather==='heatwave'){grd.addColorStop(0,'#b4def0');grd.addColorStop(1,'#f0dfbd')}
  else{grd.addColorStop(0,'#a9daf2');grd.addColorStop(1,'#eaf6fb')}
  ctx.fillStyle=grd;ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);
  if(state.weather==='rainstorm')drawStormBand(dt);
  for(const c of clouds){c.x-=c.speed*dt;if(c.x<-430*c.s)c.x=LOGICAL_W+80;drawCloud(c)}
  if(state.weather==='rainstorm'){
    ctx.fillStyle='rgba(27,45,69,.28)';ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);lightningWait-=dt;
    if(lightningWait<=0){lightning=.15;lightningWait=4+Math.random()*6}
    if(lightning>0){ctx.fillStyle=`rgba(245,251,255,${Math.min(.68,lightning*3.6)})`;ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);lightning-=dt}
  }
}
function drawNode(n,dt){
  n.x+=(n.tx-n.x)*Math.min(1,dt*8);n.y+=(n.ty-n.y)*Math.min(1,dt*8);if(n.fade<1)n.fade=Math.min(1,n.fade+dt*4.5);
  const current=state.images.get(imgKey(n.section,state.selected[n.section]));if(!current)return;
  if(n.old){const old=state.images.get(imgKey(n.section,n.old.id));if(old){ctx.globalAlpha=1-n.fade;ctx.drawImage(old,n.x,n.y,old.width,old.height)}if(n.fade>=1)n.old=null}
  ctx.globalAlpha=n.fade;ctx.drawImage(current,n.x,n.y,current.width,current.height);ctx.globalAlpha=1;
}
function drawHeat(time){
  // No animated wavy lines: only a weak warm tint and low-amplitude optical flicker over hard surfaces.
  const pulse=.018+(Math.sin(time/115)*.5+.5)*.018;
  ctx.fillStyle='rgba(255,130,48,.10)';ctx.fillRect(0,0,LOGICAL_W,LOGICAL_H);
  const haze=ctx.createLinearGradient(0,320,0,820);haze.addColorStop(0,'rgba(255,245,218,0)');haze.addColorStop(.55,`rgba(255,244,218,${pulse})`);haze.addColorStop(1,'rgba(255,224,178,0)');ctx.fillStyle=haze;ctx.fillRect(300,260,1600,640);
  // tiny irregular flicker patches, intentionally subtle and not wave-shaped
  for(let i=0;i<7;i++){const a=.008+((Math.sin(time/90+i*1.7)+1)/2)*.012;ctx.fillStyle=`rgba(255,255,236,${a})`;ctx.beginPath();ctx.ellipse(620+i*175,510+(i%2)*55,120,20,0,0,Math.PI*2);ctx.fill()}
}
function render(time){const dt=Math.min(.04,(time-(render.last||time))/1000);render.last=time;drawBackground(dt);if(state.ready)for(const s of ORDER){const n=state.nodes.get(s);if(n)drawNode(n,dt)}if(state.weather==='heatwave')drawHeat(time);if(state.weather==='rainstorm')drawRain(dt);requestAnimationFrame(render)}

function enableScroll(){
  const shell=document.querySelector('#scrollShell');
  shell.addEventListener('wheel',e=>{
    // Normal wheel/trackpad gestures always belong to the page's vertical scroll.
    // Only Shift+wheel deliberately pans the wide scene horizontally.
    if(!e.shiftKey || shell.scrollWidth<=shell.clientWidth)return;
    const dx=Math.abs(e.deltaX)>.1?e.deltaX:e.deltaY;
    if(Math.abs(dx)>.1){shell.scrollLeft+=dx;e.preventDefault()}
  },{passive:false});
}
async function init(){
  buildControls();resetHoverInfo();bindTop();initTheme();applyDisplayScale(.60);resetClouds(false);setWeather('mild');updateMetrics();enableScroll();requestAnimationFrame(render);
  const parsed=await readCoordinates();state.coords=parsed.coords;state.lineupY=parsed.lineupY;
  const failures=await loadAssets();setupNodes();state.ready=true;
  const loading=document.querySelector('#loading');
  if(failures.length){loading.textContent=`Loaded with ${failures.length} missing asset${failures.length===1?'':'s'}.`;loading.style.color='#9b4338';setTimeout(()=>loading.classList.add('hidden'),1800)}else loading.classList.add('hidden');
}
init().catch(err=>{console.error(err);const l=document.querySelector('#loading');l.textContent='The scene hit an initialization error. Weather controls remain available.';l.style.color='#9b4338'});
