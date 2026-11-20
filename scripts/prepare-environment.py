from pathlib import Path
import secrets,json
root=Path(__file__).resolve().parents[1]
var=root/'var'; var.mkdir(exist_ok=True)
for p in ['private','logs','tmp','backups']: (var/p).mkdir(exist_ok=True)
env=root/'.env.local'
if not env.exists():
 env.write_text('DATABASE_URL=postgresql://datum_dev@127.0.0.1:55432/datum_dev\nNEXTAUTH_URL=http://127.0.0.1:3107\nNEXTAUTH_SECRET='+secrets.token_urlsafe(48)+'\nDATUM_DATA_DIR=D:/DATUM_DEVELOPMENT/DatumOS/var\nDATUM_ENVIRONMENT=development\nDATUM_AI_MODE=MOCK\nDATUM_INTEGRATION_TOKEN='+secrets.token_urlsafe(48)+'\n',encoding='utf8')
accounts=var/'demo-accounts.json'
if not accounts.exists(): accounts.write_text(json.dumps([{'email':'operator@datum.example','name':'Demo operator','role':'DIRECTOR','password':secrets.token_urlsafe(20)},{'email':'reviewer@datum.example','name':'Demo reviewer','role':'DIRECTOR','password':secrets.token_urlsafe(20)},{'email':'member@datum.example','name':'Demo team member','role':'MEMBER','password':secrets.token_urlsafe(20)},{'email':'client@datum.example','name':'Demo client','role':'CLIENT','password':secrets.token_urlsafe(20)}],indent=2),encoding='utf8')
print('Isolated environment prepared; secret values were not printed.')
