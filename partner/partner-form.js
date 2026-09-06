(function(){
  const q=new URLSearchParams(location.search);
  const m=location.pathname.match(/\/partner\/(p\d{3})/);
  const code=(q.get('ref')||m?.[1]||'p001').toLowerCase();
  const partner=window.DJIGIT_PARTNERS[code]||{name:'DJIGIT Partner',number:'--'};
  const form=document.getElementById('partnerLeadForm');
  const phone=form.elements.phone;
  let startedAt=Date.now();
  partnerNumber.textContent=partner.number;partnerCode.textContent='Partner '+code;partnerName.textContent=partner.name;
  successPartner.textContent=code+' · '+partner.name;form.elements.partner_code.value=code;form.elements.partner_name.value=partner.name;
  const trap=document.createElement('input');
  trap.type='text';trap.name='website';trap.tabIndex=-1;trap.autocomplete='off';trap.setAttribute('aria-hidden','true');trap.className='bot-trap';form.appendChild(trap);
  phone.placeholder='(818) 555-0123';phone.inputMode='numeric';phone.minLength=14;phone.maxLength=14;
  phone.pattern='\\(\\d{3}\\) \\d{3}-\\d{4}';phone.title='Enter a complete 10-digit US phone number, for example (818) 555-0123.';
  phone.addEventListener('input',()=>{
    const d=phone.value.replace(/\D/g,'').replace(/^1(?=\d{10})/,'').slice(0,10);
    if(d.length>6)phone.value=`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    else if(d.length>3)phone.value=`(${d.slice(0,3)}) ${d.slice(3)}`;
    else phone.value=d.length?`(${d}`:'';
    phone.setCustomValidity(d.length===10?'':'Enter all 10 digits of the phone number.');
  });
  whatsappLink.href='https://wa.me/18185352313?text='+encodeURIComponent('Hello! I was referred by your partner '+code+' ('+partner.name+'). I need help with a vehicle.');
  form.addEventListener('submit',async e=>{
    e.preventDefault();const digits=phone.value.replace(/\D/g,'');
    phone.setCustomValidity(digits.length===10?'':'Enter all 10 digits of the phone number.');if(!form.reportValidity())return;
    const b=form.querySelector('button[type=submit]');b.disabled=true;b.textContent='Sending…';
    const payload=Object.fromEntries(new FormData(form));payload.started_at=startedAt;payload.page_url=location.href;payload.submitted_at=new Date().toISOString();
    try{const endpoint=window.DJIGIT_LEAD_ENDPOINT||'';if(!endpoint)throw new Error('Form endpoint is unavailable');await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});formView.hidden=true;successView.hidden=false;successView.focus();}
    catch(_){alert('We could not send your request. Please use WhatsApp or call us.');}
    finally{b.disabled=false;b.textContent='Send request';}
  });
  resetDemo.addEventListener('click',()=>{successView.hidden=true;formView.hidden=false;form.reset();startedAt=Date.now();phone.setCustomValidity('');});
})();
