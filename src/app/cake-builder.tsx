"use client";

import dynamic from "next/dynamic";
import { Box, CakeSlice, Check, GripVertical, Layers } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flavors, type CakeRecipe } from "./cake-recipe";

const LiveCake = dynamic(() => import("./cake-scene").then(module => module.CakeScene), { ssr: false, loading: () => <p className="cake-scene-loading">Preparing the 3D preview…</p> });
const steps = ["Formation", "Flavor count", "Add flavors"];
const flavorMime = "application/x-formeslice-flavor";

export function CakeBuilder() {
  const [step, setStep] = useState(0);
  const [formation, setFormation] = useState<CakeRecipe["formation"]>("triangle");
  const [count, setCount] = useState(2);
  const [slots, setSlots] = useState<(number | null)[]>(Array(6).fill(null));
  const [picked, setPicked] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [angle, setAngle] = useState(.18);
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const [viewAvailable, setViewAvailable] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const drag = useRef<{ x: number; angle: number } | null>(null);
  const maxFlavors = formation === "triangle" ? 6 : 4;
  const pieces = formation === "triangle" ? 6 : Math.max(2, count);
  const selected = slots.slice(0, count);
  const added = selected.filter(index => index !== null);
  const recipe = useMemo(() => ({
    formation,
    flavors: Array.from({ length: pieces }, (_, index) => slots[index % count]),
  }), [formation, pieces, slots, count]);

  useEffect(() => {
    if (!stage.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "250px" });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  function changeStep(next: number) {
    setStep(next);
    stepTitle.current?.focus();
  }

  function selectFormation(next: CakeRecipe["formation"]) {
    setFormation(next);
    if (next === "stack") setCount(value => Math.min(value, 4));
  }

  function addFlavor(slot: number, flavor: number) {
    setSlots(previous => {
      const next = [...previous];
      const duplicate = previous.slice(0, count).indexOf(flavor);
      if (duplicate >= 0) next[duplicate] = previous[slot];
      next[slot] = flavor;
      for (let index = count; index < next.length; index++) {
        if (next[index] === flavor) next[index] = null;
      }
      return next;
    });
    setPicked(null);
    setDropTarget(null);
  }

  function resetCake() {
    setFormation("triangle");
    setCount(2);
    setSlots(Array(6).fill(null));
    setPicked(null);
    setDropTarget(null);
    setAngle(.18);
    changeStep(0);
  }

  return <section id="cake-builder" className="cake-builder" aria-labelledby="cake-builder-title">
    <header className="cake-builder-heading">
      <span className="eyebrow">THE FORMÉSLICE STUDIO</span>
      <h1 id="cake-builder-title">Build your own cake.</h1>
      <p>Design a cake in three steps and see your choices take shape in 3D.</p>
    </header>
    <div className="cake-builder-layout">
      <div className="cake-builder-preview">
        <div className="cake-builder-stage" ref={stage} data-preview-available={viewAvailable}
          tabIndex={viewAvailable ? 0 : undefined} aria-label="3D cake preview"
          onKeyDown={event => {
            if (!viewAvailable || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
            event.preventDefault();
            setAngle(value => value + (event.key === "ArrowLeft" ? -.55 : .55));
          }}
          onPointerDown={event => {
            if (!viewAvailable || !event.isPrimary || event.button !== 0) return;
            drag.current = { x: event.clientX, angle };
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={event => {
            if (drag.current) setAngle(drag.current.angle + (event.clientX - drag.current.x) * .013);
          }}
          onLostPointerCapture={() => { drag.current = null; setDragging(false); }}>
          <span className="cake-builder-badge"><Box size={15} aria-hidden="true" /> 3D STUDIO</span>
          {ready && <LiveCake recipe={recipe} angle={angle} dragging={dragging} onAvailabilityChange={setViewAvailable} />}
        </div>
        <div className="cake-builder-view-controls">
          <span>{viewAvailable ? "Drag the cake to turn it" : "Sample cake photo"}</span>
        </div>
        <p className="cake-builder-recipe" aria-live="polite">
          <strong>{formation === "triangle" ? "6-slice Triangle wheel" : `${pieces}-layer Stack`}</strong>
          <span>{added.length ? added.map(index => flavors[index].name).join(" · ") : "Your selected flavors will appear here."}</span>
        </p>
      </div>
      <div className="cake-builder-controls">
        <ol className="builder-steps" aria-label="Cake builder steps">
          {steps.map((label, index) => <li key={label}>
            <button type="button" aria-current={index === step ? "step" : undefined} disabled={index > step}
              onClick={() => changeStep(index)}><span>{index + 1}</span>{label}</button>
          </li>)}
        </ol>
        <div className="builder-step-panel">
          <h2 ref={stepTitle} tabIndex={-1}>{["Choose a formation", "How many flavors?", "Drag flavors into your cake"][step]}</h2>
          {step === 0 && <>
            <p>Start with a wheel of slices or build a cake in layers.</p>
            <div className="builder-formations">
              <button type="button" onClick={() => selectFormation("triangle")} aria-pressed={formation === "triangle"}><CakeSlice size={25} aria-hidden="true" /><strong>Triangle wheel</strong><small>6 slices</small></button>
              <button type="button" onClick={() => selectFormation("stack")} aria-pressed={formation === "stack"}><Layers size={25} aria-hidden="true" /><strong>Layered Stack</strong><small>2 to 4 layers</small></button>
            </div>
          </>}
          {step === 1 && <>
            <p>Choose up to {maxFlavors} different flavors for your {formation === "triangle" ? "Triangle wheel" : "Stack"}.</p>
            <div className="builder-counts" role="group" aria-label="Number of flavors">
              {Array.from({ length: maxFlavors }, (_, index) => <button type="button" key={index}
                aria-label={`${index + 1} ${index === 0 ? "flavor" : "flavors"}`} aria-pressed={count === index + 1}
                onClick={() => setCount(index + 1)}>{index + 1}</button>)}
            </div>
            <p className="builder-guidance">{formation === "triangle" ? "The flavors repeat across six slices." : "Each flavor gets its own layer. A single flavor fills both layers."}</p>
          </>}
          {step === 2 && <>
            <p>Drag each flavor onto a slot. You can also select a flavor, then select a slot.</p>
            <div className="builder-flavors" role="group" aria-label="Flavor choices">
              {flavors.map((flavor, index) => <button type="button" key={flavor.name} draggable
                aria-pressed={picked === index} onClick={() => setPicked(value => value === index ? null : index)}
                style={{ "--piece-color": flavor.icing } as CSSProperties}
                onDragStart={event => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData(flavorMime, String(index));
                  setPicked(index);
                }}
                onDragEnd={() => { setDropTarget(null); }}>
                <i aria-hidden="true" />{flavor.name}<GripVertical size={14} aria-hidden="true" />
              </button>)}
            </div>
            <div className="builder-drop-grid" role="group" aria-label="Cake flavor slots">
              {selected.map((flavor, index) => <button type="button" key={index} className="builder-drop-slot"
                data-drop-target={dropTarget === index} data-filled={flavor !== null}
                aria-label={`Flavor slot ${index + 1}: ${flavor === null ? "empty" : flavors[flavor].name}`}
                onClick={() => { if (picked !== null) addFlavor(index, picked); }}
                onDragOver={event => {
                  if (!event.dataTransfer.types.includes(flavorMime)) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTarget(index);
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={event => {
                  const raw = event.dataTransfer.getData(flavorMime);
                  if (!/^[0-5]$/.test(raw)) return;
                  event.preventDefault();
                  addFlavor(index, Number(raw));
                }}>
                <span>{index + 1}</span>{flavor === null ? "Drop a flavor" : flavors[flavor].name}
              </button>)}
            </div>
            <p className="builder-guidance" aria-live="polite">{picked !== null ? `Select a slot for ${flavors[picked].name}.` :
              added.length === count ? "Your cake is ready to spin. Swap flavors anytime." : `${added.length} of ${count} flavors added`}</p>
          </>}
        </div>
        <div className="builder-step-actions">
          {step > 0 && <button type="button" onClick={() => changeStep(step - 1)}>Back</button>}
          {step < 2 ? <button type="button" className="builder-next" onClick={() => changeStep(step + 1)}>Continue</button>
            : <button type="button" className="builder-next" onClick={resetCake}>Start over</button>}
          {step === 2 && added.length === count && <span className="builder-done"><Check size={15} aria-hidden="true" /> Cake ready</span>}
        </div>
      </div>
    </div>
  </section>;
}
