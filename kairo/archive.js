const type=document.body.dataset.archive;
const grid=document.querySelector('#archiveGrid');
const count=document.querySelector('#archiveCount');

const archiveMotionReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let archiveDot=null,archiveRing=null,archiveTX=innerWidth/2,archiveTY=innerHeight/2,archiveRX=archiveTX,archiveRY=archiveTY;
if(!archiveMotionReduced){
  archiveDot=document.createElement('div');archiveDot.className='cursor-dot';archiveDot.setAttribute('aria-hidden','true');document.body.appendChild(archiveDot);
  archiveRing=document.createElement('div');archiveRing.className='cursor-ring';archiveRing.setAttribute('aria-hidden','true');document.body.appendChild(archiveRing);
  window.addEventListener('pointermove',e=>{archiveTX=e.clientX;archiveTY=e.clientY;archiveDot.style.left=e.clientX+'px';archiveDot.style.top=e.clientY+'px'});
  const frame=()=>{archiveRX+=(archiveTX-archiveRX)*.085;archiveRY+=(archiveTY-archiveRY)*.085;archiveRing.style.left=archiveRX+'px';archiveRing.style.top=archiveRY+'px';requestAnimationFrame(frame)};frame();
  document.addEventListener('pointerover',e=>{if(e.target.closest('a,button,.craft-hover')){archiveDot.classList.add('cursor-active');archiveRing.classList.add('cursor-active')}});
  document.addEventListener('pointerout',e=>{const a=e.target.closest?.('a,button,.craft-hover'),b=e.relatedTarget?.closest?.('a,button,.craft-hover');if(a&&a!==b){archiveDot.classList.remove('cursor-active');archiveRing.classList.remove('cursor-active')}});
}
function addArchiveHover(el){
  if(archiveMotionReduced||el.dataset.craftHoverBound==='1')return;
  el.dataset.craftHoverBound='1';
  el.classList.add('craft-hover');
  const sweep=document.createElement('span');sweep.className='craft-hover-sweep';sweep.setAttribute('aria-hidden','true');
  const line=document.createElement('span');line.className='craft-hover-line';line.setAttribute('aria-hidden','true');
  const aperture=document.createElement('span');aperture.className='craft-hover-aperture';aperture.setAttribute('aria-hidden','true');
  const corners=document.createElement('span');corners.className='craft-hover-corners';corners.setAttribute('aria-hidden','true');
  el.append(sweep,line,aperture,corners);
  el.addEventListener('pointermove',event=>{const r=el.getBoundingClientRect();el.style.setProperty('--px',`${((event.clientX-r.left)/r.width)*100}%`);el.style.setProperty('--py',`${((event.clientY-r.top)/r.height)*100}%`)});
}
function bindArchiveMotion(){
  grid?.querySelectorAll('.archive-item,.archive-project-row,.archive-no-data').forEach((el,i)=>{
    el.classList.add('archive-reveal');
    el.style.transitionDelay=`${Math.min(i,8)*65}ms`;
    addArchiveHover(el);
    if(archiveMotionReduced)el.classList.add('on');
  });
  scheduleArchiveMotion();
}
let archiveLastY=window.scrollY,archiveDirection=1,archiveRaf=0;
function updateArchiveMotion(){
  archiveRaf=0;if(archiveMotionReduced)return;
  const y=window.scrollY;if(Math.abs(y-archiveLastY)>2)archiveDirection=y>archiveLastY?1:-1;archiveLastY=y;
  const vh=window.innerHeight||document.documentElement.clientHeight;
  document.querySelectorAll('.archive-reveal').forEach(el=>{
    const r=el.getBoundingClientRect();
    const fullyAbove=r.bottom<-80,fullyBelow=r.top>vh+80;
    const inEntryBand=r.bottom>vh*.08&&r.top<vh*.92;
    if(inEntryBand&&!el.classList.contains('on')){el.classList.add('on');el.classList.remove('craft-exit-up','craft-exit-down')}
    if(!el.classList.contains('on'))return;
    if(fullyAbove||fullyBelow){el.classList.remove('on','craft-exit-up','craft-exit-down');return}
    const up=archiveDirection>0&&r.top<vh*.02&&r.bottom<vh*.40;
    const down=archiveDirection<0&&r.bottom>vh*.98&&r.top>vh*.60;
    el.classList.toggle('craft-exit-up',up);el.classList.toggle('craft-exit-down',down);
    if(!up&&!down)el.classList.remove('craft-exit-up','craft-exit-down');
  });
}
function scheduleArchiveMotion(){if(!archiveRaf)archiveRaf=requestAnimationFrame(updateArchiveMotion)}
window.addEventListener('scroll',scheduleArchiveMotion,{passive:true});
window.addEventListener('resize',scheduleArchiveMotion,{passive:true});

const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const published=(items=[])=>items.filter(item=>item?.published!==false).sort((a,b)=>(a.sort_order??9999)-(b.sort_order??9999));
const filmCard=(item)=>{
  const isYoutube=item.media_type==='youtube';
  const hasVideo=item.media_url&&!isYoutube&&item.media_type!=='none';
  const poster=item.poster_url||'';
  let media='<div class="archive-empty"><span>404</span></div>';
  if(isYoutube&&(poster||item.external_url||item.media_url))media=`<div class="archive-youtube-thumb">${poster?`<img src="${esc(poster)}" alt="${esc(item.title||item.id)}" loading="lazy">`:''}<span>YOUTUBE / PLAY ↗</span></div>`;
  else if(hasVideo)media=`<video muted loop playsinline preload="metadata" ${poster?`poster="${esc(poster)}"`:''}><source src="${esc(item.media_url)}"></video>`;
  const tag=item.year||item.duration||(isYoutube?'YOUTUBE':'FILM');
  const inner=`<div class="archive-film-media">${media}</div><div class="archive-item-meta"><span>${esc(item.id)}</span><strong>${esc(item.title||'Notitle')}</strong><small>${esc(tag)}</small></div>`;
  const href=item.external_url||(isYoutube?item.media_url:null);
  return href?`<a class="archive-item archive-film ${isYoutube?'archive-film-youtube':''}" href="${esc(href)}" target="_blank" rel="noopener">${inner}</a>`:`<article class="archive-item archive-film">${inner}</article>`;
};
const objectCard=(item)=>{let media='<div class="archive-empty"><span>404</span></div>';if(item.model_url){media=`<div class="archive-object-model-shell"><model-viewer class="archive-object-model" src="${esc(item.model_url)}" alt="${esc(item.title||item.id)} 3D model" camera-controls touch-action="pan-y" auto-rotate auto-rotate-delay="1100" rotation-per-second="12deg" shadow-intensity="0.9" exposure="1" interaction-prompt="none" loading="lazy" reveal="auto" crossorigin="anonymous"></model-viewer><span class="archive-model-hint">DRAG / ROTATE / ZOOM</span></div>`}else if(item.poster_url){media=`<img src="${esc(item.poster_url)}" alt="${esc(item.title||item.id)}" loading="lazy">`}const model=item.model_url?`<span class="archive-badge">3D / GLB</span>`:'';return `<article class="archive-item archive-object">${media}<div class="archive-item-meta"><span>${esc(item.id)}</span><strong>${esc(item.title||'Notitle')}</strong><small>${esc(item.year||'OBJECT')}</small>${model}</div></article>`};
const projectCard=(item)=>{const categories=(item.categories||[]).join(' / ')||'PROJECT';const inner=`<span>${esc(item.id)}</span><strong>${esc(item.title||'Notitle')}</strong><em>${esc(categories)}</em><small>${esc(item.year||'—')}</small><i>${item.url?'OPEN ↗':'ARCHIVE'}</i>`;return item.url?`<a class="archive-project-row" href="${esc(item.url)}" target="_blank" rel="noopener">${inner}</a>`:`<article class="archive-project-row">${inner}</article>`};

async function ensureArchiveModelViewer(){
  if(type!=='objects'||customElements.get('model-viewer'))return;
  const sources=['https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js','https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js','https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js'];
  for(const src of sources){try{await new Promise((resolve,reject)=>{const script=document.createElement('script');script.type='module';script.src=src;script.onload=resolve;script.onerror=reject;document.head.appendChild(script)});await customElements.whenDefined('model-viewer');return}catch(error){console.warn('model-viewer archive CDN failed:',src,error)}}
}

async function init(){try{const res=await fetch('data/site-content.json',{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=await res.json();const items=published(data[type]||[]);count.textContent=String(items.length).padStart(2,'0');if(!items.length){grid.innerHTML='<div class="archive-no-data">NO PUBLISHED ITEMS</div>';bindArchiveMotion();return}grid.classList.toggle('archive-project-list',type==='projects');grid.innerHTML=items.map(item=>type==='films'?filmCard(item):type==='objects'?objectCard(item):projectCard(item)).join('');if(type==='objects')await ensureArchiveModelViewer();bindArchiveMotion();if(type==='films'){grid.querySelectorAll('video').forEach(v=>{const card=v.closest('.archive-item');card?.addEventListener('pointerenter',()=>v.play().catch(()=>{}));card?.addEventListener('pointerleave',()=>{v.pause();v.currentTime=0})})}}catch(error){console.warn('Archive data load failed:',error);grid.innerHTML='<div class="archive-no-data">CONTENT DATA COULD NOT BE LOADED</div>';bindArchiveMotion()}}
init();scheduleArchiveMotion();
