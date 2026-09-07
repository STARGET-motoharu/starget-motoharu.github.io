document.documentElement.classList.add('site-ready');

const menuBtn=document.querySelector('.menu-btn');
const menu=document.querySelector('#menu');
const closeBtn=document.querySelector('.menu-close');
function setMenu(open){menu?.classList.toggle('open',open);menu?.setAttribute('aria-hidden',String(!open));menuBtn?.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''}
menuBtn?.addEventListener('click',()=>setMenu(true));closeBtn?.addEventListener('click',()=>setMenu(false));menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));

// V22 — NEO CRAFT motion: entry, departure, scroll-field and slow refractive hover.
// Sections do not simply fade in: they assemble on arrival and quietly disassemble
// as they leave the viewport, borrowing from shoji, emaki, kumiko and joinery logic.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const craftGroups=[
  ['#homeFilms','.film-card',90],
  ['#projectCardGrid','.project-index-row',80],
  ['#soundTrackList','.track',70]
];
function applyCraftStagger(scope=document){
  craftGroups.forEach(([groupSelector,itemSelector,step])=>{
    const group=(scope.matches?.(groupSelector)?scope:scope.querySelector?.(groupSelector))||document.querySelector(groupSelector);
    group?.querySelectorAll(itemSelector).forEach((el,i)=>el.style.setProperty('--craft-delay',`${Math.min(i,8)*step}ms`));
  });
}

const hoverSelector='a,button,.film-card,.process-card,.object-placeholder-card,.project-index-row,.split-panel,.live-card,.live-current-strip,.contact-detail';
function bindCraftHover(scope=document){
  if(reducedMotion)return;
  const roots=[];
  if(scope.matches?.(hoverSelector))roots.push(scope);
  scope.querySelectorAll?.(hoverSelector).forEach(el=>roots.push(el));
  roots.forEach(el=>{
    if(el.dataset.craftHoverBound==='1'||el.classList.contains('contact-link-disabled'))return;
    el.dataset.craftHoverBound='1';
    el.classList.add('craft-hover');
    const sweep=document.createElement('span');
    sweep.className='craft-hover-sweep';
    sweep.setAttribute('aria-hidden','true');
    const line=document.createElement('span');
    line.className='craft-hover-line';
    line.setAttribute('aria-hidden','true');
    const aperture=document.createElement('span');
    aperture.className='craft-hover-aperture';
    aperture.setAttribute('aria-hidden','true');
    const corners=document.createElement('span');
    corners.className='craft-hover-corners';
    corners.setAttribute('aria-hidden','true');
    el.append(sweep,line,aperture,corners);
    el.addEventListener('pointermove',event=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--px',`${((event.clientX-r.left)/r.width)*100}%`);
      el.style.setProperty('--py',`${((event.clientY-r.top)/r.height)*100}%`);
    });
  });
}

const observeReveals=(scope=document)=>{
  applyCraftStagger(scope);
  bindCraftHover(scope);
  if(reducedMotion)scope.querySelectorAll('.reveal').forEach(el=>el.classList.add('on'));
  scheduleCraftMotion();
};
document.querySelectorAll('main > section').forEach(section=>{
  section.classList.add('craft-section');
  if(!section.querySelector(':scope > .craft-field')){
    const field=document.createElement('div');
    field.className='craft-field';
    field.setAttribute('aria-hidden','true');
    field.innerHTML='<span class="craft-field-grid"></span><span class="craft-field-axis"></span><span class="craft-field-node"></span>';
    section.prepend(field);
  }
});

// Geometry-driven motion is intentional here: some craft reveals use clip-path(100%),
// which can report a zero visual intersection to IntersectionObserver. Layout geometry
// keeps entry / exit reliable even when the element is visually rolled or folded shut.
let craftLastScrollY=window.scrollY;
let craftScrollDirection=1;
let craftRaf=0;
function updateCraftMotion(){
  craftRaf=0;
  if(reducedMotion)return;
  const y=window.scrollY;
  if(Math.abs(y-craftLastScrollY)>2)craftScrollDirection=y>craftLastScrollY?1:-1;
  craftLastScrollY=y;
  const vh=window.innerHeight||document.documentElement.clientHeight;
  document.querySelectorAll('.craft-section').forEach(section=>{
    const sr=section.getBoundingClientRect();
    const visible=sr.bottom>0&&sr.top<vh;
    section.classList.toggle('craft-active',visible);
    if(visible){
      const center=sr.top+sr.height*.5;
      const normalized=Math.max(-1,Math.min(1,(center-vh*.5)/(vh+sr.height)*2));
      section.style.setProperty('--craft-shift',`${normalized*42}px`);
      section.style.setProperty('--craft-progress',String((normalized+1)/2));
    }
  });
  document.querySelectorAll('.reveal').forEach(el=>{
    const r=el.getBoundingClientRect();
    const fullyAbove=r.bottom<-80;
    const fullyBelow=r.top>vh+80;
    const inEntryBand=r.bottom>vh*.08&&r.top<vh*.92;
    if(inEntryBand&&!el.classList.contains('on')){
      el.classList.add('on');
      el.classList.remove('craft-exit-up','craft-exit-down');
      el.closest('section')?.classList.add('craft-on');
    }
    if(!el.classList.contains('on'))return;
    if(fullyAbove||fullyBelow){
      el.classList.remove('on','craft-exit-up','craft-exit-down');
      return;
    }
    const leaveTop=craftScrollDirection>0&&r.top<vh*.02&&r.bottom<vh*.40;
    const leaveBottom=craftScrollDirection<0&&r.bottom>vh*.98&&r.top>vh*.60;
    el.classList.toggle('craft-exit-up',leaveTop);
    el.classList.toggle('craft-exit-down',leaveBottom);
    if(!leaveTop&&!leaveBottom)el.classList.remove('craft-exit-up','craft-exit-down');
  });
}
function scheduleCraftMotion(){if(!craftRaf)craftRaf=requestAnimationFrame(updateCraftMotion)}
window.addEventListener('scroll',scheduleCraftMotion,{passive:true});
window.addEventListener('resize',scheduleCraftMotion,{passive:true});
observeReveals();
scheduleCraftMotion();

const dot=document.querySelector('.cursor-dot');
let ring=document.querySelector('.cursor-ring');
if(!ring&&!reducedMotion){ring=document.createElement('div');ring.className='cursor-ring';ring.setAttribute('aria-hidden','true');document.body.appendChild(ring)}
let cursorTX=window.innerWidth/2,cursorTY=window.innerHeight/2,cursorRX=cursorTX,cursorRY=cursorTY;
window.addEventListener('pointermove',e=>{cursorTX=e.clientX;cursorTY=e.clientY;if(dot){dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px'}});
function animateCraftCursor(){if(!ring||reducedMotion)return;cursorRX+=(cursorTX-cursorRX)*.085;cursorRY+=(cursorTY-cursorRY)*.085;ring.style.left=cursorRX+'px';ring.style.top=cursorRY+'px';requestAnimationFrame(animateCraftCursor)}
if(ring)animateCraftCursor();
document.addEventListener('pointerover',e=>{if(e.target.closest('a,button,model-viewer,.craft-hover')){dot?.classList.add('cursor-active');ring?.classList.add('cursor-active')}});
document.addEventListener('pointerout',e=>{const from=e.target.closest?.('a,button,model-viewer,.craft-hover');const to=e.relatedTarget?.closest?.('a,button,model-viewer,.craft-hover');if(from&&from!==to){dot?.classList.remove('cursor-active');ring?.classList.remove('cursor-active')}});

const tokyoDateTop=document.querySelector('#tokyoDateTop');const tokyoTimeTop=document.querySelector('#tokyoTimeTop');
const tokyoDateFmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'});const tokyoTimeFmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
function updateTokyoReadout(){const now=new Date();if(tokyoDateTop)tokyoDateTop.textContent=tokyoDateFmt.format(now).replace(/-/g,'.');if(tokyoTimeTop)tokyoTimeTop.textContent=`${tokyoTimeFmt.format(now)} JST`}updateTokyoReadout();setInterval(updateTokyoReadout,1000);

const esc=(value='')=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const sortPublished=(items=[])=>items.filter(item=>item?.published!==false).sort((a,b)=>(a.sort_order??9999)-(b.sort_order??9999));
const numberFormat=value=>Number.isFinite(Number(value))?Number(value).toLocaleString('en-US').padStart(7,'0'):'NO DATA';

function renderFilm(item){
  const isYoutube=item.media_type==='youtube';
  const hasVideo=item.media_url&&!isYoutube&&item.media_type!=='none';
  const hasYoutube=isYoutube&&(item.poster_url||item.external_url||item.media_url);
  let media='<div class="film-placeholder"><span>404</span></div>';
  let cls='film-card film-empty reveal';
  if(hasYoutube){
    const poster=item.poster_url||'';
    media=`<div class="film-media film-media-youtube">${poster?`<img src="${esc(poster)}" alt="${esc(item.title||item.id)}" loading="lazy">`:''}<span class="film-play-mark">YOUTUBE / PLAY ↗</span></div>`;
    cls='film-card film-youtube reveal';
  }else if(hasVideo){
    media=`<div class="film-media"><video muted loop playsinline preload="metadata" ${item.poster_url?`poster="${esc(item.poster_url)}"`:''}><source src="${esc(item.media_url)}"></video></div>`;
    cls='film-card reveal';
  }
  const hasMedia=hasYoutube||hasVideo;
  const info=`<div class="film-info ${hasMedia?'':'film-info-empty'}"><span>${esc(item.id)}</span><strong>${esc(item.title||'Notitle')}</strong>${item.duration?`<p>${esc(item.duration)}</p>`:''}${item.external_url?'<b>OPEN ↗</b>':''}</div>`;
  const href=item.external_url||(isYoutube?item.media_url:null);
  return href?`<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${media}${info}</a>`:`<article class="${cls}">${media}${info}</article>`;
}
function renderObject(item){let media='<span>404</span>';if(item.model_url){media=`<model-viewer class="object-card-model" src="${esc(item.model_url)}" alt="${esc(item.title||item.id)} 3D model" camera-controls touch-action="pan-y" auto-rotate auto-rotate-delay="1200" rotation-per-second="12deg" shadow-intensity="0.85" exposure="1" interaction-prompt="none" loading="lazy" reveal="auto" crossorigin="anonymous"></model-viewer>`}else if(item.poster_url){media=`<img class="object-poster" src="${esc(item.poster_url)}" alt="${esc(item.title||item.id)}" loading="lazy">`}return `<article class="object-placeholder-card"><div class="object-placeholder object-placeholder-live">${media}</div><div class="object-placeholder-meta"><span>${esc(item.id)}</span><strong>${esc(item.title||'Notitle')}</strong></div></article>`}
function renderProject(item){const categories=(item.categories||[]).join(' / ')||'PROJECT';const inner=`<span>${esc(item.id)}</span><strong>${esc(item.title||'Notitle')}</strong><em>${esc(categories)}</em><i>${item.url?'OPEN ↗':'ARCHIVE'}</i>`;return item.url?`<a class="project-index-row reveal" data-project-id="${esc(item.id)}" href="${esc(item.url)}" target="_blank" rel="noopener">${inner}</a>`:`<article class="project-index-row reveal" data-project-id="${esc(item.id)}">${inner}</article>`}
function renderSound(items){const list=document.querySelector('#soundTrackList');if(!list||!items.length)return;list.innerHTML=items.map((item,i)=>`<button class="track reveal ${i===0?'active':''}" data-track="${String(i+1).padStart(2,'0')}" data-src="${esc(item.mp3_url)}" data-title="${esc(item.title)}"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(item.title)}</strong><i>${i===0?'SELECTED':'PLAY →'}</i></button>`).join('');const first=items[0];const audio=document.querySelector('#soundAudio');if(audio&&first){audio.src=first.mp3_url;audio.load()}const title=document.querySelector('#audioTitle');if(title&&first)title.textContent=first.title;bindSoundPlayer();observeReveals(list);bindCraftHover(list)}
function renderLive(data){const channels=data.youtube?.channels||[];const s=channels.find(c=>c.key==='starget');const l=channels.find(c=>c.key==='starget_lab');if(s?.url)document.querySelector('#channelStarget')?.setAttribute('href',s.url);if(l?.url)document.querySelector('#channelLab')?.setAttribute('href',l.url);const se=document.querySelector('#statusSubscribersStarget');const le=document.querySelector('#statusSubscribersLab');if(se)se.textContent=numberFormat(s?.statistics?.subscribers);if(le)le.textContent=numberFormat(l?.statistics?.subscribers);const lv=data.live_visual||{};const next=lv.next_live;const latest=lv.latest_video;const project=lv.current_project;const nt=document.querySelector('#statusNextLiveTitle');const nm=document.querySelector('#statusNextLiveMeta');if(nt)nt.textContent=next?.title||'NO UPCOMING LIVE';if(nm)nm.textContent=next?.scheduled_at||'SCHEDULE TBD';const vt=document.querySelector('#statusLatestVideoTitle');const vm=document.querySelector('#statusLatestVideoMeta');if(vt)vt.textContent=latest?.title||'NO DATA';if(vm)vm.textContent=latest?.published_at||'—';const pt=document.querySelector('#statusCurrentProjectTitle');const ps=document.querySelector('#statusCurrentProjectState');if(pt)pt.textContent=project?.label||'NO CURRENT PROJECT';if(ps)ps.textContent=project?.status||'—'}
async function loadSiteContent(){try{const res=await fetch('data/site-content.json',{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);const data=await res.json();const limits=data.site?.home_limits||{};const films=sortPublished(data.films).slice(0,limits.films||4);const objects=sortPublished(data.objects).slice(0,limits.objects||4);const projects=sortPublished(data.projects).slice(0,limits.projects||3);const filmGrid=document.querySelector('#homeFilms');const objectGrid=document.querySelector('#homeObjects');const projectGrid=document.querySelector('#projectCardGrid');if(filmGrid&&films.length)filmGrid.innerHTML=films.map(renderFilm).join('');if(objectGrid&&objects.length)objectGrid.innerHTML=objects.map(renderObject).join('');if(projectGrid&&projects.length)projectGrid.innerHTML=projects.map(renderProject).join('');renderSound(sortPublished(data.sound));renderLive(data);observeReveals();bindCraftHover();bindFilmPreviews()}catch(error){console.warn('site-content.json load failed; static HTML fallback remains active.',error);bindSoundPlayer();bindFilmPreviews()}}

let soundBound=false;
function bindSoundPlayer(){
  const audio=document.querySelector('#soundAudio');
  const list=document.querySelector('#soundTrackList');
  const playToggle=document.querySelector('#playToggle');
  const seekBar=document.querySelector('#seekBar');
  const currentTimeEl=document.querySelector('#currentTime');
  const durationTimeEl=document.querySelector('#durationTime');
  const audioTitle=document.querySelector('#audioTitle');
  const audioState=document.querySelector('#audioState');
  const audioPulse=document.querySelector('#audioPulse');
  const restartTrack=document.querySelector('#restartTrack');
  const nextTrack=document.querySelector('#nextTrack');
  const repeatToggle=document.querySelector('#repeatToggle');
  const shuffleToggle=document.querySelector('#shuffleToggle');
  const modeStatus=document.querySelector('#playerModeStatus');
  if(!audio||!list||soundBound)return;
  soundBound=true;

  let repeatMode='off'; // off -> one -> all -> off
  let shuffleOn=false;
  let shuffleQueue=[];

  const formatTime=value=>{if(!Number.isFinite(value))return'00:00';return`${String(Math.floor(value/60)).padStart(2,'0')}:${String(Math.floor(value%60)).padStart(2,'0')}`};
  const tracks=()=>[...list.querySelectorAll('.track[data-src]')];
  const activeIndex=()=>Math.max(0,tracks().findIndex(t=>t.classList.contains('active')));
  const rebuildShuffleQueue=(exclude=activeIndex())=>{
    const pool=tracks().map((_,i)=>i).filter(i=>i!==exclude);
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
    shuffleQueue=pool;
  };
  const updatePlayerUI=()=>{
    const progress=audio.duration?(audio.currentTime/audio.duration)*100:0;
    if(seekBar){seekBar.value=String(progress);seekBar.style.setProperty('--seek',`${progress}%`)}
    if(currentTimeEl)currentTimeEl.textContent=formatTime(audio.currentTime);
    if(durationTimeEl)durationTimeEl.textContent=formatTime(audio.duration);
  };
  const updateModeUI=()=>{
    if(repeatToggle){
      const on=repeatMode!=='off';
      repeatToggle.classList.toggle('active',on);
      repeatToggle.setAttribute('aria-pressed',String(on));
      repeatToggle.dataset.mode=repeatMode;
      const icon=repeatToggle.querySelector('span');
      const label=repeatToggle.querySelector('small');
      if(icon)icon.textContent=repeatMode==='one'?'1↻':'↻';
      if(label)label.textContent=repeatMode==='one'?'REPEAT 1':repeatMode==='all'?'REPEAT ALL':'REPEAT';
      repeatToggle.setAttribute('aria-label',repeatMode==='one'?'Repeat current track':repeatMode==='all'?'Repeat playlist':'Repeat off');
    }
    if(shuffleToggle){shuffleToggle.classList.toggle('active',shuffleOn);shuffleToggle.setAttribute('aria-pressed',String(shuffleOn))}
    const modes=[];if(shuffleOn)modes.push('SHUFFLE');if(repeatMode==='one')modes.push('REPEAT ONE');else if(repeatMode==='all')modes.push('REPEAT ALL');
    if(modeStatus)modeStatus.textContent=modes.length?modes.join(' / '):'SEQUENTIAL';
  };
  const setPlayingUI=playing=>{
    if(playToggle){playToggle.textContent=playing?'PAUSE':'PLAY';playToggle.classList.toggle('playing',playing)}
    if(audioState)audioState.textContent=playing?'PLAYING':'PAUSED';
    if(audioPulse)audioPulse.style.animationPlayState=playing?'running':'paused';
    tracks().forEach(t=>{const i=t.querySelector('i');if(i)i.textContent=t.classList.contains('active')?(playing?'PAUSE':'SELECTED'):'PLAY →'});
  };
  const selectTrack=(index,{autoplay=true,resetShuffle=true}={})=>{
    const all=tracks();if(!all.length)return false;
    const safe=((index%all.length)+all.length)%all.length;const track=all[safe];
    all.forEach(t=>t.classList.toggle('active',t===track));
    if(audio.getAttribute('src')!==track.dataset.src){audio.src=track.dataset.src;audio.load()}
    if(audioTitle)audioTitle.textContent=track.dataset.title||'Untitled';
    if(playToggle)playToggle.setAttribute('aria-label',`Play ${track.dataset.title||'track'}`);
    if(shuffleOn&&resetShuffle)rebuildShuffleQueue(safe);
    if(autoplay)audio.play().catch(()=>setPlayingUI(false));
    else setPlayingUI(false);
    return true;
  };
  const nextAfterEnd=()=>{
    const all=tracks();if(!all.length)return false;const current=activeIndex();
    if(repeatMode==='one'){audio.currentTime=0;audio.play().catch(()=>setPlayingUI(false));return true}
    if(shuffleOn){
      if(!shuffleQueue.length){if(repeatMode!=='all')return false;rebuildShuffleQueue(current)}
      const next=shuffleQueue.shift();if(Number.isInteger(next)){selectTrack(next,{autoplay:true,resetShuffle:false});return true}
      return false;
    }
    if(current<all.length-1){selectTrack(current+1,{autoplay:true});return true}
    if(repeatMode==='all'){selectTrack(0,{autoplay:true});return true}
    return false;
  };
  const skipToNext=()=>{
    const all=tracks();if(!all.length)return false;const current=activeIndex();
    if(shuffleOn){
      if(!shuffleQueue.length)rebuildShuffleQueue(current);
      const next=shuffleQueue.shift();
      if(Number.isInteger(next))return selectTrack(next,{autoplay:!audio.paused,resetShuffle:false});
      return false;
    }
    if(current<all.length-1)return selectTrack(current+1,{autoplay:!audio.paused});
    if(repeatMode==='all')return selectTrack(0,{autoplay:!audio.paused});
    return false;
  };

  list.addEventListener('click',e=>{
    const track=e.target.closest('.track[data-src]');if(!track)return;
    const all=tracks();const index=all.indexOf(track);
    if(track.classList.contains('active')&&!audio.paused){audio.pause();return}
    selectTrack(index,{autoplay:true});
  });
  playToggle?.addEventListener('click',()=>audio.paused?audio.play().catch(()=>setPlayingUI(false)):audio.pause());
  seekBar?.addEventListener('input',()=>{if(audio.duration){audio.currentTime=(Number(seekBar.value)/100)*audio.duration;updatePlayerUI()}});
  restartTrack?.addEventListener('click',()=>{audio.currentTime=0;updatePlayerUI()});
  nextTrack?.addEventListener('click',()=>{skipToNext()});
  repeatToggle?.addEventListener('click',()=>{repeatMode=repeatMode==='off'?'one':repeatMode==='one'?'all':'off';updateModeUI()});
  shuffleToggle?.addEventListener('click',()=>{shuffleOn=!shuffleOn;if(shuffleOn)rebuildShuffleQueue();else shuffleQueue=[];updateModeUI()});

  ['loadedmetadata','durationchange','timeupdate'].forEach(ev=>audio.addEventListener(ev,updatePlayerUI));
  audio.addEventListener('play',()=>setPlayingUI(true));
  audio.addEventListener('pause',()=>setPlayingUI(false));
  audio.addEventListener('ended',()=>{if(!nextAfterEnd()){setPlayingUI(false);if(audioState)audioState.textContent='ENDED'}});
  audio.addEventListener('error',()=>{if(audioState)audioState.textContent='AUDIO ERROR'});
  updateModeUI();
}
function bindFilmPreviews(){document.querySelectorAll('.film-card video:not([data-preview-bound])').forEach(v=>{v.dataset.previewBound='1';const card=v.closest('.film-card');card?.addEventListener('pointerenter',()=>v.play().catch(()=>{}));card?.addEventListener('pointerleave',()=>{v.pause();v.currentTime=0})})}
loadSiteContent();

// 3D MODEL: CDN fallback + interaction.
const modelViewer=document.querySelector('#stargetModel');const modelStatus=document.querySelector('#modelStatus');const panelStatus=document.querySelector('#panelStatus');const cameraReadout=document.querySelector('#cameraReadout');const rotateReadout=document.querySelector('#rotateReadout');const modelLoader=document.querySelector('#modelLoader');const progressBar=document.querySelector('#modelProgressBar');const progressText=document.querySelector('#modelProgressText');const modelRetry=document.querySelector('#modelRetry');const modelHint=document.querySelector('#modelHint');const viewButtons=[...document.querySelectorAll('.model-btn[data-view]')];const autoBtn=document.querySelector('.model-btn[data-toggle="autorotate"]');let modelInitialized=false;
const setProgress=ratio=>{const pct=Math.max(0,Math.min(100,Math.round(ratio*100)));if(progressBar)progressBar.style.width=`${pct}%`;if(progressText)progressText.textContent=`${pct}%`};const setStatus=text=>{if(modelStatus)modelStatus.textContent=text;if(panelStatus)panelStatus.textContent=text};const showModelError=(message='Web-hosted preview recommended for 3D.')=>{setStatus('LOAD ERROR');if(progressText)progressText.textContent='RETRY';if(modelHint)modelHint.textContent=message;if(modelRetry)modelRetry.hidden=false};
const initializeModel=()=>{if(!modelViewer||modelInitialized)return;modelInitialized=true;modelViewer.addEventListener('progress',event=>{const value=event.detail?.totalProgress||0;setProgress(value);setStatus(value>=.98?'FINALIZING':'LOADING')});modelViewer.addEventListener('load',()=>{setProgress(1);setStatus('READY');if(modelHint)modelHint.textContent='3D loaded successfully.';if(modelRetry)modelRetry.hidden=true;if(modelLoader)modelLoader.classList.add('done')});modelViewer.addEventListener('error',showModelError);const views={front:{orbit:'0deg 78deg 105%',fov:'28deg',name:'FRONT'},left:{orbit:'90deg 78deg 105%',fov:'28deg',name:'LEFT'},right:{orbit:'-90deg 78deg 105%',fov:'28deg',name:'RIGHT'},top:{orbit:'0deg 18deg 118%',fov:'26deg',name:'TOP'},reset:{orbit:'45deg 78deg 105%',fov:'28deg',name:'RESET'}};const setActive=btn=>viewButtons.forEach(b=>b.classList.toggle('active',b===btn));viewButtons.forEach(btn=>btn.addEventListener('click',()=>{const v=views[btn.dataset.view];if(!v)return;modelViewer.cameraOrbit=v.orbit;modelViewer.fieldOfView=v.fov;if(cameraReadout)cameraReadout.textContent=v.name;setActive(btn)}));autoBtn?.addEventListener('click',()=>{const active=autoBtn.classList.toggle('active');modelViewer.toggleAttribute('auto-rotate',active);if(rotateReadout)rotateReadout.textContent=active?'AUTO':'MANUAL';setStatus(active?'READY / AUTO':'READY / MANUAL')})};
const loadModelViewer=async()=>{if(customElements.get('model-viewer')){initializeModel();return}setStatus('ENGINE LOAD');if(modelHint&&location.protocol==='file:')modelHint.textContent='3D often fails on file:// preview. Upload or test via a local server.';const sources=['https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js','https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js','https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js'];for(const src of sources){try{await new Promise((resolve,reject)=>{const script=document.createElement('script');script.type='module';script.src=src;script.onload=resolve;script.onerror=reject;document.head.appendChild(script)});await customElements.whenDefined('model-viewer');initializeModel();return}catch(error){console.warn('model-viewer CDN failed:',src,error)}}showModelError(location.protocol==='file:'?'3D may be blocked on file:// preview. It should work once uploaded over HTTPS.':'3D load failed. Please retry.')};
modelRetry?.addEventListener('click',()=>{modelRetry.hidden=true;modelInitialized=false;setProgress(0);setStatus('RETRYING');if(modelHint)modelHint.textContent='Retrying 3D loader...';modelViewer?.setAttribute('src',`assets/ushi.glb?v=${Date.now()}`);loadModelViewer()});loadModelViewer();
