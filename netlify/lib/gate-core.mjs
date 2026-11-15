import { createHash, randomBytes } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
const hash = value => createHash('sha256').update(value).digest('hex');
const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Vary':'Cookie, Origin'};
const json = (data,status=200,extra={}) => new Response(JSON.stringify(data),{status,headers:{...headers,...extra}});
const validEmail = email => email.length<=254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) && !/[\r\n]/.test(email);
export function makeHandler({getStore,env=process.env,clock=()=>Date.now(),random=()=>randomBytes(32).toString('hex')}) {
 return async request => {
  try {
   const url=new URL(request.url), site=url.origin;
   let data=JSON.parse(env.YG_ISSUE_DATA||'{}');
   if(data.encoding==='deflate-base64')data=JSON.parse(inflateRawSync(Buffer.from(data.payload,'base64')).toString('utf8'));
   const id=url.searchParams.get('hospital');
   if(!id || !(data.hospitals||{})[id])return json({error:'A hospital-specific issue review is not available here yet.'},404);
   // Nov15 provenance hold: do not serve or collect requests for these reviews.
   if(new Set(['547','1949']).has(id))return json({error:'Review temporarily unavailable while source verification is completed.',held:true},503);
   const hospital={...data.hospitals[id]};
   // Shodair restored only after Nov15 authenticated browser capture and independent recount.
   if(id==='2914'){
    hospital.issues=[{title:'Review zero count with populated median allowed amount',summary:'In the source retrieved November 15, 2026, 81 of 81 applicable payer-plan entries encode Count of Allowed Amounts as 0 while a median allowed amount is populated on the same entries.'}];
    hospital.peerContext='';
    hospital.evidence="The source file identifies Montana Childrens Home & Hospital, reached through Shodair's pricing-transparency page. Authenticated browser download retrieved November 15, 2026; file-declared update: 2026-03-10. Applicable entries have a populated negotiated percentage or algorithm field; all 81 reviewed applicable entries have count exactly 0 and a populated median. These are encoded payer-plan entries, not patients, claims, payments or unique services. Only the hospital can reconcile these fields with its remittance records. This is a field-level review, not a CMS compliance determination, payment-error finding or claim that correction is required. Later source replacements may differ.";
   }
   // Rush target restored after authenticated Nov15 browser capture and independent recount; peers remain held.
   if(id==='1583'){
    hospital.issues=[{title:'Review zero count with populated median allowed amount',summary:'In the source retrieved November 15, 2026, 179,199 of 289,739 applicable payer-plan entries encode Count of Allowed Amounts as 0 while a median allowed amount is populated on the same entries.'}];
    hospital.peerContext='';
    hospital.evidence="Authenticated browser download reached through Rush Memorial Hospital's official price-transparency page, retrieved November 15, 2026. File-declared update: 2026-10-23. Applicable entries have a populated negotiated percentage or algorithm field. The numerator has count exactly 0 and a populated median, with blank 10th-percentile and 90th-percentile fields. These are encoded payer-plan entries, not patients, claims, payments or unique services. Only the hospital can reconcile these fields with its remittance records. This is a field-level review, not a CMS compliance determination, payment-error finding or claim that correction is required. Later source replacements may differ.";
   }
   // Preserve supported target findings, but suppress provisional peer evidence.
   if(/Bingham|Major Hospital|Decatur County Memorial/i.test(hospital.peerContext||''))hospital.peerContext='';
   const report={page:hospital.page,issues:hospital.issues||data.issues,explanation:hospital.explanation||'',review:hospital.review||'',peerContext:hospital.peerContext||'',evidence:hospital.evidence||(data.evidence+(hospital.scope?' '+hospital.scope:''))};
   const store=getStore({name:'yg-issue-access',consistency:'strong'}),leads=getStore({name:'yg-newsletter-consent',consistency:'strong'});
   const cookie=request.headers.get('cookie')||'';
   const match=cookie.match(/(?:^|;\s*)yg_issues=([a-f0-9]{64})(?:;|$)/);
   if(request.method==='GET'){
    if(!match)return json({locked:true},401);
    const session=await store.get('sessions/'+hash(match[1]),{type:'json'});
    if(!session||session.expiresAt<clock()||session.hospital!==id)return json({locked:true},401);
    const lead=session.leadKey?await leads.get(session.leadKey,{type:'json'}):null;
    return json({report,newsletterStatus:session.newsletterConsent===false?'not_requested':lead?.status||'queued'});
   }
   if(request.method!=='POST')return json({error:'Method not allowed'},405,{'Allow':'GET, POST'});
   const origin=request.headers.get('origin');
   if(origin!==site)return json({error:'Please use the form on this hospital page.'},403);
   if(!/application\/json/.test(request.headers.get('content-type')||''))return json({error:'Invalid form format.'},415);
   const body=await request.text();if(body.length>4096)return json({error:'Form is too large.'},413);
   let form;try{form=JSON.parse(body)}catch{return json({error:'Invalid form.'},400)}
   const email=String(form.email||'').trim().toLowerCase();
   if(form.website)return json({error:'Please refresh the page and try again.'},400);
   if(!validEmail(email)||typeof form.consent!=='boolean')return json({error:'Enter a valid email.'},400);
   const now=clock(),day=new Date(now).toISOString().slice(0,10);
   const ip=request.headers.get('x-nf-client-connection-ip')||'unknown';
   const rateKey='rate/'+day+'/'+hash(ip),rate=await store.get(rateKey,{type:'json'});
   if((rate?.count||0)>=20)return json({error:'Too many requests today. Please try again tomorrow.'},429);
   await store.setJSON(rateKey,{count:(rate?.count||0)+1});
   const leadKey='leads/'+hash(email),previous=await leads.get(leadKey,{type:'json'});
   const consentText='Email me YieldGuard Weekly, with hospital price-transparency research and updates. I can unsubscribe at any time.';
   const testOnly=email.endsWith('@example.invalid');
   const status=form.consent?(testOnly?'test':previous?.status==='import-held'?'queued':previous?.status||'queued'):'not_requested';
   const event={at:new Date(now).toISOString(),hospital:id,page:report.page,consent:form.consent,testOnly,consentVersion:'2026-11-14-v2-optional',consentText};
   const lead={...previous,email,status,importEligible:form.consent&&!testOnly,createdAt:previous?.createdAt||event.at,updatedAt:event.at,events:[...(previous?.events||[]).slice(-19),event]};
   // Access is never granted until the private consent record has been persisted.
   const reports=getStore({name:'yg-report-requests',consistency:'strong'});
   await reports.setJSON(leadKey,{...lead,status:form.consent?'newsletter_opt_in':'report_only'});
   const submissionId=hash(email+'|'+event.at+'|'+id+'|'+randomBytes(16).toString('hex'));
   await reports.setJSON('submissions/'+submissionId,{submissionId,email,...event,importEligible:form.consent&&!testOnly,newsletterStatus:status});
   if(form.consent)await leads.setJSON(leadKey,lead);
   const token=random(),expiresAt=now+86400000;
   await store.setJSON('sessions/'+hash(token),{hospital:id,leadKey:form.consent?leadKey:null,newsletterConsent:form.consent,expiresAt});
   return json({report,newsletterStatus:status},200,{'Set-Cookie':`yg_issues=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`});
  }catch{return json({error:'We could not save your signup. Your email has not been confirmed for newsletter processing. Please try again later.'},503)}
 }
}
