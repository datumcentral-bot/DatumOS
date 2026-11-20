import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { actorCheck, demand, OpsError, canReadCase, loadCase, command } from './core.mjs';
export { prisma, loadCase, command };
export async function actor() { const session=await getSession(); if(!session?.user) throw new OpsError(401,'UNAUTHENTICATED','Sign in to continue.'); actorCheck(session.user); const active=await prisma.authUser.findUnique({where:{id:session.user.id},select:{active:true,role:true,linkedEntityId:true}}); demand(active?.active,'UNAUTHENTICATED','This account is inactive.',401); return {...session.user,role:active.role,linkedEntityId:active.linkedEntityId}; }
export function sameOrigin(req) { const origin=req.headers.get('origin'); if(origin) demand(origin===new URL(req.url).origin,'ORIGIN','Cross-origin changes are not permitted.',403); }
export function failure(e) { const known=e instanceof OpsError; return Response.json({error:{code:known?e.code:'PERSISTENCE_UNAVAILABLE',message:known?e.message:'The operation could not be saved. Retry with the same request key.',retryable:!known||e.status>=500}},{status:known?e.status:503,headers:{'Cache-Control':'no-store'}}); }
export async function snapshot(a) {
  const where=a.role==='DIRECTOR'?{}:{OR:[{ownerId:a.id},{project:{assignments:{some:{userId:a.linkedEntityId||'NONE'}}}}]};
  const cases=await prisma.opsCase.findMany({where,orderBy:{createdAt:'desc'},include:{client:true,lead:true,proposal:true,invoice:{include:{opsPayments:true}},project:{include:{tasks:{include:{checklist:true,opsReviews:{orderBy:{createdAt:'desc'},take:5}}},deliverables:true,milestones:true,expenses:true}},documents:{select:{id:true,title:true,revision:true,family:true,originalName:true,sha256:true,size:true,mediaType:true,extractionStatus:true,extractedText:true,anchors:true,limitations:true,createdAt:true}},requirements:true,revisions:{orderBy:{revision:'desc'}},decisions:true,deliveries:true,runs:{orderBy:{createdAt:'desc'},take:20}}});
  const [clients,team,sops,training,activities,settings,issues,followUps]=await Promise.all([
    a.role==='DIRECTOR'?prisma.client.findMany({include:{contacts:true},orderBy:{companyName:'asc'}}):Promise.resolve([]),
    prisma.user.findMany({where:{active:true},select:{id:true,name:true,title:true,division:true,role:true}}),
    prisma.sop.findMany({orderBy:{title:'asc'}}),prisma.opsTraining.findMany(),
    prisma.activityLog.findMany({where:{portal:'operations',...(a.role==='DIRECTOR'?{}:{entityId:{in:cases.map(c=>c.id)}})},orderBy:{createdAt:'desc'},take:60}),
    prisma.opsSetting.findUnique({where:{key:'ai-mode'}}),prisma.coordinationItem.findMany({where:{projectId:{in:cases.map(c=>c.projectId).filter(Boolean)}}}),
    prisma.task.findMany({where:{projectId:null,tags:{contains:'opsCaseId'}},select:{id:true,title:true,dueDate:true,status:true,tags:true,assigneeId:true}})
  ]);
  const visible=cases.map(c=>a.role==='DIRECTOR'?c:{...c,invoice:null,proposal:null,revisions:[],decisions:[],project:c.project?{...c.project,budget:null,contractValue:null,expenses:[]}:null});
  const active=visible.filter(c=>!c.archived), totals={};
  if(a.role==='DIRECTOR') for(const c of active) if(c.invoice) { const k=c.invoice.currency; totals[k]=(totals[k]||0)+Math.round(c.invoice.amount*100); }
  return {actor:{name:a.name,role:a.role,id:a.id,linkedEntityId:a.linkedEntityId},environment:'Isolated development',cases:visible,clients,team,sops,training,activities,issues,followUps:followUps.filter(t=>cases.some(c=>t.tags?.includes(c.id))),metrics:{enquiries:active.length,projects:active.filter(c=>c.projectId).length,pendingApprovals:active.filter(c=>c.revisions[0]?.status==='DRAFT').length,qaQueue:active.flatMap(c=>c.project?.tasks||[]).filter(t=>t.status==='QA_REVIEW').length,failedRuns:active.flatMap(c=>c.runs).filter(r=>r.status==='FAILED').length,draftInvoiceMinorByCurrency:totals},ai:{mode:settings?.value?.mode||'MOCK',live:'BLOCKED — authorised provider configuration required'},integrations:{n8n:'EXPORTED — not imported or running',cortex:'NOT VERIFIED',revit:'Read-only capability discovery; model writes blocked',datumgrok:'PLANNED — authenticated desktop adapter'},health:{database:'CONNECTED',privateStorage:'LOCAL',audit:'Independent audit checkpoints; no live completeness claim'}};
}
