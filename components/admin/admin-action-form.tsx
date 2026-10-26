"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = { error: "", success: "" };

type Action = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

export function AdminActionForm({ action, className, children }: { action: Action; className: string; children: React.ReactNode }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className={className} aria-busy={pending}>
    {children}
    <p className={`admin-action-feedback${state.error ? " is-error" : ""}`} role={state.error ? "alert" : "status"} aria-live="polite">
      {pending ? "Saving…" : state.error || state.success}
    </p>
  </form>;
}
