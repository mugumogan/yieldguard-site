(() => {
 const section=document.querySelector('[data-yg-issues]');if(!section)return;
 const id=section.dataset.ygIssues;
 const dialog=document.querySelector('#yg-issue-dialog'),form=dialog?.querySelector('form'),message=dialog?.querySelector('[role=status]');
 const output=section.querySelector('.yg-issue-output'),open=section.querySelector('[data-open-issues]');
 const endpoint='/.netlify/functions/hospital-issues?hospital='+encodeURIComponent(id);
 const para=(parent,text,tag='p')=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el};
 function showReport(data){
  if(!data?.report?.issues?.length)return;
  output.replaceChildren();
  let status='Your issue summary is ready. Your weekly newsletter signup is queued for processing.';
  if(data.newsletterStatus==='not_requested')status='Your issue summary is ready. You have not been added to the weekly newsletter.';
  if(data.newsletterStatus==='subscribed')status='Your issue summary is ready. Your weekly newsletter signup has been processed.';
  if(data.newsletterStatus==='unsubscribed')status='Your issue summary is ready. To rejoin YieldGuard Weekly after unsubscribing, use the newsletter Subscribe link below.';
  para(output,status,'p').className='yg-status';
  const list=document.createElement('ol');list.className='yg-findings';
  data.report.issues.slice(0,10).forEach(issue=>{const li=document.createElement('li');para(li,issue.title,'h3');para(li,issue.summary);list.append(li)});output.append(list);
  const notes=document.querySelector('#sources-and-notes');
  if(notes){let evidence=notes.querySelector('.yg-issue-evidence');if(!evidence){evidence=document.createElement('div');evidence.className='yg-issue-evidence';notes.append(evidence)}evidence.replaceChildren();para(evidence,'Issue review evidence','h3');para(evidence,data.report.evidence);const a=document.createElement('a');a.href='https://www.cms.gov/files/document/hospital-price-transparency-frequently-asked-questions.pdf';a.textContent='CMS Hospital Price Transparency FAQ';a.target='_blank';a.rel='noopener';evidence.append(a)}
  open.hidden=true;dialog?.close();output.hidden=false;
 }
 open?.addEventListener('click',()=>{dialog.showModal();form.querySelector('input[type=email]').focus()});
 dialog?.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 form?.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const submit=form.querySelector('button[type=submit]');submit.disabled=true;message.textContent='Saving your signup...';try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.email.value,consent:form.consent.checked,website:form.website.value})});let data=await response.json();if(!response.ok)throw Error(data.error||'Your signup could not be saved.');showReport(data);form.reset();message.textContent='';}catch(err){message.textContent=err.message;}finally{submit.disabled=false}});
 if(open)fetch(endpoint,{credentials:'same-origin'}).then(async r=>{if(r.ok)showReport(await r.json())}).catch(()=>{});
 section.querySelector('[data-share]')?.addEventListener('click',async()=>{const url=location.origin+location.pathname,title=document.querySelector('h1').textContent;const feedback=section.querySelector('.yg-share-status');try{if(navigator.share){await navigator.share({title,url});feedback.textContent='';}else if(navigator.clipboard){await navigator.clipboard.writeText(url);feedback.textContent='Page link copied. Each teammate enters their own email to view the findings.';}else{feedback.textContent=url}}catch(e){if(e.name!=='AbortError')feedback.textContent='Copy the page address to share with your team.'}});
})();
