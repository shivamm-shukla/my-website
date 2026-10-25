import { publicImage } from "@/lib/assets";
import { OptionalImage } from "@/components/ui/optional-image";

export function Sculpture({ variant = "hero" }: { variant?: "hero" | "blue" | "lilac" | "peach" }) {
  return <div className={"sculpture sculpture-" + variant} aria-hidden="true">
    <span className="sculpture-shadow" /><span className="sculpture-plinth" />
    <span className="sculpture-arch" /><span className="sculpture-orb" /><span className="sculpture-bead" />
  </div>;
}

export function EditorialArt({ treatment }: { treatment: "blue" | "lilac" | "peach" }) {
  return <div className={"editorial-art editorial-art-" + treatment} aria-hidden="true">
    <Sculpture variant={treatment} />
    <OptionalImage src={publicImage("blog-cover-" + treatment) || publicImage("optimized/blog-" + treatment)} width={960} height={540} className="editorial-image" />
  </div>;
}
