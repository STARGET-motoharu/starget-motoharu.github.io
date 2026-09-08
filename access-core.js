(()=>{
  'use strict';

  const VERSION='v36';
  const KEYS={
    order:`starget.${VERSION}.gate.order`,
    step:`starget.${VERSION}.gate.step`,
    complete:`starget.${VERSION}.auth.complete`,
    session:`starget.${VERSION}.session.id`,
    last:`starget.${VERSION}.last.activity`
  };
  const GATES={pin:'index.html',origin:'origin.html',phrase:'access-03.html'};
  const IDS=Object.keys(GATES);
  const IDLE_MS=30*60*1000;
  let idleTimer=0;
  let lastTouchWrite=0;

  const ss=window.sessionStorage;

  function sessionId(){
    let id=ss.getItem(KEYS.session);
    if(!id){
      id=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
      ss.setItem(KEYS.session,id);
    }
    return id;
  }

  function sharedKey(){ return `starget.${VERSION}.activity.${sessionId()}`; }

  function shuffle(values){
    const arr=[...values];
    for(let i=arr.length-1;i>0;i--){
      let r;
      if(window.crypto&&crypto.getRandomValues){
        const x=new Uint32Array(1);crypto.getRandomValues(x);r=x[0]/4294967296;
      }else r=Math.random();
      const j=Math.floor(r*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  function validOrder(order){
    return Array.isArray(order)&&order.length===IDS.length&&IDS.every(id=>order.includes(id));
  }

  function ensureSequence(){
    let order;
    try{order=JSON.parse(ss.getItem(KEYS.order)||'null');}catch(_){order=null;}
    if(!validOrder(order)){
      order=shuffle(IDS);
      ss.setItem(KEYS.order,JSON.stringify(order));
      ss.setItem(KEYS.step,'0');
      ss.removeItem(KEYS.complete);
      sessionId();
      touch(true);
    }
    let step=Number.parseInt(ss.getItem(KEYS.step)||'0',10);
    if(!Number.isInteger(step)||step<0||step>IDS.length){step=0;ss.setItem(KEYS.step,'0');}
    return {order,step};
  }

  function touch(force=false){
    const now=Date.now();
    if(!force&&now-lastTouchWrite<900)return;
    lastTouchWrite=now;
    ss.setItem(KEYS.last,String(now));
    try{localStorage.setItem(sharedKey(),String(now));}catch(_){/* storage may be unavailable */}
  }

  function lastActivity(){
    const a=Number(ss.getItem(KEYS.last)||0);
    let b=0;
    try{b=Number(localStorage.getItem(sharedKey())||0);}catch(_){/* ignore */}
    return Math.max(a,b);
  }

  function clearSession(){
    let key='';
    try{key=sharedKey();}catch(_){/* ignore */}
    Object.values(KEYS).forEach(k=>ss.removeItem(k));
    if(key){try{localStorage.removeItem(key);}catch(_){/* ignore */}}
  }

  function resetToEntry(reason='reset'){
    clearSession();
    const suffix=reason==='timeout'?'?timeout=1':'';
    window.location.replace(`index.html${suffix}`);
  }

  function installIdleWatch(){
    touch(true);
    const onActivity=()=>touch(false);
    ['pointerdown','pointermove','keydown','touchstart','scroll','wheel'].forEach(type=>{
      window.addEventListener(type,onActivity,{passive:true});
    });
    window.clearInterval(idleTimer);
    idleTimer=window.setInterval(()=>{
      const last=lastActivity();
      if(last&&Date.now()-last>=IDLE_MS) resetToEntry('timeout');
    },15000);
  }

  function guardGate(gateId){
    if(!GATES[gateId])return null;
    if(ss.getItem(KEYS.complete)==='1'){
      window.location.replace('kairo/index.html');
      return null;
    }
    const state=ensureSequence();
    const expected=state.order[state.step];
    if(expected!==gateId){
      window.location.replace(GATES[expected]||'index.html');
      return null;
    }
    installIdleWatch();
    return {gateId,step:state.step+1,total:IDS.length,order:[...state.order]};
  }

  function completeGate(gateId){
    const state=ensureSequence();
    if(state.order[state.step]!==gateId){
      return GATES[state.order[state.step]]||'index.html';
    }
    const nextStep=state.step+1;
    ss.setItem(KEYS.step,String(nextStep));
    touch(true);
    if(nextStep>=state.order.length){
      ss.setItem(KEYS.complete,'1');
      return 'kairo/index.html';
    }
    return GATES[state.order[nextStep]];
  }

  function ordinal(state){return String(state?.step||1).padStart(2,'0');}

  window.STARGET_ACCESS={guardGate,completeGate,resetToEntry,ordinal,IDLE_MS};
})();
