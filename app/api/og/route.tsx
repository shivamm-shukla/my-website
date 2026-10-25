import { ImageResponse } from "next/og";
import { designTokens as color } from "@/lib/design-tokens";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const title = new URL(request.url).searchParams.get("title")?.slice(0, 90) || "Products for real people.";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", padding: 72, background: color.bg, color: color.fg, fontFamily: "sans-serif" }}><div style={{ position: "absolute", width: 420, height: 420, borderRadius: 999, right: -80, top: -100, background: color.blueSoft }} /><div style={{ position: "absolute", width: 300, height: 300, borderRadius: 80, right: 120, bottom: -100, transform: "rotate(18deg)", background: color.lilacSoft }} /><div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 1 }}><div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>ss<span style={{ color: color.accent }}>.</span></div><div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", maxWidth: 900, fontSize: 76, lineHeight: 1.02, letterSpacing: -4, fontWeight: 650 }}>{title}</div><div style={{ display: "flex", marginTop: 28, fontSize: 24, color: color.muted }}>Shivam Shukla · shivamshukla.site</div></div></div><div style={{ position: "absolute", right: 132, top: 176, width: 170, height: 170, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: color.white, boxShadow: "0 20px 50px rgba(28,35,56,.12)", color: color.accent, fontSize: 54, fontWeight: 700 }}>SS</div></div>, { width: 1200, height: 630 });
}
