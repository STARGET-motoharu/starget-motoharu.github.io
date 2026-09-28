(()=>{
  'use strict';
  const VERSION='v36';
  const IDLE_MS=30*60*1000;
  const KEYS={
    order:`starget.${VERSION}.gate.order`,
    step:`starget.${VERSION}.gate.step`,
    complete:`starget.${VERSION}.auth.complete`,
    session:`starget.${VERSION}.session.id`,
    last:`starget.${VERSION}.last.activity`
  };
  const ss=window.sessionStorage;
  const entry='../index.html';
  let lastWrite=0;

  function sharedKey(){
    const id=ss.getItem(KEYS.session)||'';
    return id?`starget.${VERSION}.activity.${id}`:'';
  }
  function lastActivity(){
    const a=Number(ss.getItem(KEYS.last)||0);
    let b=0;
    const key=sharedKey();
    if(key){try{b=Number(localStorage.getItem(key)||0);}catch(_){/* ignore */}}
    return Math.max(a,b);
  }
  function touch(force=false){
    const now=Date.now();
    if(!force&&now-lastWrite<900)return;
    lastWrite=now;
    ss.setItem(KEYS.last,String(now));
    const key=sharedKey();
    if(key){try{localStorage.setItem(key,String(now));}catch(_){/* ignore */}}
  }
  function logout(reason='timeout'){
    const key=sharedKey();
    Object.values(KEYS).forEach(k=>ss.removeItem(k));
    if(key){try{localStorage.removeItem(key);}catch(_){/* ignore */}}
    window.location.replace(`${entry}${reason==='timeout'?'?timeout=1':''}`);
  }

  if(ss.getItem(KEYS.complete)!=='1'){
    window.location.replace(entry);
    return;
  }

  const last=lastActivity();
  if(!last||Date.now()-last>=IDLE_MS){
    logout('timeout');
    return;
  }

  touch(true);
  const onActivity=()=>touch(false);
  ['pointerdown','pointermove','keydown','touchstart','scroll','wheel'].forEach(type=>{
    window.addEventListener(type,onActivity,{passive:true});
  });
  window.setInterval(()=>{
    const t=lastActivity();
    if(!t||Date.now()-t>=IDLE_MS)logout('timeout');
  },15000);

  window.STARGET_SESSION={logout:()=>logout('manual'),idleMs:IDLE_MS};
})();
