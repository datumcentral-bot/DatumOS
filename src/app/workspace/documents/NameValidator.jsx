"use client";

import { useState } from "react";
import { validateFileName } from "@/lib/format";
import { CheckCircle2, XCircle } from "lucide-react";

export function NameValidator() {
  const [val, setVal] = useState("DS-2401-ST-Z01-DWG-R03");
  const valid = validateFileName(val.trim());

  return (
    <div>
      <label className="text-xs font-medium text-slate-500">Test a file name against the studio standard</label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="flex-1 rounded-lg border border-line px-3 py-2 font-mono text-sm text-brand-900 outline-none focus:border-accent-400"
          placeholder="DS-2401-ST-Z01-DWG-R03"
        />
        {valid ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-health-green">
            <CheckCircle2 size={14} /> Valid
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            <XCircle size={14} /> Invalid
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Pattern: <span className="font-mono text-slate-500">&lt;ProjectCode&gt;-&lt;Discipline&gt;-&lt;Zone&gt;-&lt;Type&gt;-&lt;Revision&gt;</span>
        {" "}e.g. <span className="font-mono">DS-2401-ST-Z01-DWG-R03</span> · Disciplines AR/ST/ME/EL/PL/FP/BIM · Zone Z## or SITE · Type DWG/MDL/RPT/SCH · Rev R##
      </p>
    </div>
  );
}
