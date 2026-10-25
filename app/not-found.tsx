import Link from "next/link";
import { Robot } from "@/components/robot/robot";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return <main id="main-content" className="site-container not-found-page"><Robot pose="think" /><span className="preview-label">404</span><h1>A little off the map.</h1><p>Even curious robots take a wrong turn. Let’s get you back to something useful.</p><Link href="/" className="button"><Icon name="arrow-left" size={16} />Back to Home</Link></main>;
}
