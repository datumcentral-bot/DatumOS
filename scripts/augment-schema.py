from pathlib import Path
import shutil
r=Path(__file__).resolve().parents[1]; s=r/'prisma/schema.prisma'
text=s.read_text(encoding='utf8')
if 'model OpsCase {' not in text:
 (r/'evidence/baseline-schema.prisma').write_text(text,encoding='utf8')
 for model,fields in {'Client':'opsCases OpsCase[]','Lead':'opsCase OpsCase?','QuoteRequest':'opsCase OpsCase?','Proposal':'opsCase OpsCase?','Project':'opsCase OpsCase?','Invoice':'opsCase OpsCase?\n  opsPayments OpsPayment[]','Task':'opsReviews OpsTaskReview[]','User':'opsTraining OpsTraining[]','Sop':'opsTraining OpsTraining[]'}.items():
  text=text.replace('model '+model+' {','model '+model+' {\n  '+fields,1)
 s.write_text(text+'\n'+(r/'prisma/operations.prisma.fragment').read_text(),encoding='utf8')
 old=r/'prisma/migrations'
 if old.exists(): shutil.move(str(old),str(r/'prisma/historical-migrations'))
 (r/'prisma/migrations').mkdir(exist_ok=True)
 (r/'prisma/migrations/migration_lock.toml').write_text('provider = "postgresql"\n')
print('Additive operations schema prepared; historical migrations retained separately.')
