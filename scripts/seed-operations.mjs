import './load-env.mjs';
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const u=new URL(process.env.DATABASE_URL);if(u.hostname!=='127.0.0.1'||u.port!=='55432'||!['/datum_dev','/datum_test'].includes(u.pathname))throw new Error('Demo seed is restricted to isolated development/test.');
const db=new PrismaClient({log:[]});
try{const accounts=JSON.parse(fs.readFileSync('var/demo-accounts.json','utf8'));for(const [i,a] of accounts.entries()){const member=await db.user.upsert({where:{email:a.email},create:{name:a.name,email:a.email,role:a.role==='DIRECTOR'?'DIRECTOR':'MEMBER',title:'Synthetic demo account',division:'BIM'},update:{}});await db.authUser.upsert({where:{email:a.email},create:{name:a.name,email:a.email,passwordHash:await bcrypt.hash(a.password,12),role:a.role,linkedEntityId:member.id,linkedEntityType:'User'},update:{}});}console.log('Synthetic demonstration accounts prepared. Credentials remain in the private local account file.');}finally{await db.$disconnect();}
