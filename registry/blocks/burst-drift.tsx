"use client";

import { useEffect, useRef, useState } from "react";

const copy = {
  label: "Rooftop solar for homeowners",
  headline: "Rooftop solar, priced in one visit.",
  body: "We measure your roof, read last year's bills and hand you a fixed price before we leave. No follow-up calls, no surprise add-ons.",
  primary: {
    text: "Book a visit",
    href: "#book"
  },
  secondary: {
    text: "See a sample quote",
    href: "#quote"
  },
  pause: "Pause light",
  play: "Play light"
};

/**
 * Burst: Drift · Steal My Slop Blocks · https://blocks.stealmyslop.com
 * MIT License. Copyright (c) 2026 99 Bays LLC. Free to use, change and share; keep this
 * notice with the code. Full text: https://blocks.stealmyslop.com/license
 * SPDX-License-Identifier: MIT
 *
 * A 3D burst that never quite sits still: it drifts on its own, and the rays near the pointer
 * bend out of the way. The one on the Blocks homepage.
 *
 * The light uses your theme: rays take `primary`, the stage takes `background`, and both update
 * when you switch to dark mode. Hover bends the rays; a click or tap sends a pulse through them.
 * Pauses with the button, when off screen, and in a hidden tab. With reduced motion it stays still.
 * Edit the words in `copy` above; tune the light in `LIGHT` below.
 */
const LIGHT = {
  seed: 1829,
  rays: 680,
  reach: 165,
  push: 24,
  drift: 0.045,
  lean: 0.1,
  swell: 0.035,
  breathe: [0.45, 0.5]
};

type Ray = { x: number; y: number; z: number; radius: number; phase: number; speed: number; trail: number; opacity: number; size: number };

export function BurstDrift() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;

    // Seeded, so the light looks the same on every visit and after every resize.
    let seed = LIGHT.seed;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    // Rays point out of the top half of a sphere, spread evenly with the golden angle.
    const golden = Math.PI * (3 - Math.sqrt(5));
    const rays: Ray[] = Array.from({ length: LIGHT.rays }, (_, i) => {
      const y = (i + 0.5) / LIGHT.rays;
      const r = Math.sqrt(1 - y * y), a = i * golden;
      return {
        x: Math.cos(a) * r, y, z: Math.sin(a) * r,
        radius: 0.48 + random() * 0.9, phase: random() * Math.PI * 2, speed: LIGHT.breathe[0] + random() * LIGHT.breathe[1],
        trail: 0.26 + random() * 0.64, opacity: 0.16 + random() * 0.55, size: 0.65 + random() * 1.1,
      };
    });

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;
    let hidden = document.hidden;
    let offscreen = true;
    let w = 1, h = 1, time = 0, last = 0, frame = 0, count = rays.length;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 };
    const pulses: { x: number; y: number; age: number }[] = [];

    // Theme colors, read from the page so oklch, hsl and hex themes all work.
    let line = [255, 255, 255], tip = [255, 255, 255], dark = true;
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgbOf = (color: string) => {
      if (!probe) return [255, 255, 255];
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = "#000";
      probe.fillStyle = color;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    };
    const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 48;
    const readColors = () => {
      const bg = rgbOf(getComputedStyle(section).backgroundColor);
      dark = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2] < 140;
      line = rgbOf(getComputedStyle(canvas).color);
      // On a dark stage the tips glow towards white; on a light one they keep the primary color.
      tip = dark ? line.map((v) => Math.round(v + (255 - v) * 0.6)) : line;
      const sc = sprite.getContext("2d");
      if (!sc) return;
      sc.clearRect(0, 0, 48, 48);
      const g = sc.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, rgba(tip, 1));
      g.addColorStop(0.17, rgba(tip, 0.95));
      g.addColorStop(0.38, rgba(tip, 0.4));
      g.addColorStop(1, rgba(tip, 0));
      sc.fillStyle = g;
      sc.fillRect(0, 0, 48, 48);
    };

    // Push a point away from the pointer and from tap pulses. t grows towards the ray's outer end,
    // so the base of the burst stays put while the ends move.
    const displace = (x: number, y: number, t: number) => {
      const dx = x - pointer.x, dy = y - pointer.y, d = Math.hypot(dx, dy);
      const near = Math.max(0, 1 - d / LIGHT.reach);
      const f = near * near * LIGHT.push * pointer.strength * t * t;
      let px = (dx / Math.max(d, 1)) * f, py = (dy / Math.max(d, 1)) * f;
      for (const p of pulses) {
        const qx = x - p.x, qy = y - p.y, q = Math.hypot(qx, qy);
        const band = Math.exp(-(((q - p.age * 520) / 46) ** 2)) * (1 - p.age / 1.4) * 30 * t;
        px += (qx / Math.max(q, 1)) * band;
        py += (qy / Math.max(q, 1)) * band;
      }
      return { x: x + px, y: y + py };
    };

    const glow = (ox: number, oy: number) => {
      const a = dark ? 1 : 0.55;
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.min(w * 0.58, h * 0.95));
      g.addColorStop(0, rgba(tip, 0.6 * a));
      g.addColorStop(0.12, rgba(line, 0.3 * a));
      g.addColorStop(0.4, rgba(line, 0.1 * a));
      g.addColorStop(1, rgba(line, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };
    const dot = (x: number, y: number, size: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size * 3, y - size * 3, size * 6, size * 6);
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = rgba(tip, 1);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.3, size * 0.55), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    // A point t of the way along a ray, turned and tilted in 3D, then put in perspective.
    const project = (p: Ray, t: number, scale: number, ox: number, oy: number, turn: number, tilt: number) => {
      const rad = p.radius * (1 + LIGHT.swell * Math.sin(time * p.speed + p.phase));
      const x = p.x * rad * t, y = p.y * rad * t, z = p.z * rad * t;
      const rx = x * Math.cos(turn) + z * Math.sin(turn), rz = -x * Math.sin(turn) + z * Math.cos(turn);
      const ry = y * Math.cos(tilt) - rz * Math.sin(tilt), depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
      const perspective = 3.8 / (3.8 - depth);
      return { x: ox + rx * perspective * scale, y: oy - ry * perspective * scale, depth: perspective };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      const ox = w * 0.5, oy = h * 1.035, scale = Math.min(w * 0.48, h * 0.79);
      const turn = LIGHT.drift * Math.sin(time * 0.24) + pointer.strength * (pointer.x / w - 0.5) * LIGHT.lean;
      const tilt = LIGHT.drift * 0.4 * Math.sin(time * 0.19) + pointer.strength * (pointer.y / h - 0.5) * LIGHT.lean * 0.33;
      glow(ox, oy);
      for (let i = 0; i < count; i++) {
        const p = rays[Math.floor((i * rays.length) / count)]; // even spread when drawing fewer
        const start = 1 - p.trail, pts = [];
        for (let j = 0; j <= 8; j++) {
          const t = start + (p.trail * j) / 8;
          const q = project(p, t, scale, ox, oy, turn, tilt);
          pts.push({ ...displace(q.x, q.y, t), depth: q.depth });
        }
        const first = pts[0], end = pts[pts.length - 1];
        const alpha = p.opacity * (0.84 + 0.16 * Math.sin(time * 0.7 + p.phase));
        const g = ctx.createLinearGradient(first.x, first.y, end.x, end.y);
        g.addColorStop(0, rgba(line, 0));
        g.addColorStop(0.4, rgba(line, alpha * (dark ? 0.34 : 0.55)));
        g.addColorStop(1, rgba(tip, alpha * 0.85));
        ctx.strokeStyle = g;
        ctx.lineWidth = Math.min(1.5, 0.76 * end.depth);
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        for (const q of pts) ctx.lineTo(q.x, q.y);
        ctx.stroke();
        dot(end.x, end.y, p.size * end.depth, alpha);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const still = () => pausedRef.current || reduced;
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min((now - last) / 1000 || 0, 0.05);
      last = now;
      if (!still()) time += dt;
      const ease = 1 - Math.exp(-dt * 7);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      pointer.strength += ((still() ? 0 : pointer.target) - pointer.strength) * ease;
      for (const p of pulses) p.age += dt;
      while (pulses.length && pulses[0].age > 1.4) pulses.shift();
      draw();
      const busy = !still() || pointer.strength > 0.001 || pulses.length > 0;
      if (!hidden && !offscreen && busy) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && !hidden && !offscreen) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    wakeRef.current = start;

    const resize = () => {
      const box = section.getBoundingClientRect();
      w = Math.max(1, box.width);
      h = Math.max(1, box.height);
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = w < 640 ? Math.round(rays.length * 0.55) : rays.length; // fewer rays on phones
      pointer.target = 0;
      pointer.strength = 0;
      readColors();
      if (!frame) draw();
    };

    const local = (e: PointerEvent) => {
      const b = section.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || still()) return;
      const p = local(e);
      pointer.tx = p.x;
      pointer.ty = p.y;
      if (!pointer.target && pointer.strength < 0.001) {
        pointer.x = p.x;
        pointer.y = p.y;
      }
      pointer.target = 1;
      start();
    };
    const leave = () => {
      pointer.target = 0;
      start();
    };
    const tap = (e: PointerEvent) => {
      if (still() || (e.target as Element).closest("a, button, input, textarea, select")) return;
      pulses.push({ ...local(e), age: 0 });
      if (pulses.length > 4) pulses.shift();
      start();
    };
    const onMotion = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      start();
    };
    const onVisibility = () => {
      hidden = document.hidden;
      if (hidden) stop();
      else start();
    };
    const onTheme = () => {
      readColors();
      if (!frame) draw();
    };

    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    section.addEventListener("pointerdown", tap);
    window.addEventListener("blur", leave);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    // Dark mode toggles usually change a class or attribute on <html>.
    const themeWatch = new MutationObserver(onTheme);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    const io = new IntersectionObserver(
      ([entry]) => {
        offscreen = !entry.isIntersecting;
        if (offscreen) stop();
        else start();
      },
      { rootMargin: "160px" },
    );
    io.observe(section);
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    resize();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      themeWatch.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      section.removeEventListener("pointerdown", tap);
      window.removeEventListener("blur", leave);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    wakeRef.current();
  };

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden bg-background text-foreground [touch-action:pan-y]">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full text-primary" />
      {/* Keeps the words readable where the light reaches the top. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-3/5 bg-gradient-to-b from-background via-background/80 to-transparent" />
      <div className="mx-auto flex min-h-[600px] max-w-3xl flex-col items-center px-6 pb-60 pt-20 text-center sm:min-h-[680px] sm:pt-28">
        <p className="text-sm font-medium text-muted-foreground">{copy.label}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{copy.headline}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={copy.primary.href}
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.primary.text}
          </a>
          <a
            href={copy.secondary.href}
            className="inline-flex h-11 items-center rounded-md border border-border bg-background/60 px-6 text-sm font-medium backdrop-blur hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.secondary.text}
          </a>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        className="absolute bottom-4 right-4 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium backdrop-blur hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {paused ? copy.play : copy.pause}
      </button>
    </section>
  );
}
