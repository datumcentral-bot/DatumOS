import { actor, prisma, command, sameOrigin, failure, snapshot } from '@/lib/operations/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET() { try { return Response.json(await snapshot(await actor()),{headers:{'Cache-Control':'no-store'}}); } catch(e) { return failure(e); } }
export async function POST(req) { try { sameOrigin(req); const a=await actor(); const length=Number(req.headers.get('content-length')||0); if(length>100000) return Response.json({error:{code:'SIZE',message:'Request is too large.'}},{status:413}); const body=await req.json(); const result=await command(prisma,a,req.headers.get('idempotency-key'),body.command,body.payload||{}); return Response.json(result,{headers:{'Cache-Control':'no-store'}}); } catch(e) { return failure(e); } }
