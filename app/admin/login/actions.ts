"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ownerEmail } from "@/lib/supabase/config";

export type LoginState = { error: string };

export async function loginOwner(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!ownerEmail || email !== ownerEmail) return { error: "This studio is private." };
  const client = await createSupabaseServerClient();
  if (!client) return { error: "Supabase is not configured yet." };
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { error: "That email and password did not match." };
  redirect("/admin");
}

export async function logoutOwner() {
  const client = await createSupabaseServerClient();
  await client?.auth.signOut();
  redirect("/admin/login");
}
