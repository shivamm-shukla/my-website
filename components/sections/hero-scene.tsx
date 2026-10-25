import { publicImage } from "@/lib/assets";
import { OptionalImage } from "@/components/ui/optional-image";
import { Sculpture } from "./editorial-art";

export function HeroScene() {
  return <div className="hero-art" aria-hidden="true">
    <Sculpture />
    <OptionalImage src={publicImage("hero-light") || publicImage("optimized/hero-light")} className="hero-image hero-image-light" width={1120} height={1120} eager />
    <OptionalImage src={publicImage("hero-dark") || publicImage("optimized/hero-dark")} className="hero-image hero-image-dark" width={1120} height={1120} eager />
  </div>;
}
