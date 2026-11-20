import { prisma } from '@/lib/prisma';
import { command, demand, text } from './core.mjs';
import { failure, sameOrigin } from './server';
import { createHash } from 'node:crypto';
const hits=new Map();
export async function publicIntake(req){try{sameOrigin(req);const body=await req.json();if(body.website?.trim())return Response.json({ok:true,success:true,message:'Received.'},{status:201});
const key=req.headers.get('idempotency-key')||body.idempotencyKey;const email=text(body.email,'Email',254).toLowerCase(),name=text(body.name,'Name',200),company=text(body.company||name,'Company',200),title=text(body.service||body.projectType||'General enquiry','Service',250),message=text(body.scope||body.message||'Contact requested; scope clarification required.','Scope',10000);demand(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'EMAIL','Enter a valid email.');
const identity=createHash('sha256').update(email).digest('hex'),now=Date.now(),recent=(hits.get(identity)||[]).filter(t=>now-t<600000);demand(recent.length<20,'RATE_LIMIT','Too many requests. Please wait before retrying.',429);hits.set(identity,[...recent,now]);if(hits.size>10000)for(const [k,v]of hits)if(v.every(t=>now-t>600000))hits.delete(k);
const result=await command(prisma,{id:'public-intake',role:'DIRECTOR'},key,'public-enquiry',{name,email,company,title,message});return Response.json({...result,ok:true,success:true,message:'Your enquiry has been recorded. Keep this reference for follow-up.'},{status:201});}catch(e){const r=failure(e);const b=await r.json();return Response.json({...b,message:b.error.message},{status:r.status});}}
