"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project, ProjectCategory } from "@/lib/content/types";
import { Icon } from "@/components/ui/icon";
import { ProjectArt } from "@/components/sections/project-art";

const filters: Array<"All" | ProjectCategory> = ["All", "Product", "Developer tools", "Education"];

export function WorkBrowser({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const visible = filter === "All" ? projects : projects.filter((project) => project.category === filter);

  return <>
    <div className="work-filters" role="group" aria-label="Filter projects">
      {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <div className="project-tiles" aria-live="polite">
      {visible.map((project) => <article className={`project-tile project-tile-${project.treatment}`} key={project.id}>
        <div className="project-tile-art" aria-hidden="true">
          {project.coverUrl ? <Image src={project.coverUrl} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" unoptimized/> : <ProjectArt treatment={project.treatment}/>}
        </div>
        <span className="project-tile-category">{project.category}</span>
        <h2><Link href={`/work/${project.slug}`}>{project.title}</Link></h2>
        <p className="project-tile-headline">{project.headline.replace("\n", " ")}</p>
        <p className="project-tile-summary">{project.summary}</p>
        <div className="project-tile-actions"><Link href={`/work/${project.slug}`} className="button button-small">Case study<Icon name="arrow-right" size={15}/></Link>{project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="project-live-link">{project.externalLabel || "Live site"}<Icon name="arrow-up-right" size={15}/></a>}</div>
      </article>)}
    </div>
  </>;
}
