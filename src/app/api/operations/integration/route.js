import { timingSafeEqual } from 'node:crypto';
import { prisma, command, failure } from '@/lib/operations/server';
import { demand } from '@/lib/operations/core.mjs';
export const runtime='nodejs';
export async function POST(req){try{const expected=process.env.DATUM_INTEGRATION_TOKEN,actual=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';demand(expected&&actual.length===expected.length&&timingSafeEqual(Buffer.from(actual),Buffer.from(expected)),'UNAUTHENTICATED','Valid integration authentication is required.',401);const body=await req.json();demand(body.command==='ai-run','COMMAND','Integration may invoke only the requirement review workflow.',403);const result=await command(prisma,{id:'n8n-integration',role:'DIRECTOR'},req.headers.get('idempotency-key'),'ai-run',body.payload||{});return Response.json(result);}catch(e){return failure(e);}}
