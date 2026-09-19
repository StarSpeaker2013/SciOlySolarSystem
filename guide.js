const objects=window.GUIDE_DATA;
let place='all',type='All',query='';
const home=document.querySelector('#home');
const explorer=document.querySelector('#explorer');
const details=document.querySelector('#details');
const cards=document.querySelector('#cards');
const title=document.querySelector('#sectionTitle');
const types=document.querySelector('#types');
const search=document.querySelector('#search');
const resultCount=document.querySelector('#resultCount');
const placeNames={inside:'Within the Solar System',outside:'Outside the Solar System',study:'Study Topics & Missions',all:'Complete Study Guide'};
const imageCache=new Map(),usedImages=new Map();
const imageObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){imageObserver.unobserve(entry.target);loadSubjectImage(entry.target)}}),{rootMargin:'250px'}):null;

function imageSearchTerms(subject){
  const item=objects.find(o=>o.name===subject);let name=subject.replace('The Moon','Moon');
  const hints={Stars:'star astronomy',Planets:'planet NASA',Moons:'moon astronomy',Asteroids:'asteroid',Comets:'comet astronomy','Dwarf Planets':'dwarf planet','Small Bodies':'solar system object',Nebulas:'nebula astronomy',Galaxies:'galaxy astronomy',Exoplanets:'exoplanet artist impression',Missions:'spacecraft mission',Observation:'astronomy',Physics:'orbital mechanics',Theory:'planetary science'};
  return `"${name}" ${hints[item?.type]||item?.type||'astronomy'}`;
}
async function findSubjectImage(subject){
  try{
    const url=`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(imageSearchTerms(subject))}&gsrlimit=8&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`;
    const response=await fetch(url);const data=await response.json();
    const candidates=Object.values(data.query?.pages||{}).sort((a,b)=>(a.index||99)-(b.index||99)).filter(page=>page.thumbnail?.source);
    const unique=candidates.find(page=>!usedImages.has(page.thumbnail.source));
    const choice=unique||candidates.find(page=>usedImages.get(page.thumbnail.source)===subject);
    if(!choice)return null;usedImages.set(choice.thumbnail.source,subject);return choice.thumbnail.source;
  }catch{return null}
}
async function loadSubjectImage(img){
  const subject=img.dataset.subject;if(!subject)return;
  if(!imageCache.has(subject))imageCache.set(subject,findSubjectImage(subject));
  const source=await imageCache.get(subject);
  if(source){img.onload=()=>img.classList.add('loaded');img.src=source}
}
function hydrateImages(root){root.querySelectorAll('img[data-subject]').forEach(img=>imageObserver?imageObserver.observe(img):loadSubjectImage(img))}

function availableObjects(){return objects.filter(o=>place==='all'||o.place===place)}
function buildTypes(){
  const names=['All',...new Set(availableObjects().map(o=>o.type))];
  types.innerHTML=names.map(name=>`<button class="type${name===type?' active':''}" data-type="${name}">${name}</button>`).join('');
  types.querySelectorAll('button').forEach(button=>button.onclick=()=>{type=button.dataset.type;buildTypes();render()});
}

function createSpaceBackground(){
  const canvas=document.querySelector('#spaceBackground'),ctx=canvas.getContext('2d');let stars=[];
  function resize(){
    const ratio=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*ratio;canvas.height=innerHeight*ratio;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(ratio,0,0,ratio,0,0);
    const count=Math.max(180,Math.floor(innerWidth*innerHeight/3800));stars=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()**2*2.2+.2,a:Math.random()*.75+.2,p:Math.random()*Math.PI*2,s:Math.random()*.018+.004,h:Math.random()<.12?(Math.random()<.5?205:35):0}));
  }
  function draw(time=0){
    ctx.clearRect(0,0,innerWidth,innerHeight);const base=ctx.createLinearGradient(0,0,0,innerHeight);base.addColorStop(0,'#02030a');base.addColorStop(.55,'#080b20');base.addColorStop(1,'#12091d');ctx.fillStyle=base;ctx.fillRect(0,0,innerWidth,innerHeight);
    [[.16,.2,'rgba(92,40,155,.2)'],[.82,.34,'rgba(20,102,155,.16)'],[.55,.9,'rgba(151,40,101,.12)']].forEach(([x,y,color])=>{const g=ctx.createRadialGradient(innerWidth*x,innerHeight*y,0,innerWidth*x,innerHeight*y,Math.max(innerWidth,innerHeight)*.4);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,innerWidth,innerHeight)});
    stars.forEach(star=>{const alpha=star.a*(.72+.28*Math.sin(time*star.s+star.p));ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fillStyle=star.h?`hsla(${star.h},90%,85%,${alpha})`:`rgba(255,255,255,${alpha})`;ctx.shadowBlur=star.r>1.4?7:0;ctx.shadowColor=ctx.fillStyle;ctx.fill()});ctx.shadowBlur=0;
    requestAnimationFrame(draw);
  }
  resize();addEventListener('resize',resize);requestAnimationFrame(draw);
}

function openExplorer(nextPlace){
  place=nextPlace;type='All';query='';search.value='';home.classList.add('hidden');details.classList.add('hidden');explorer.classList.remove('hidden');buildTypes();render();
}
function render(){
  const needle=query.toLowerCase();
  const shown=availableObjects().filter(o=>(type==='All'||o.type===type)&&(!needle||`${o.name} ${o.summary} ${o.facts.join(' ')}`.toLowerCase().includes(needle)));
  title.textContent=`${placeNames[place]} · ${type}`;
  resultCount.textContent=`${shown.length} study ${shown.length===1?'entry':'entries'}`;
  cards.innerHTML=shown.map(o=>`<button class="card" data-name="${encodeURIComponent(o.name)}" aria-label="Open quick profile for ${o.name}"><span class="card-icon" style="--color:${o.color}"><span>${o.icon}</span><img data-subject="${o.name}" alt="${o.name}" loading="lazy"></span><h3>${o.name}</h3><small>${o.type}${o.parent?` · Orbits ${o.parent}`:''}</small><p>${o.summary}</p><span class="open-card">Quick view <b>→</b></span></button>`).join('')||'<p>No matching study entries.</p>';
  cards.querySelectorAll('.card').forEach(card=>card.onclick=()=>show(decodeURIComponent(card.dataset.name)));
  hydrateImages(cards);
}
function quickFactsFor(o){
  const pairs=Array.from({length:o.facts.length/2},(_,i)=>[o.facts[i*2],o.facts[i*2+1]]);
  const priorities={
    Planets:['Diameter','Distance from Sun','Composition','Gravity','Average temperature','Moons','Year','Day','Atmosphere'],
    'Dwarf Planets':['Diameter','Composition','Distance from Sun','Discovered','Gravity','Temperature','Moons','Year'],
    Stars:['Distance','Radius','Mass','Spectral type','Temperature','Luminosity'],
    Moons:['Diameter','Distance from Earth','Composition','Orbits','Discovered by','Known since','Key traits'],
    Comets:['Size','Composition','Orbital period','Discovered by','Good to know','Key facts'],
    'Small Bodies':['Size','Diameter','Composition / traits','Composition','Discovered by','Good to know'],
    Asteroids:['Size','Diameter','Composition','Class','Discovered by','Good to know','Key traits'],
    Galaxies:['Distance from Earth','Diameter','Galaxy type','Key facts'],
    Nebulas:['Distance from Earth','Size','Nebula type','Discovered by','Known since','Key traits'],
    Exoplanets:['Distance','Size','Radius','Mass','Composition','Orbital period','Year','Detection method','Why it matters'],
    Missions:['Mission summary']
  }[o.type]||[];
  return pairs.sort((a,b)=>{
    const ai=priorities.indexOf(a[0]),bi=priorities.indexOf(b[0]);
    return (ai<0?999:ai)-(bi<0?999:bi);
  }).slice(0,6).flat();
}
function show(name){
  const o=objects.find(x=>x.name===name);if(!o)return;
  const quickFacts=quickFactsFor(o);
  const moons=objects.filter(x=>x.parent===o.name);
  const family=moons.length?moons:o.parent?objects.filter(x=>x.name===o.parent):[];
  const similar=objects.filter(x=>x.type===o.type&&x.name!==o.name&&!family.includes(x)).slice(0,6);
  const related=[...family,...similar];
  const peers=objects.filter(x=>x.type===o.type);const index=peers.indexOf(o);
  const previous=peers[(index-1+peers.length)%peers.length];const next=peers[(index+1)%peers.length];
  explorer.classList.add('hidden');details.classList.remove('hidden');
  details.innerHTML=`<button class="back" id="backToList">← Back to list</button><section class="detail-header"><div class="hero-object" style="--color:${o.color}"><span>${o.icon}</span><img data-subject="${o.name}" alt="${o.name}"></div><div><span class="detail-tag">${o.type}</span><span class="detail-tag">${placeNames[o.place]}</span><h2>${o.name}</h2><p>${o.summary}</p></div></section><h3 class="section-heading">Quick facts</h3><div class="facts">${Array.from({length:quickFacts.length/2},(_,i)=>`<div class="fact"><b>${quickFacts[i*2]}</b><span>${quickFacts[i*2+1]}</span></div>`).join('')}</div>${related.length?`<section class="related"><h3>Keep exploring</h3><div class="related-list">${related.map(item=>`<button data-related="${encodeURIComponent(item.name)}">${item.name}<small>${item.type}</small></button>`).join('')}</div></section>`:''}<nav class="detail-nav"><button data-related="${encodeURIComponent(previous.name)}">← ${previous.name}</button><button data-related="${encodeURIComponent(next.name)}">${next.name} →</button></nav>`;
  document.querySelector('#backToList').onclick=closeDetails;
  details.querySelectorAll('[data-related]').forEach(button=>button.onclick=()=>show(decodeURIComponent(button.dataset.related)));
  hydrateImages(details);
  window.scrollTo({top:0,behavior:'smooth'});
}
function closeDetails(){details.classList.add('hidden');explorer.classList.remove('hidden')}
function goHome(){home.classList.remove('hidden');explorer.classList.add('hidden');details.classList.add('hidden')}
search.addEventListener('input',()=>{query=search.value.trim();render()});
document.querySelectorAll('[data-place]').forEach(button=>button.onclick=()=>openExplorer(button.dataset.place));
window.goHome=goHome;
createSpaceBackground();