import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return <main id="main-content" className="site-container not-found-page"><div className="not-found-art"><Image src="/images/not-found.png" alt="A curious robot looking for the right page" fill priority sizes="(max-width: 600px) 75vw, 380px" /></div><div><span className="page-kicker">Error 404</span><h1>A little off the map.</h1><p>Even curious robots take a wrong turn. Let’s get you back to something useful.</p><Link href="/" className="button"><Icon name="arrow-left" size={16} />Back to Home</Link></div></main>;
}
