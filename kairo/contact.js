const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const form=document.querySelector('#contactForm');
const response=document.querySelector('#formResponse');
const progress=document.querySelector('#formProgress');
const message=document.querySelector('#contactMessage');
const messageCount=document.querySelector('#messageCount');
const fields=[...document.querySelectorAll('.field-shell input,.field-shell textarea')];
const requiredFields=[document.querySelector('#contactName'),document.querySelector('#contactSubject'),document.querySelector('#contactMessage')].filter(Boolean);
const submitButton=form?.querySelector('.inquiry-submit');

// Progressive reveal: inspired by measured "ma" rather than a full-screen intro.
requestAnimationFrame(()=>document.querySelectorAll('.contact-page-reveal').forEach((el,i)=>setTimeout(()=>el.classList.add('on'),reducedMotion?0:i*110)));

function updateFormState(){
  const completed=fields.filter(el=>el.value.trim()).length;
  progress.textContent=String(Math.round((completed/fields.length)*100)).padStart(2,'0')+'%';
  if(messageCount)messageCount.textContent=String(message?.value.length||0).padStart(4,'0');
  fields.forEach(el=>el.closest('.field-shell')?.classList.toggle('has-value',!!el.value.trim()));
  const ready=requiredFields.every(el=>el.value.trim() && el.checkValidity());
  if(submitButton){
    submitButton.disabled=!ready;
    submitButton.setAttribute('aria-disabled',String(!ready));
  }
  if(ready && response?.dataset.state==='required'){
    response.textContent='';
    response.removeAttribute('data-state');
  }
}
fields.forEach(el=>{
  el.addEventListener('input',updateFormState);
  el.addEventListener('focus',()=>el.closest('.field-shell')?.classList.add('is-focus'));
  el.addEventListener('blur',()=>el.closest('.field-shell')?.classList.remove('is-focus'));
});
updateFormState();

form?.addEventListener('submit',async e=>{
  e.preventDefault();
  fields.forEach(el=>el.setAttribute('aria-invalid','false'));
  const invalid=requiredFields.find(el=>!el.value.trim() || !el.checkValidity());
  if(invalid){
    invalid.setAttribute('aria-invalid','true');
    response.textContent='INPUT ERROR / NAME, SUBJECT AND DETAILS ARE REQUIRED.';
    response.dataset.state='required';
    invalid.focus();
    updateFormState();
    return;
  }
  const payload={
    name:form.elements.name.value.trim(),
    subject:form.elements.subject.value.trim(),
    contact:form.elements.contact.value.trim(),
    message:form.elements.message.value.trim(),
    source:'starget-official-site',
    created_at:new Date().toISOString()
  };
  const endpoint=(window.STARGET_CONTACT_ENDPOINT||'').trim();
  const button=submitButton;
  if(!endpoint){
    response.textContent='FORM READY / TRANSMISSION ENDPOINT IS NOT CONNECTED YET.';
    response.dataset.state='standby';
    return;
  }
  try{
    button.disabled=true;button.setAttribute('aria-disabled','true');response.textContent='TRANSMITTING...';response.dataset.state='sending';
    const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    form.reset();updateFormState();
    response.textContent='TRANSMISSION COMPLETE / THANK YOU.';response.dataset.state='success';
  }catch(err){
    console.warn('Contact transmission failed',err);
    response.textContent='TRANSMISSION FAILED / PLEASE TRY AGAIN LATER.';response.dataset.state='error';
  }finally{updateFormState()}
});

// Slow Kiriko/urushi cursor: a lagging ring follows the red registration point.
const dot=document.querySelector('.cursor-dot');
const ring=document.querySelector('.cursor-ring');
let tx=innerWidth/2,ty=innerHeight/2,rx=tx,ry=ty;
window.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;if(dot){dot.style.left=tx+'px';dot.style.top=ty+'px'}});
function cursorFrame(){rx+=(tx-rx)*.095;ry+=(ty-ry)*.095;if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px'}requestAnimationFrame(cursorFrame)}
if(!reducedMotion)cursorFrame();
document.addEventListener('pointerover',e=>{if(e.target.closest('a,button,input,textarea')){dot?.classList.add('cursor-active');ring?.classList.add('cursor-active')}});
document.addEventListener('pointerout',e=>{const a=e.target.closest?.('a,button,input,textarea'),b=e.relatedTarget?.closest?.('a,button,input,textarea');if(a&&a!==b){dot?.classList.remove('cursor-active');ring?.classList.remove('cursor-active')}});

// Local pointer coordinates create a slow refracted-glass highlight on form fields.
document.querySelectorAll('.field-shell,.inquiry-submit').forEach(el=>{
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--px',`${((e.clientX-r.left)/r.width)*100}%`);el.style.setProperty('--py',`${((e.clientY-r.top)/r.height)*100}%`)});
});
