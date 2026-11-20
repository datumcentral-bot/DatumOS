import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { actor, prisma, command, loadCase, sameOrigin, failure } from '@/lib/operations/server';
import { demand } from '@/lib/operations/core.mjs';
import { extractDocument } from '@/lib/operations/extract.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const root=()=>path.resolve(process.env.DATUM_DATA_DIR||path.join(process.cwd(),'var'),'private');
export async function POST(req) {
  let written;
  try {
    sameOrigin(req); const a=await actor(),u=new URL(req.url),caseId=u.searchParams.get('caseId'); await loadCase(prisma,a,caseId);
    if(u.searchParams.get('extract')) {
      const d=await prisma.opsDocument.findFirst({where:{id:u.searchParams.get('extract'),caseId}}); demand(d,'DOCUMENT','Document not found.',404);
      const extraction=await extractDocument(path.join(root(),d.storageKey),d.originalName);
      return Response.json(await command(prisma,a,req.headers.get('idempotency-key'),'document-extraction',{caseId,documentId:d.id,...extraction}));
    }
    const name=decodeURIComponent(req.headers.get('x-file-name')||''); demand(name&&name.length<=180&&!/[\\/\x00-\x1f]/.test(name),'FILENAME','Choose a simple filename without path characters.');
    const ext=path.extname(name).toLowerCase(); demand(['.txt','.md','.csv','.pdf','.docx','.xlsx','.pptx','.ifc','.rvt','.dwg'].includes(ext),'TYPE','Supported files: text, PDF, Office, IFC, RVT and DWG.');
    const limit=8*1024*1024; demand(Number(req.headers.get('content-length')||0)<=limit,'SIZE','Files must be 8 MB or smaller.',413);
    const reader=req.body?.getReader(); demand(reader,'FILE','Choose a non-empty file.'); const parts=[]; let size=0;
    for(;;) { const {value,done}=await reader.read(); if(done) break; size+=value.length; if(size>limit){await reader.cancel(); demand(false,'SIZE','Files must be 8 MB or smaller.',413);} parts.push(value); }
    demand(size>0,'EMPTY','Choose a non-empty file.'); const bytes=Buffer.concat(parts);
    if(ext==='.pdf') demand(bytes.subarray(0,5).toString()==='%PDF-','SIGNATURE','PDF file signature is invalid.');
    if(['.docx','.xlsx','.pptx'].includes(ext)) demand(bytes.subarray(0,2).toString()==='PK','SIGNATURE','Office file signature is invalid.');
    const storageKey=randomUUID(); await fs.mkdir(root(),{recursive:true}); written=path.join(root(),storageKey); await fs.writeFile(written,bytes,{flag:'wx'});
    const result=await command(prisma,a,req.headers.get('idempotency-key'),'document-record',{caseId,title:name,family:u.searchParams.get('family')||name,originalName:name,storageKey,sha256:createHash('sha256').update(bytes).digest('hex'),size,mediaType:req.headers.get('content-type')||'application/octet-stream'});
    const actual=await prisma.opsDocument.findUnique({where:{id:result.documentId}}); if(actual.storageKey!==storageKey) await fs.unlink(written); written=null;
    return Response.json(result,{status:201});
  } catch(e) { if(written) await fs.unlink(written).catch(()=>{}); return failure(e); }
}
export async function GET(req) { try { const a=await actor(),id=new URL(req.url).searchParams.get('id'),d=await prisma.opsDocument.findUnique({where:{id}}); demand(d,'DOCUMENT','Document not found.',404); await loadCase(prisma,a,d.caseId); const bytes=await fs.readFile(path.join(root(),d.storageKey)); return new Response(bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(d.originalName)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}}); } catch(e) { return failure(e); } }
