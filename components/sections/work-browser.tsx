"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project, ProjectCategory } from "@/lib/content/types";
import { Icon } from "@/components/ui/icon";
import { ProjectArt } from "@/components/sections/project-art";

const filters: Array<"All" | ProjectCategory> = ["All", "Product", "Developer tools", "Education"];
const covers: Partial<Record<Project["slug"], string>> = {
  thravia: "/images/thravia.png",
  "brg-cli": "/images/brg-cli.png",
};

export function WorkBrowser({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const visible = filter === "All" ? projects : projects.filter((project) => project.category === filter);

  return <>
    <div className="work-filters" role="group" aria-label="Filter projects">
      {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <div className="work-list" aria-live="polite">
      {visible.map((project, index) => { const cover = covers[project.slug]; return <article className={`work-row work-row-${project.treatment}`} key={project.id}>
        <Link href={`/work/${project.slug}`} className="work-row-link" aria-label={`Explore ${project.title}: ${project.summary}`}>
          <div className="work-row-copy">
            <div><span className="project-category">{project.category}</span><span className="work-index">0{index + 1}</span></div>
            <h2>{project.title}</h2>
            <p className="work-row-headline">{project.headline.replace("\n", " ")}</p>
            <p>{project.summary}</p>
            <span className="work-explore">Read the case study <Icon name="arrow-up-right" size={17} /></span>
          </div>
          <div className="work-row-art" aria-hidden="true">
            {cover ? <Image src={cover} alt="" fill sizes="(max-width: 760px) 100vw, 48vw" /> : <ProjectArt treatment={project.treatment} />}
          </div>
        </Link>
      </article>; })}
    </div>
  </>;
}
