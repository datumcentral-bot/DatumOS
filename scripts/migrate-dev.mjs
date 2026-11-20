import './load-env.mjs';
import { spawnSync } from 'node:child_process';
const u=new URL(process.env.DATABASE_URL);
if(u.hostname!=='127.0.0.1'||u.port!=='55432'||!['/datum_dev','/datum_test','/datum_restore_test'].includes(u.pathname))throw new Error('Refusing migration outside the named isolated development/test databases.');
const r=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{stdio:['ignore','pipe','pipe'],env:process.env,windowsHide:true});
// Prisma can echo datasource metadata. Only emit the migration outcome, never a connection value.
if(r.status!==0){console.error('Isolated migration failed. Inspect schema and migration SQL; no connection value is logged.');process.exit(1);}console.log('Versioned migrations applied to the named isolated database.');
