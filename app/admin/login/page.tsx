import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/supabase/server";
import { hasSupabasePublicConfig, ownerEmail } from "@/lib/supabase/config";
import { LoginForm } from "@/components/admin/login-form";
import { Robot } from "@/components/robot/robot";

export const metadata: Metadata = { title: "Owner studio", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getOwner()) redirect("/admin");
  return <main id="main-content" className="admin-login-page"><div className="admin-login-card"><Robot pose="type" /><span className="page-kicker">Private workspace</span><h1>Welcome back, Shivam.</h1><p>{hasSupabasePublicConfig ? "Sign in to publish work, writing, and posts." : "Connect Supabase in the environment before signing in."}</p><LoginForm email={ownerEmail} /></div></main>;
}
