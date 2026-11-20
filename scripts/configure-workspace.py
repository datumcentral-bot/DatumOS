from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
for route in ['contact','public/lead']:
 (r/f'src/app/api/{route}/route.js').write_text("import { publicIntake } from '@/lib/operations/public-intake';\nexport const runtime='nodejs';\nexport const POST=publicIntake;\n",encoding='utf8')
p=r/'src/middleware.js';t=p.read_text(encoding='utf8');needle='  const { pathname } = req.nextUrl;'
addition='''
  // Isolated operations release: legacy mutations cannot bypass revision and QA policies.
  if (pathname === '/operations/login') return NextResponse.next();
  if (pathname === '/api/operations/integration') return NextResponse.next(); // bearer checked in handler
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/operations') && !['/api/contact','/api/public/lead'].includes(pathname)) {
    return NextResponse.json({error:{code:'GOVERNED_WORKFLOW_REQUIRED',message:'Use the operations workflow for changes; legacy writes are disabled in this isolated release.'}}, {status:409});
  }
'''
if 'GOVERNED_WORKFLOW_REQUIRED' not in t:t=t.replace(needle,needle+addition)
t=t.replace('const loginUrl = new URL("/login", req.url);','const loginUrl = new URL(pathname.startsWith("/operations")?"/operations/login":"/login", req.url);')
p.write_text(t,encoding='utf8')
p=r/'src/lib/roles.mjs';t=p.read_text();t=t.replace('DIRECTOR: ["/director",','DIRECTOR: ["/operations", "/director",').replace('MEMBER: ["/workspace",','MEMBER: ["/operations", "/workspace",');p.write_text(t,encoding='utf8')
# Stable body-bound public request keys survive a lost response and browser reload.
for rel in ['src/components/QuoteForm.jsx','src/app/(marketing)/contact/ContactForm.jsx']:
 p=r/rel;t=p.read_text(encoding='utf8');t=t.replace('headers: { "Content-Type": "application/json" },','headers: { "Content-Type": "application/json", "Idempotency-Key": publicRequestKey(d) },')
 if 'function publicRequestKey(' not in t:t+='''
function publicRequestKey(body) {
  const signature=JSON.stringify(body), previous=JSON.parse(sessionStorage.getItem('datum-public-enquiry')||'null');
  if(previous?.signature===signature)return previous.key;
  const key=crypto.randomUUID();sessionStorage.setItem('datum-public-enquiry',JSON.stringify({signature,key}));return key;
}
'''
 p.write_text(t,encoding='utf8')
# Keep public lead capture compatible without trusting a server-generated retry key.
p=r/'src/components/public.jsx';t=p.read_text(encoding='utf8');t=t.replace('headers: { "Content-Type": "application/json" },','headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },');p.write_text(t,encoding='utf8')
(r/'src/app/layout.js').write_text('''import './globals.css';
import Providers from '@/components/operations/Providers';
export const metadata={title:'DATUMOS',description:'DATUM business operations and engineering delivery.'};
export const viewport={width:'device-width',initialScale:1};
export const dynamic='force-dynamic';
export default function RootLayout({children}){return <html lang="en"><body><Providers>{children}</Providers></body></html>;}
''',encoding='utf8')
p=r/'src/app/globals.css';t=p.read_text(encoding='utf8');t='\n'.join(l for l in t.splitlines() if not l.startswith('@import url('));p.write_text(t,encoding='utf8')
p=r/'package.json';j=json.loads(p.read_text());j['scripts'].update({'operations:start':'node scripts/start-local.mjs','operations:migrate':'node scripts/migrate-dev.mjs','operations:seed':'node scripts/seed-operations.mjs','operations:test':'node --test tests/operations.test.mjs','operations:verify-ui':'node scripts/verify-ui.mjs'});p.write_text(json.dumps(j,indent=2)+'\n')
print('Operations access and legacy write boundaries configured in the isolated copy.')
