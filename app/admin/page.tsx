import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminStudio } from "@/components/admin/admin-studio";
import { createSupabaseAdminClient, getOwner } from "@/lib/supabase/server";
import { hasSupabaseAdminConfig } from "@/lib/supabase/config";
import { getSiteContent } from "@/lib/content/repository";

export const metadata: Metadata = { title: "Owner studio", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!hasSupabaseAdminConfig) return <main id="main-content" className="admin-setup"><span className="page-kicker">Owner studio</span><h1>Connect Supabase to open the studio.</h1><p>Add the Supabase URL, anon key, service role key, and OWNER_EMAIL to the environment. Then apply the migrations in <code>supabase/migrations/</code>.</p></main>;
  const owner = await getOwner(); if (!owner) redirect("/admin/login");
  const client = createSupabaseAdminClient(); if (!client) throw new Error("Supabase admin configuration missing.");
  const [posts, blogs, projects, messages, subscribers, comments] = await Promise.all([
    client.from("posts").select("*").order("created_at", { ascending: false }),
    client.from("blogs").select("*").order("updated_at", { ascending: false }),
    client.from("projects").select("*").order("order", { ascending: true }),
    client.from("messages").select("*").order("created_at", { ascending: false }),
    client.from("subscribers").select("*").order("consented_at", { ascending: false }),
    client.from("comments").select("*").order("created_at", { ascending: false }),
  ]);
  const [siteSettingsSchema, projectStorySchema, blogLinksSchema] = await Promise.all([
    client.from("site_settings").select("id").limit(1),
    client.from("projects").select("features_heading").limit(1),
    client.from("blogs").select("links").limit(1),
  ]);
  const setupWarnings = [
    ...(siteSettingsSchema.error ? ["Site settings could not be read. Confirm migrations 001–003 are applied and Supabase service access is working."] : []),
    ...(projectStorySchema.error || blogLinksSchema.error ? ["Project and blog editor fields are missing. Apply the additive migration 005_project_story_fields.sql after your already-applied migrations."] : []),
    ...(subscribers.error || comments.error ? ["Reader audience tables are unavailable. Apply migration 002_blog_interactions.sql if you want comments and subscriptions enabled."] : []),
  ];
  const siteContent = await getSiteContent();
  return <AdminStudio email={owner.email || "Owner"} posts={posts.data || []} blogs={blogs.data || []} projects={projects.data || []} messages={messages.data || []} subscribers={subscribers.data || []} comments={comments.data || []} promotions={siteContent.promotions} content={siteContent} setupWarnings={setupWarnings} />;
}
