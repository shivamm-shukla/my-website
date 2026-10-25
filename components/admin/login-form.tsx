"use client";

import { useActionState } from "react";
import { loginOwner, type LoginState } from "@/app/admin/login/actions";

const initial: LoginState = { error: "" };

export function LoginForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(loginOwner, initial);
  return <form action={action} className="admin-login-form"><label htmlFor="owner-email">Owner email</label><input id="owner-email" name="email" type="email" defaultValue={email} autoComplete="username" required /><label htmlFor="owner-password">Password</label><input id="owner-password" name="password" type="password" autoComplete="current-password" required /><button className="button" disabled={pending}>{pending ? "Opening…" : "Open studio"}</button>{state.error && <p role="alert">{state.error}</p>}</form>;
}
