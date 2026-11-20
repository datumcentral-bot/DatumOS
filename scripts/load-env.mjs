import fs from 'node:fs';
import path from 'node:path';
export function loadEnv(){const file=path.join(process.cwd(),'.env.local');if(fs.existsSync(file))for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z0-9_]+)=(.*)$/);if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2];}}
loadEnv();
