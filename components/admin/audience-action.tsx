"use client";

import { updateAudienceRecord } from "@/app/admin/actions";

export function AudienceAction({ id, kind, status, children, confirm }: { id: string; kind: string; status: string; children: React.ReactNode; confirm?: string }) {
  return <form action={updateAudienceRecord} onSubmit={confirm ? (event) => { if (!window.confirm(confirm)) event.preventDefault(); } : undefined}>
    <input type="hidden" name="id" value={id}/><input type="hidden" name="kind" value={kind}/><input type="hidden" name="status" value={status}/>
    <button type="submit" className="admin-action-button">{children}</button>
  </form>;
}
