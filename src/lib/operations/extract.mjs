import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
export async function extractDocument(filePath,name) {
  const ext=path.extname(name).toLowerCase();
  if(['.txt','.md','.csv'].includes(ext)) {
    const handle=await fs.open(filePath,'r');
    let bytes;
    try {
      bytes=Buffer.alloc(8*1024*1024+1);
      let length=0;
      while(length<bytes.length) {
        const result=await handle.read(bytes,length,bytes.length-length,null);
        if(!result.bytesRead) break;
        length+=result.bytesRead;
      }
      if(length>8*1024*1024) return {status:'FAILED',limitations:'Text exceeds the 8 MiB extraction limit.'};
      bytes=bytes.subarray(0,length);
    } finally { await handle.close(); }
    if(bytes.includes(0)) return {status:'UNSUPPORTED',limitations:'Binary content cannot be treated as plain text.'};
    let body; try { body=new TextDecoder('utf-8',{fatal:true}).decode(bytes); } catch { return {status:'UNSUPPORTED',limitations:'Only UTF-8 text is supported.'}; }
    const anchors=body.slice(0,100000).split(/\r?\n/).map((text,i)=>({anchor:`line ${i+1}`,text:text.trim().slice(0,2000)})).filter(l=>l.text).slice(0,100);
    return {status:'EXTRACTED',extractedText:body.slice(0,100000),anchors,limitations:body.length>100000?'Text truncated at 100,000 characters; only first 100 non-empty lines become review candidates.':'First 100 non-empty lines become review candidates. Human scope review is required.'};
  }
  if(!['.pdf','.docx','.xlsx','.pptx'].includes(ext)) return {status:'UNSUPPORTED',limitations:'This format has no safe local extractor. No requirements were inferred.'};
  const python=process.env.DATUM_PYTHON||'C:/Users/Asad/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
  return new Promise(resolve=>{
    let output='',done=false; const child=spawn(python,[path.join(process.cwd(),'scripts/extract-private.py'),filePath,ext],{windowsHide:true,stdio:['ignore','pipe','ignore']});
    const finish=value=>{if(done)return;done=true;clearTimeout(timer);resolve(value);};
    const timer=setTimeout(()=>{child.kill();finish({status:'FAILED',limitations:'Local extraction exceeded the 30-second limit.'});},30000);
    child.stdout.on('data',b=>{output+=b.toString();if(output.length>500000){child.kill();finish({status:'FAILED',limitations:'Extraction output exceeded its safety limit.'});}});
    child.on('error',()=>finish({status:'FAILED',limitations:'Local Python extractor is unavailable. Configure DATUM_PYTHON.'}));
    child.on('close',()=>{try{finish(JSON.parse(output));}catch{finish({status:'FAILED',limitations:'The local extractor could not read this document.'});}});
  });
}
