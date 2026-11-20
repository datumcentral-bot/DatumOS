import './load-env.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
if(!process.env.NEXTAUTH_SECRET)throw new Error('Prepare the isolated environment before starting.');
const built=fs.existsSync('.next/BUILD_ID');const child=spawn(process.execPath,['node_modules/next/dist/bin/next',built?'start':'dev','-H','127.0.0.1','-p','3107'],{stdio:'inherit',windowsHide:true,env:{...process.env,TEMP:process.cwd()+'/var/tmp',TMP:process.cwd()+'/var/tmp',NEXT_TELEMETRY_DISABLED:'1'}});child.on('exit',code=>process.exit(code||0));
