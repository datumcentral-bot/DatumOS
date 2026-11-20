import { createHash, randomUUID } from 'node:crypto';

export class OpsError extends Error {
  constructor(status, code, message) { super(message); this.status=status; this.code=code; }
}
export function demand(ok, code, message, status=422) { if(!ok) throw new OpsError(status,code,message); }
export const hash = value => createHash('sha256').update(typeof value==='string'?value:JSON.stringify(canonical(value))).digest('hex');
export function canonical(value) {
  if(Array.isArray(value)) return value.map(canonical);
  if(value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
  return value;
}
export function text(value,name,max=5000,optional=false) {
  demand(typeof value==='string', 'VALIDATION', `${name} must be text.`);
  const s=value.trim(); demand((optional||s.length>0)&&s.length<=max,'VALIDATION',`${name} is required and must contain at most ${max} characters.`); return s;
}
export function currency(value) { demand(['GBP','USD','AED','PKR','EUR'].includes(value),'CURRENCY','Choose GBP, USD, AED, PKR or EUR.'); return value; }
export function minor(value) {
  demand(typeof value==='string'&&/^\d{1,7}(\.\d{1,2})?$/.test(value),'MONEY','Enter a non-negative amount with up to two decimal places.');
  const [a,b='']=value.split('.'); const n=Number(a)*100+Number(b.padEnd(2,'0'));
  demand(Number.isSafeInteger(n)&&n<=2000000000,'MONEY','Amount exceeds the supported limit.'); return n;
}
export function priceLines(lines) {
  demand(Array.isArray(lines)&&lines.length>0&&lines.length<=100,'LINES','Add between 1 and 100 priced lines.');
  let total=0; const priced=lines.map(l=>{
    const description=text(l.description,'Line description',500);
    demand(Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=100000,'QUANTITY','Quantity must be a positive whole number.');
    const rateMinor=minor(l.rate), amountMinor=l.quantity*rateMinor; total+=amountMinor;
    demand(Number.isSafeInteger(total)&&total<=2000000000,'MONEY','Total exceeds the supported limit.');
    return {description,quantity:l.quantity,rateMinor,amountMinor};
  }); return {lines:priced,total};
}
export function date(value,name) { demand(typeof value==='string'&&value.length<=40&&!Number.isNaN(Date.parse(value)),'DATE',`${name} must be a valid date.`); return new Date(value); }
export function actorCheck(actor,director=false) { demand(actor?.id&&['DIRECTOR','MEMBER'].includes(actor.role),'FORBIDDEN','This operation requires an authorised operations user.',403); if(director) demand(actor.role==='DIRECTOR','FORBIDDEN','This operation requires a director.',403); }
export const ref = prefix => `${prefix}-${randomUUID().slice(0,8).toUpperCase()}`;
export function fingerprint(task) { return hash({title:task.title,description:task.description,assigneeId:task.assigneeId,checklist:task.checklist.map(i=>({id:i.id,label:i.label,checked:i.checked})).sort((a,b)=>a.id.localeCompare(b.id))}); }
export async function canReadCase(db,actor,c) {
  actorCheck(actor); if(actor.role==='DIRECTOR'||c.ownerId===actor.id) return true;
  return !!(c.projectId&&actor.linkedEntityId&&await db.projectAssignment.findFirst({where:{projectId:c.projectId,userId:actor.linkedEntityId}}));
}
export async function loadCase(db,actor,id) {
  const c=await db.opsCase.findUnique({where:{id}}); demand(c,'NOT_FOUND','Enquiry not found.',404);
  demand(await canReadCase(db,actor,c),'FORBIDDEN','You cannot access this enquiry.',403); return c;
}
export async function assertQa(db,task) {
  demand(task.checklist.length>0&&task.checklist.every(i=>i.checked),'QA_CHECKLIST','Complete every checklist item before approval.',409);
  const approved=await db.opsTaskReview.findFirst({where:{taskId:task.id,decision:'APPROVED',fingerprint:fingerprint(task)},orderBy:{createdAt:'desc'}});
  demand(approved,'QA_APPROVAL','An independent reviewer must approve this exact task revision.',409); return approved;
}

export async function event(db,actor,action,entityId,summary) {
  await db.activityLog.create({data:{actor:actor.id,action,entity:'OpsCase',entityId,summary,portal:'operations'}});
}

export async function command(db,actor,key,name,payload,options={}) {
  actorCheck(actor);
  demand(typeof key==='string'&&/^[A-Za-z0-9_:.\-]{8,160}$/.test(key),'IDEMPOTENCY_KEY','A stable idempotency key (8–160 characters) is required.');
  const receiptKey=`${actor.id}:${key}`, digest=hash({name,payload});
  for(let attempt=0;attempt<4;attempt++) {
    try { return await db.$transaction(async tx=>{
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${receiptKey}))`;
      const old=await tx.opsReceipt.findUnique({where:{key:receiptKey}});
      if(old) { demand(old.hash===digest,'KEY_CONFLICT','This request key was already used for different content.',409); return {...old.result,replayed:true}; }
      if(payload.caseId) { await tx.$queryRaw`SELECT id FROM "OpsCase" WHERE id=${payload.caseId} FOR UPDATE`; }
      const result=await perform(tx,actor,name,payload,options);
      if(options.failAt==='before-receipt') throw new OpsError(503,'INJECTED_FAILURE','Isolated test failure.');
      await tx.opsReceipt.create({data:{key:receiptKey,hash:digest,result}});
      return result;
    },{maxWait:10000,timeout:20000,isolationLevel:'Serializable'}); }
    catch(e) { if(['P2034','P2002'].includes(e.code)&&attempt<3) { await new Promise(r=>setTimeout(r,30*(attempt+1))); continue; } throw e; }
  }
}

async function perform(db,a,name,p,o) {
  if(name==='public-enquiry') {
    const client=await perform(db,a,'client-create',{company:p.company,contact:p.name,email:p.email},o);
    return perform(db,a,'enquiry-create',{clientId:client.clientId,title:p.title,message:p.message,source:'WEBSITE'},o);
  }
  if(name==='client-create') {
    actorCheck(a,true); const email=text(p.email,'Contact email',254).toLowerCase(); demand(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'EMAIL','Enter a valid contact email.');
    const company=text(p.company,'Company',200), contact=text(p.contact,'Contact name',200);
    const found=await db.client.findFirst({where:{companyName:company,contactEmail:email,status:'ACTIVE'}});
    if(found) return {clientId:found.id,existing:true};
    const c=await db.client.create({data:{companyName:company,contactName:contact,contactEmail:email,notes:p.synthetic===true?'SYNTHETIC DEMO RECORD':null,contacts:{create:{name:contact,email,isPrimary:true}}}});
    await event(db,a,'CLIENT_CREATED',c.id,'Client and primary contact recorded.'); return {clientId:c.id};
  }
  if(name==='enquiry-create') {
    const title=text(p.title,'Enquiry title',250), message=text(p.message,'Enquiry description',10000), clientId=text(p.clientId,'Client',100);
    const c=await db.client.findUnique({where:{id:clientId}}); demand(c&&c.status==='ACTIVE','CLIENT','Choose an active client.');
    actorCheck(a,true);
    const l=await db.lead.create({data:{company:c.companyName,contactName:c.contactName,contactEmail:c.contactEmail,notes:message,source:p.source||'operations',convertedToClientId:c.id}});
    if(o.failAt==='lead') throw new OpsError(503,'INJECTED_FAILURE','Isolated test failure.');
    const q=await db.quoteRequest.create({data:{name:c.contactName,email:c.contactEmail,company:c.companyName,message,projectType:title}});
    if(o.failAt==='quote') throw new OpsError(503,'INJECTED_FAILURE','Isolated test failure.');
    const item=await db.opsCase.create({data:{reference:ref('ENQ'),title,clientId:c.id,leadId:l.id,quoteRequestId:q.id,ownerId:a.id,synthetic:p.synthetic===true}});
    await event(db,a,'ENQUIRY_RECEIVED',item.id,'Enquiry, lead and receipt committed together.'); return {caseId:item.id,reference:item.reference,leadId:l.id};
  }
  if(name==='sop-create') {
    actorCheck(a,true); const s=await db.sop.create({data:{title:text(p.title,'SOP title',200),code:ref('SOP'),steps:text(p.steps,'Steps',10000),status:'ACTIVE'}}); await event(db,a,'SOP_CREATED',s.id,'SOP recorded.'); return {id:s.id};
  }
  if(name==='training') {
    actorCheck(a,true); demand(await db.user.findUnique({where:{id:p.userId}}),'USER','Choose a team member.'); demand(await db.sop.findUnique({where:{id:p.sopId}}),'SOP','Choose an SOP.');
    demand(['ASSIGNED','COMPLETED'].includes(p.status),'STATUS','Choose assigned or completed.');
    const row=await db.opsTraining.upsert({where:{userId_sopId:{userId:p.userId,sopId:p.sopId}},create:{userId:p.userId,sopId:p.sopId,status:p.status,completedAt:p.status==='COMPLETED'?new Date():null},update:{status:p.status,completedAt:p.status==='COMPLETED'?new Date():null}}); await event(db,a,'TRAINING_RECORDED',row.id,'Training status recorded.'); return {id:row.id};
  }
  if(name==='settings') {
    actorCheck(a,true); demand(['MOCK','LIVE'].includes(p.mode),'MODE','Choose MOCK or LIVE.');
    await db.opsSetting.upsert({where:{key:'ai-mode'},create:{key:'ai-mode',value:{mode:p.mode}},update:{value:{mode:p.mode}}});
    await event(db,a,'SETTINGS_UPDATED',null,'AI mode preference changed; LIVE requires authorised environment configuration.'); return {mode:p.mode};
  }
  const c=await loadCase(db,a,p.caseId);
  if(name==='archive') { actorCheck(a,true); await db.opsCase.update({where:{id:c.id},data:{archived:p.archived===true}}); await event(db,a,'ARCHIVE_CHANGED',c.id,p.archived?'Enquiry archived.':'Enquiry restored.'); return {caseId:c.id}; }
  demand(!c.archived,'ARCHIVED','Restore this enquiry before changing it.',409);
  if(name==='document-record') {
    const duplicate=await db.opsDocument.findFirst({where:{caseId:c.id,sha256:p.sha256,family:p.family}}); if(duplicate) return {documentId:duplicate.id,duplicate:true};
    const previous=await db.opsDocument.findFirst({where:{caseId:c.id,family:p.family},orderBy:{revision:'desc'}});
    const d=await db.opsDocument.create({data:{caseId:c.id,title:p.title,family:p.family,revision:(previous?.revision||0)+1,originalName:p.originalName,storageKey:p.storageKey,sha256:p.sha256,size:p.size,mediaType:p.mediaType,uploadedBy:a.id}});
    await event(db,a,'DOCUMENT_RECEIVED',c.id,`Private document revision ${d.revision} recorded.`); return {documentId:d.id,revision:d.revision};
  }
  if(name==='document-extraction') {
    const d=await db.opsDocument.findFirst({where:{id:p.documentId,caseId:c.id}}); demand(d,'DOCUMENT','Document not found.',404);
    demand(!await db.opsRequirement.findFirst({where:{documentId:d.id,status:'ACCEPTED'}}),'REVIEWED','Upload a new revision instead of replacing reviewed extraction.',409);
    demand(['EXTRACTED','OCR_REQUIRED','UNSUPPORTED','FAILED'].includes(p.status),'EXTRACTION','Invalid extraction status.');
    await db.opsDocument.update({where:{id:d.id},data:{extractionStatus:p.status,extractedText:p.extractedText||null,anchors:p.anchors||[],limitations:p.limitations||null}});
    await db.opsRequirement.deleteMany({where:{documentId:d.id}});
    if(p.status==='EXTRACTED') for(const row of (p.anchors||[]).slice(0,100)) await db.opsRequirement.create({data:{caseId:c.id,documentId:d.id,anchor:row.anchor,text:row.text,kind:'FACT'}});
    await event(db,a,'EXTRACTION_RECORDED',c.id,`Local extraction: ${p.status}.`); return {documentId:d.id,status:p.status};
  }
  if(name==='requirement-review') {
    const r=await db.opsRequirement.findFirst({where:{id:p.requirementId,caseId:c.id}}); demand(r,'REQUIREMENT','Requirement not found.',404);
    demand(!c.proposalId,'PROPOSAL_EXISTS','Source reviews are frozen once proposal drafting begins. Use a new enquiry/change scope for new requirements.',409);
    demand(['ACCEPTED','REJECTED'].includes(p.status),'STATUS','Choose accepted or rejected.');
    await db.opsRequirement.update({where:{id:r.id},data:{status:p.status,reviewedBy:a.id,reviewedAt:new Date()}}); return {requirementId:r.id,status:p.status};
  }
  if(name==='proposal-save') {
    actorCheck(a,true); demand(!c.projectId&&!await db.opsClientDecision.findFirst({where:{caseId:c.id}}),'ACCEPTED','Accepted scope is locked. Record a separate change enquiry.',409);
    const facts=await db.opsRequirement.findMany({where:{caseId:c.id,status:'ACCEPTED'}}); demand(facts.length>0,'REQUIREMENTS','Review and accept at least one sourced requirement first.',409);
    const title=text(p.title,'Proposal title',250),scope=text(p.scope,'Scope',15000), assumptions=text(p.assumptions||'','Assumptions / missing information',5000,true),cur=currency(p.currency),priced=priceLines(p.lines);
    const prev=await db.opsProposalRevision.findFirst({where:{caseId:c.id},orderBy:{revision:'desc'}}), rev=(prev?.revision||0)+1;
    const content={title,scope,assumptions,currency:cur,lines:priced.lines,sources:facts.map(f=>({id:f.id,documentId:f.documentId,anchor:f.anchor,text:f.text}))};
    const r=await db.opsProposalRevision.create({data:{caseId:c.id,revision:rev,title,scope,currency:cur,amountMinor:priced.total,lines:content,assumptions,contentHash:hash(content),preparedBy:a.id}});
    let proposal;
    const values={title,scope,value:priced.total/100,currency:cur,revision:rev,status:'DRAFT',notes:assumptions};
    if(c.proposalId) proposal=await db.proposal.update({where:{id:c.proposalId},data:values});
    else proposal=await db.proposal.create({data:{...values,proposalNo:ref('PROP'),clientId:c.clientId,leadId:c.leadId}});
    await db.opsCase.update({where:{id:c.id},data:{proposalId:proposal.id,status:'PROPOSAL_DRAFT'}});
    await event(db,a,'PROPOSAL_REVISED',c.id,`Proposal revision ${rev} saved; fresh internal approval required.`); return {revisionId:r.id,revision:rev};
  }
  if(name==='proposal-approve'||name==='proposal-reject') {
    actorCheck(a,true); const r=await latestRevision(db,c.id); demand(r.id===p.revisionId,'STALE_REVISION','Review the latest proposal revision.',409);
    demand(r.status==='DRAFT','STATUS','Only a draft revision can be reviewed.',409);
    const status=name==='proposal-approve'?'APPROVED':'REJECTED';
    await db.opsProposalRevision.update({where:{id:r.id},data:{status,approvedBy:a.id,approvedAt:new Date()}});
    await db.proposal.update({where:{id:c.proposalId},data:{status:status==='APPROVED'?'INTERNALLY_APPROVED':'REVISED'}});
    await db.opsCase.update({where:{id:c.id},data:{status:status==='APPROVED'?'AWAITING_CLIENT':'PROPOSAL_DRAFT'}});
    await event(db,a,`PROPOSAL_${status}`,c.id,`Internal decision for revision ${r.revision}; no client acceptance implied.`); return {revisionId:r.id,status};
  }
  if(name==='client-accept') {
    actorCheck(a,true); const r=await latestRevision(db,c.id); demand(r.id===p.revisionId&&r.status==='APPROVED','APPROVAL','The latest revision needs internal approval first.',409);
    const doc=await db.opsDocument.findFirst({where:{id:p.documentId,caseId:c.id}}); demand(doc,'EVIDENCE','Upload client acceptance evidence to this enquiry first.');
    const row=await db.opsClientDecision.create({data:{caseId:c.id,revisionId:r.id,evidenceDocumentId:doc.id,acceptedBy:text(p.acceptedBy,'Client representative',200),acceptedAt:date(p.acceptedAt,'Acceptance date'),recordedBy:a.id,note:text(p.note,'Evidence description',2000)}});
    await db.opsCase.update({where:{id:c.id},data:{status:'CLIENT_ACCEPTED'}}); await db.proposal.update({where:{id:c.proposalId},data:{status:'WON',decisionAt:row.acceptedAt}});
    await event(db,a,'CLIENT_ACCEPTANCE_RECORDED',c.id,`Client acceptance evidence recorded for revision ${r.revision}.`); return {acceptanceId:row.id};
  }
  if(name==='project-create') {
    actorCheck(a,true); demand(!c.projectId,'PROJECT_EXISTS','This enquiry already has a project.',409);
    const r=await latestRevision(db,c.id),decision=await db.opsClientDecision.findUnique({where:{revisionId:r.id}}); demand(decision&&r.status==='APPROVED','ACCEPTANCE','Record acceptance of the latest approved revision first.',409);
    const pr=await db.project.create({data:{name:text(p.name,'Project name',250),code:ref('PRJ'),clientId:c.clientId,description:r.scope,contractValue:r.amountMinor/100,progressPct:0,healthScore:0,health:'NOT_ASSESSED'}});
    await db.opsCase.update({where:{id:c.id},data:{projectId:pr.id,status:'PROJECT_ACTIVE'}}); await db.proposal.update({where:{id:c.proposalId},data:{projectId:pr.id}});
    await db.deliverable.create({data:{projectId:pr.id,title:r.title,description:r.scope,status:'PENDING'}}); await event(db,a,'PROJECT_CREATED',c.id,'Project created from accepted revision.'); return {projectId:pr.id};
  }
  if(['task-create','follow-up'].includes(name)) {
    demand(name==='follow-up'||c.projectId,'PROJECT','Create a project before delivery tasks.',409);
    const assignee=await db.user.findUnique({where:{id:p.assigneeId}}); demand(assignee&&assignee.active,'ASSIGNEE','Choose an active team member.');
    const labels=(p.checklist||[]).map(i=>text(i,'Checklist item',300)); demand(name==='follow-up'||labels.length>0,'CHECKLIST','Add at least one QA checklist item.');
    const t=await db.task.create({data:{title:text(p.title,'Task title',250),description:name==='follow-up'?`Enquiry follow-up: ${c.reference}`:null,projectId:name==='follow-up'?null:c.projectId,assigneeId:assignee.id,dueDate:p.dueDate?date(p.dueDate,'Due date'):null,divisionCode:p.discipline?text(p.discipline,'Discipline',30):null,tags:JSON.stringify({opsCaseId:c.id,followUp:name==='follow-up'}),qaRequired:name!=='follow-up',checklist:{create:labels.map((label,orderIndex)=>({label,orderIndex}))}}});
    if(c.projectId) await db.projectAssignment.upsert({where:{id:`ops-${c.projectId}-${assignee.id}`},create:{id:`ops-${c.projectId}-${assignee.id}`,projectId:c.projectId,userId:assignee.id,role:'DELIVERY'},update:{}});
    await event(db,a,'TASK_CREATED',c.id,'Task and checklist recorded.'); return {taskId:t.id};
  }
  if(['task-edit','task-check','task-review'].includes(name)) {
    await db.$queryRaw`SELECT id FROM "Task" WHERE id=${p.taskId} FOR UPDATE`;
    const t=await db.task.findFirst({where:{id:p.taskId,projectId:c.projectId},include:{checklist:true}}); demand(t&&c.projectId,'TASK','Project task not found.',404);
    demand(!c.invoiceId&&!await db.opsDelivery.findFirst({where:{caseId:c.id}}),'DELIVERED','Delivered work is frozen. Record a separate revision/change enquiry.',409);
    if(name==='task-edit') {
      const status=p.status||'IN_PROGRESS'; demand(['TODO','IN_PROGRESS','QA_REVIEW'].includes(status),'QA_GATE','Done is available only through independent QA approval.',409);
      await db.task.update({where:{id:t.id},data:{title:p.title?text(p.title,'Task title',250):t.title,status}});
    } else if(name==='task-check') {
      demand(t.checklist.some(i=>i.id===p.itemId),'CHECKLIST','Checklist item not found.',404);
      demand(typeof p.checked==='boolean','CHECKLIST','Checked must be true or false.');
      await db.taskChecklistItem.update({where:{id:p.itemId},data:{checked:p.checked}}); await db.task.update({where:{id:t.id},data:{status:'IN_PROGRESS'}});
    } else {
      actorCheck(a,true); demand(a.linkedEntityId!==t.assigneeId,'INDEPENDENT_REVIEW','A different team member must review this task.',409);
      demand(t.status==='QA_REVIEW','QA_REVIEW','Submit this task for QA review first.',409);
      demand(['APPROVED','REJECTED'].includes(p.decision),'DECISION','Choose approved or rejected.');
      if(p.decision==='APPROVED') demand(t.checklist.length>0&&t.checklist.every(i=>i.checked),'QA_CHECKLIST','Complete every checklist item before approval.',409);
      await db.opsTaskReview.create({data:{taskId:t.id,fingerprint:fingerprint(t),decision:p.decision,reviewerId:a.id,note:text(p.note,'Review note',2000)}});
      await db.task.update({where:{id:t.id},data:{status:p.decision==='APPROVED'?'DONE':'IN_PROGRESS'}});
    }
    await event(db,a,name.toUpperCase().replaceAll('-','_'),c.id,'Task revision or independent QA decision recorded.'); return {taskId:t.id};
  }
  if(name==='delivery') {
    actorCheck(a,true); demand(c.projectId,'PROJECT','No project exists.',409);
    const tasks=await db.task.findMany({where:{projectId:c.projectId,isTemplate:false},include:{checklist:true}}); demand(tasks.length&&tasks.every(t=>t.status==='DONE'),'TASKS','Complete all project tasks through QA first.',409); for(const t of tasks) await assertQa(db,t);
    demand(await db.opsDocument.findFirst({where:{id:p.documentId,caseId:c.id}}),'EVIDENCE','Choose a private delivery evidence document.');
    const d=await db.opsDelivery.create({data:{caseId:c.id,evidenceDocumentId:p.documentId,revision:text(p.revision,'Delivery revision',50),recipient:text(p.recipient,'Recipient',200),method:text(p.method,'Delivery method',100),deliveredAt:date(p.deliveredAt,'Delivery date'),recordedBy:a.id,note:text(p.note,'Delivery evidence note',2000)}});
    await db.opsCase.update({where:{id:c.id},data:{status:'DELIVERY_RECORDED'}}); await db.deliverable.updateMany({where:{projectId:c.projectId},data:{status:'DELIVERED'}});
    await event(db,a,'DELIVERY_RECORDED',c.id,'Operator recorded delivery evidence; no message was sent by the system.'); return {deliveryId:d.id};
  }
  if(name==='invoice') {
    actorCheck(a,true); demand(!c.invoiceId,'INVOICE_EXISTS','A draft invoice already exists.',409); demand(c.projectId&&await db.opsDelivery.findFirst({where:{caseId:c.id}}),'DELIVERY','Record delivery evidence first.',409);
    const r=await latestRevision(db,c.id); const lines=r.lines.lines;
    const inv=await db.invoice.create({data:{invoiceNo:ref('INV'),clientId:c.clientId,projectId:c.projectId,amount:r.amountMinor/100,currency:r.currency,status:'DRAFT',description:r.title,notes:'Prepared only. Not issued. No tax treatment asserted.',lineItems:JSON.stringify(lines),items:{create:lines.map(l=>({description:l.description,qty:l.quantity,rate:l.rateMinor/100,amount:l.amountMinor/100}))}}});
    await db.opsCase.update({where:{id:c.id},data:{invoiceId:inv.id,status:'INVOICE_DRAFT'}}); await event(db,a,'INVOICE_PREPARED',c.id,'Invoice draft prepared; not issued or sent.'); return {invoiceId:inv.id};
  }
  if(name==='payment') {
    actorCheck(a,true); demand(c.invoiceId,'INVOICE','Prepare an invoice first.',409); const inv=await db.invoice.findUnique({where:{id:c.invoiceId}}); demand(inv.status!=='DRAFT','DRAFT_INVOICE','A draft cannot receive payments. Issuing is not enabled in this release.',409);
    const amountMinor=minor(p.amount); demand(amountMinor>0&&currency(p.currency)===inv.currency,'PAYMENT','Payment must be positive and match the invoice currency.');
    const paid=await db.opsPayment.aggregate({where:{invoiceId:inv.id},_sum:{amountMinor:true}}); demand((paid._sum.amountMinor||0)+amountMinor<=Math.round(inv.amount*100),'OVERPAYMENT','Payment exceeds the invoice balance.');
    const row=await db.opsPayment.create({data:{invoiceId:inv.id,amountMinor,currency:inv.currency,reference:text(p.reference,'Payment reference',100),paidAt:date(p.paidAt,'Payment date'),recordedBy:a.id}}); return {paymentId:row.id};
  }
  if(name==='expense') {
    actorCheck(a,true); demand(c.projectId,'PROJECT','Choose a project first.'); const row=await db.expense.create({data:{projectId:c.projectId,category:text(p.category,'Category',100),vendor:text(p.vendor||'','Vendor',200,true),amount:minor(p.amount)/100,currency:currency(p.currency),date:date(p.date,'Expense date'),note:text(p.note||'','Expense note',1000,true)}}); await event(db,a,'EXPENSE_RECORDED',c.id,'Project expense recorded.'); return {expenseId:row.id};
  }
  if(name==='issue') {
    demand(c.projectId,'PROJECT','Choose a project first.'); const row=await db.coordinationItem.create({data:{projectId:c.projectId,title:text(p.title,'Issue title',250),description:text(p.description,'Description',3000),discipline:text(p.discipline||'GENERAL','Discipline',40),status:'OPEN'}}); await event(db,a,'ISSUE_RECORDED',c.id,'Coordination issue recorded.'); return {issueId:row.id};
  }
  if(name==='milestone') {
    demand(c.projectId,'PROJECT','Choose a project first.'); const row=await db.milestone.create({data:{projectId:c.projectId,title:text(p.title,'Milestone title',250),dueDate:p.dueDate?date(p.dueDate,'Due date'):null}}); return {milestoneId:row.id};
  }
  if(name==='ai-run') {
    const settings=await db.opsSetting.findUnique({where:{key:'ai-mode'}}),mode=settings?.value?.mode||'MOCK';
    const facts=await db.opsRequirement.findMany({where:{caseId:c.id,status:'ACCEPTED'},select:{text:true,anchor:true,documentId:true}});
    // Real business documents cannot leave the machine without an explicitly authorised deployment configuration.
    const blocked=mode==='LIVE'; const failed=p.simulateFailure===true;
    const row=await db.opsRun.create({data:{caseId:c.id,mode,kind:'REQUIREMENT_REVIEW',status:blocked||failed?'FAILED':'SUCCEEDED',attempts:failed?2:1,errorCode:blocked?'LIVE_PROCESSING_NOT_AUTHORISED':failed?'MOCK_TRANSIENT_FAILURE':null,actorId:a.id,output:blocked||failed?undefined:{label:'MOCK — deterministic local review, no external model used',facts,suggestions:['Confirm deliverable format and acceptance criteria with the client.'],missingInformation:['Operator-confirmed programme, quantities and commercial terms.'],uncertainConclusions:[],approved:false}}});
    await event(db,a,'AUTOMATION_RUN',c.id,`${mode} workflow ${row.status}; ${row.attempts} attempt(s).`); return {runId:row.id,status:row.status,mode,errorCode:row.errorCode};
  }
  throw new OpsError(404,'COMMAND','Unknown operations command.');
}

export async function latestRevision(db,caseId) { const r=await db.opsProposalRevision.findFirst({where:{caseId},orderBy:{revision:'desc'}}); demand(r,'PROPOSAL','Create a proposal revision first.',409); return r; }
