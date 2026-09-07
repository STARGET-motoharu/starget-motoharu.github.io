(() => {
  const ACCESS_CODE='5150'; // Welcome experience code only. Not a security boundary.
  const root=document.documentElement;
  const gate=document.querySelector('#welcomeGate');
  const form=document.querySelector('#welcomeForm');
  const input=document.querySelector('#welcomeCode');
  const status=document.querySelector('#welcomeStatus');
  const unlocked=sessionStorage.getItem('stargetWelcomeAccess')==='1';

  const release=({animate=true}={})=>{
    sessionStorage.setItem('stargetWelcomeAccess','1');
    root.classList.remove('welcome-locked');
    root.classList.add('welcome-unlocked');
    if(!gate)return;
    if(animate){
      gate.classList.add('welcome-granted');
      if(status)status.textContent='ACCESS GRANTED';
      window.setTimeout(()=>gate.remove(),1050);
    }else gate.remove();
  };

  if(unlocked){release({animate:false});}
  else {
    root.classList.add('welcome-locked');
    window.setTimeout(()=>input?.focus(),550);
  }

  form?.addEventListener('submit',event=>{
    event.preventDefault();
    const value=(input?.value||'').trim();
    if(value===ACCESS_CODE){release();return;}
    gate?.classList.remove('welcome-denied');
    void gate?.offsetWidth;
    gate?.classList.add('welcome-denied');
    if(status)status.textContent='ACCESS DENIED';
    if(input){input.value='';input.focus();}
    window.setTimeout(()=>{if(status)status.textContent='4 DIGIT / REQUIRED'},1100);
  });

  // KAIRO is deliberately not authenticated in client-side JavaScript.
  // A future Cloudflare Worker will verify reward keys and return a redirect.
  const kairoForm=document.querySelector('#kairoAccessForm');
  const kairoInput=document.querySelector('#kairoAccessKey');
  const kairoStatus=document.querySelector('#kairoAccessStatus');
  let busy=false;
  kairoForm?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy)return;
    const key=(kairoInput?.value||'').trim();
    if(!key){if(kairoStatus)kairoStatus.textContent='ACCESS KEY / REQUIRED';return;}
    const endpoint=window.KAIRO_CONFIG?.authEndpoint;
    if(!endpoint){
      if(kairoStatus)kairoStatus.textContent='KEY SYSTEM / NOT YET ISSUED';
      kairoForm.classList.add('kairo-pending');
      window.setTimeout(()=>kairoForm.classList.remove('kairo-pending'),900);
      return;
    }
    busy=true;
    if(kairoStatus)kairoStatus.textContent='VERIFYING / ...';
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),window.KAIRO_CONFIG?.requestTimeoutMs||8000);
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key}),signal:controller.signal,credentials:'omit'});
      const data=await response.json().catch(()=>({}));
      if(response.ok&&data.ok&&data.redirect){
        if(kairoStatus)kairoStatus.textContent='ACCESS GRANTED';
        location.assign(data.redirect);
      }else{
        if(kairoStatus)kairoStatus.textContent='ACCESS DENIED';
        if(kairoInput){kairoInput.value='';kairoInput.focus();}
      }
    }catch(error){
      if(kairoStatus)kairoStatus.textContent=error?.name==='AbortError'?'VERIFY / TIMEOUT':'VERIFY / OFFLINE';
    }finally{clearTimeout(timer);busy=false;}
  });
})();
