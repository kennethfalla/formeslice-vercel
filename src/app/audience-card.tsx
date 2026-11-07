"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

export function AudienceCard({ title, copy }: { title: string; copy: string }) {
  const [mode, setMode] = useState<"closed" | "preview" | "open">("closed");
  const id = useId();
  const expanded = mode !== "closed";

  return <article className="audience-card" data-expanded={expanded}
    onPointerEnter={event => {
      if (event.pointerType === "mouse") setMode(current => current === "closed" ? "preview" : current);
    }}
    onPointerLeave={() => setMode(current => current === "preview" ? "closed" : current)}>
    <h4>
      <button type="button" aria-expanded={expanded} aria-controls={id}
        onClick={() => setMode(current => current === "open" ? "closed" : "open")}
        onKeyDown={event => { if (event.key === "Escape") setMode("closed"); }}>
        {title}<ChevronDown size={17} aria-hidden="true" />
      </button>
    </h4>
    <div className="audience-reveal" id={id} aria-hidden={!expanded}><div><p>{copy}</p></div></div>
  </article>;
}
