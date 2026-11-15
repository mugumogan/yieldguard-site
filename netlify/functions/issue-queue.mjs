import { getStore } from '@netlify/blobs';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
const hash=v=>createHash('sha256').update(v).digest('hex');
const reply=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff',...extra}});
export default async request=>{
 try{
  const url=new URL(request.url),store=getStore({name:'yg-issue-access',consistency:'strong'}),leads=getStore({name:'yg-newsletter-consent',consistency:'strong'});
  if(!process.env.YG_QUEUE_ADMIN_PASSWORD)return reply({error:'Queue administration is not configured.'},503);
  const m=(request.headers.get('cookie')||'').match(/(?:^|;\s*)yg_queue=([a-f0-9]{64})(?:;|$)/);
  const auth=m?await store.get('admin/'+hash(m[1]),{type:'json'}):null;
  let body={};
  if(request.method==='POST'){
   if(request.headers.get('origin')!==url.origin)return reply({error:'Origin not allowed.'},403);
   if(!/application\/json/.test(request.headers.get('content-type')||''))return reply({error:'Invalid format.'},415);
   const raw=await request.text();if(raw.length>4096)return reply({error:'Too large.'},413);try{body=JSON.parse(raw)}catch{return reply({error:'Invalid request.'},400)}
   if(body.action==='login'){
    const ip=request.headers.get('x-nf-client-connection-ip')||'unknown';const key='adminrate/'+new Date().toISOString().slice(0,13)+'/'+hash(ip);const rate=await store.get(key,{type:'json'});if((rate?.count||0)>=10)return reply({error:'Try again later.'},429);await store.setJSON(key,{count:(rate?.count||0)+1});
    const given=hash(String(body.password||'')),expected=hash(process.env.YG_QUEUE_ADMIN_PASSWORD);
    if(!timingSafeEqual(Buffer.from(given),Buffer.from(expected)))return reply({error:'Sign-in failed.'},401);
    const token=randomBytes(32).toString('hex');await store.setJSON('admin/'+hash(token),{expiresAt:Date.now()+28800000});
    return reply({ok:true},200,{'Set-Cookie':`yg_queue=${token}; Path=/.netlify/functions/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`});
   }
  }
  if(!auth||auth.expiresAt<Date.now())return reply({error:'Sign in to view the private queue.'},401);
  if(request.method==='GET'){
   const output=[];for await(const page of leads.list({prefix:'leads/',paginate:true})){for(const blob of page.blobs){const record=await leads.get(blob.key,{type:'json'});if(record){if(record.status==='queued'&&record.importEligible!==true){record.status='import-held';await leads.setJSON(blob.key,record)}output.push({key:blob.key,...record})}}}
   return reply({records:output});
  }
  if(request.method==='POST'&&body.action==='status'){
   if(!/^leads\/[a-f0-9]{64}$/.test(body.key||'')||!['queued','subscribed','unsubscribed','skipped','test','import-held'].includes(body.status))return reply({error:'Invalid queue update.'},400);
   const record=await leads.get(body.key,{type:'json'});if(!record)return reply({error:'Record not found.'},404);
   record.status=body.status;record.processedAt=new Date().toISOString();record.processingNote=String(body.note||'').slice(0,500);await leads.setJSON(body.key,record);return reply({ok:true});
  }
  return reply({error:'Method not allowed'},405);
 }catch{return reply({error:'Queue operation failed.'},503)}
};
