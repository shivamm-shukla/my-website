import { publicImage } from "@/lib/assets";
import { OptionalImage } from "@/components/ui/optional-image";
import { EditorialArtShape, Sculpture } from "@/components/sections/editorial-art-shape";

export { Sculpture };

export function EditorialArt({ treatment }: { treatment: "blue" | "lilac" | "peach" }) {
  return <div className={"editorial-art editorial-art-" + treatment} aria-hidden="true">
    <Sculpture variant={treatment} />
    <OptionalImage src={publicImage("blog-cover-" + treatment) || publicImage("optimized/blog-" + treatment)} width={960} height={540} className="editorial-image" />
  </div>;
}

export { EditorialArtShape };
