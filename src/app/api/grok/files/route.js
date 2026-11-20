import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

// DATUMGROK file bridge.
//
// DATUMGROK (the .NET desktop app) reads canonical DATUM CORTEX
// repository files straight off disk — the system brief (AGENTS.md)
// and the DN001–DN040 programme register. This route exposes a
// small WHITELIST of those files to the web app so the same content
// can be surfaced in DatumOS.
//
// READ-ONLY. Restricted to named files only — no arbitrary path
// access, no writes, no secret files. When the repository root is
// not mounted (serverless deployments) it returns { available:false }
// so the UI degrades honestly instead of erroring.

const REPO_ROOT = process.env.CORTEX_REPO_ROOT || 'E:\\0003-FINAL_DATUM_BIM_CORTEX';

const FILES = {
  // System brief — canonical root, service ports, runtime setup.
  agents: 'AGENTS.md',
  // DN001–DN040 master programme register (read-only display).
  programme:
    '16_EVIDENCE/DATUM_NETWORK_INTEGRATION/MASTER_RECONCILIATION/DN001_DN040_MASTER_REGISTER.json',
  // Live agent roster source (the cortex /ai/agents API is preferred;
  // this is the raw source the desktop app parses).
  roster: '05_AI/ai/agents/cortex/roster.py',
};

export async function GET(request) {
  // Session-gated — the director section is behind auth, so its
  // API is too (consistent with the dcortex-proxy relay).
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized', available: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const rel = FILES[name];
  if (!name || !rel) {
    return NextResponse.json(
      { error: 'unknown file', available: false },
      { status: 400 }
    );
  }

  const full = path.join(REPO_ROOT, rel);
  try {
    const raw = await readFile(full, 'utf8');
    let data;
    if (rel.endsWith('.json')) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    } else {
      data = raw;
    }
    return NextResponse.json({ available: true, name, data });
  } catch (e) {
    // Repository not mounted (serverless) or file missing — degrade honestly.
    const reason = e && e.code === 'ENOENT' ? 'not_found' : 'unreadable';
    return NextResponse.json({ available: false, name, reason });
  }
}
