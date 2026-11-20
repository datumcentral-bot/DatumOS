import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { extractDocument } from '../src/lib/operations/extract.mjs';

test('local text extraction bounds memory, anchors and accepted encoding', async t => {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'datum-extract-'));
  const file=path.join(dir,'input.txt');
  t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  await fs.writeFile(file,'Scope\n\nProgramme');
  assert.deepEqual((await extractDocument(file,'brief.txt')).anchors,[{anchor:'line 1',text:'Scope'},{anchor:'line 3',text:'Programme'}]);
  await fs.writeFile(file,'x'.repeat(100001)+'\nOutside retained text');
  const bounded=await extractDocument(file,'brief.txt');
  assert.equal(bounded.extractedText.length,100000);
  assert.equal(bounded.anchors.length,1);
  assert.equal(bounded.anchors[0].text.length,2000);
  await fs.writeFile(file,Buffer.alloc(8*1024*1024+1,65));
  assert.equal((await extractDocument(file,'brief.txt')).status,'FAILED');
  for(const bytes of [Buffer.from([0,65]),Buffer.from([255])]) {
    await fs.writeFile(file,bytes);
    assert.equal((await extractDocument(file,'brief.txt')).status,'UNSUPPORTED');
  }
  assert.equal((await extractDocument(file,'model.rvt')).status,'UNSUPPORTED');
});
