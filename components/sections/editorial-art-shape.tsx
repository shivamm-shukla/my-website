export function Sculpture({ variant = "hero" }: { variant?: "hero" | "blue" | "lilac" | "peach" }) {
  return <div className={"sculpture sculpture-" + variant} aria-hidden="true">
    <span className="sculpture-shadow" /><span className="sculpture-plinth" />
    <span className="sculpture-arch" /><span className="sculpture-orb" /><span className="sculpture-bead" />
  </div>;
}

export function EditorialArtShape({ treatment }: { treatment: "blue" | "lilac" | "peach" }) {
  return <div className={"editorial-art editorial-art-" + treatment} aria-hidden="true"><Sculpture variant={treatment} /></div>;
}
