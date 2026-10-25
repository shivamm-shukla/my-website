import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminStudio } from "@/components/admin/admin-studio";
import { createSupabaseAdminClient, getOwner } from "@/lib/supabase/server";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Owner studio", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!hasSupabaseAdminConfig) return <main id="main-content" className="admin-setup"><span className="page-kicker">Owner studio</span><h1>Connect Supabase to open the studio.</h1><p>Add the Supabase URL, anon key, service role key, and OWNER_EMAIL to the environment. Then apply the migration in <code>supabase/migrations/001_initial.sql</code>.</p></main>;
  const owner = await getOwner(); if (!owner) redirect("/admin/login");
  const client = createSupabaseAdminClient(); if (!client) throw new Error("Supabase admin configuration missing.");
  const [posts, blogs, projects, messages] = await Promise.all([
    client.from("posts").select("*").order("created_at", { ascending: false }),
    client.from("blogs").select("*").order("updated_at", { ascending: false }),
    client.from("projects").select("*").order("order", { ascending: true }),
    client.from("messages").select("*").order("created_at", { ascending: false }),
  ]);
  return <AdminStudio email={owner.email || "Owner"} posts={posts.data || []} blogs={blogs.data || []} projects={projects.data || []} messages={messages.data || []} />;
}
