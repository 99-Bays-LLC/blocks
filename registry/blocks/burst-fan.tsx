"use client";

import { useEffect, useRef, useState } from "react";

const copy = {
  label: "Lighting rental for small studios",
  headline: "Rent the light. Keep the budget.",
  body: "Pro lights, stands and modifiers by the day, delivered to your studio before the shoot and collected after. Weekly rates for longer jobs.",
  primary: {
    text: "Check availability",
    href: "#availability"
  },
  secondary: {
    text: "See the kit list",
    href: "#kit"
  },
  pause: "Pause light",
  play: "Play light"
};

/**
 * Burst: Fan · Steal My Slop Blocks · https://blocks.stealmyslop.com
 * MIT License. Copyright (c) 2026 99 Bays LLC. Full text: https://blocks.stealmyslop.com/license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * SPDX-License-Identifier: MIT
 *
 * A flat fan of light, like a stage light seen head-on. Some rays are dashed and run outwards;
 * every ray curves away from the pointer along its whole length.
 *
 * The light uses your theme: rays take `primary`, the stage takes `background`, and both update
 * when you switch to dark mode. Hover bends the rays; a click or tap sends a pulse through them.
 * Pauses with the button, when off screen, and in a hidden tab. With reduced motion it stays still.
 * Phones get a light mode, and any device that can't keep up steps down, then settles on a still.
 * Edit the words in `copy` above; tune the light in `LIGHT` below.
 */
const LIGHT = {
  seed: 9841,
  rays: 600,
  reach: 190,
  push: 27,
  drift: 0,
  lean: 8,
  swell: 0.012,
  breathe: [0.4, 0.9]
};

type Ray = { angle: number; radius: number; trail: number; phase: number; speed: number; width: number; opacity: number; dashed: boolean; offset: number; size: number };

export function BurstFan() {
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
    // A half circle of rays, evenly spaced with a little jitter.
    const rays: Ray[] = Array.from({ length: LIGHT.rays }, (_, i) => ({
      angle: -Math.PI + (Math.PI * (i + 0.5)) / LIGHT.rays + (random() - 0.5) * 0.032,
      radius: 0.24 + Math.pow(random(), 0.65) * 0.76,
      trail: random() < 0.66 ? 1 : 0.3 + random() * 0.58,
      phase: random() * Math.PI * 2, speed: LIGHT.breathe[0] + random() * LIGHT.breathe[1],
      width: 0.35 + random() * 0.7, opacity: 0.18 + random() * 0.57,
      dashed: random() < 0.24, offset: random() * 80, size: 0.65 + random() * 1.25,
    }));

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;
    let hidden = document.hidden;
    let offscreen = true;
    let w = 1, h = 1, time = 0, last = 0, frame = 0, count = rays.length;
    // Phones get the light mode from the start: 1x pixels, a third of the rays, 30 frames a second,
    // no per-ray gradients. Any device steps down a tier if frames get slow, and stops at a still
    // picture if even the light mode is too much. Keeps phones cool; desktops keep the full show.
    const coarse = matchMedia("(pointer: coarse)").matches;
    let tier = coarse ? 1 : 0; // 0 full, 1 light, 2 still
    const budget = 1000 / (coarse ? 30 : 60);
    let lastDraw = 0, cost = 0, gap = 0, slowSince = 0;
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
      glowCache = null;
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

    // The glow under the burst only changes on resize or a theme change, so it's drawn once and reused.
    let glowCache: HTMLCanvasElement | null = null;
    const glow = (ox: number, oy: number) => {
      if (!glowCache) {
        glowCache = document.createElement("canvas");
        glowCache.width = Math.ceil(w / 2);
        glowCache.height = Math.ceil(h / 2);
        const gc = glowCache.getContext("2d");
        if (gc) {
          const a = dark ? 1 : 0.55;
          gc.scale(0.5, 0.5);
          const g = gc.createRadialGradient(ox, oy, 0, ox, oy, Math.min(w * 0.58, h * 0.95));
          g.addColorStop(0, rgba(tip, 0.6 * a));
          g.addColorStop(0.12, rgba(line, 0.3 * a));
          g.addColorStop(0.4, rgba(line, 0.1 * a));
          g.addColorStop(1, rgba(line, 0));
          gc.fillStyle = g;
          gc.fillRect(0, 0, w, h);
        }
      }
      ctx.drawImage(glowCache, 0, 0, w, h);
    };

    // Light mode batches every ray into four brightness groups: 8 strokes and 4 fills a frame
    // instead of hundreds of gradients. Full mode gives each ray its own fading gradient and glow.
    const LEVELS = 4;
    let faint: Path2D[] = [], bright: Path2D[] = [], dots: Path2D[] = [];
    const begin = () => {
      faint = Array.from({ length: LEVELS }, () => new Path2D());
      bright = Array.from({ length: LEVELS }, () => new Path2D());
      dots = Array.from({ length: LEVELS }, () => new Path2D());
    };
    const level = (alpha: number) => Math.min(LEVELS - 1, Math.floor((alpha / 0.75) * LEVELS));
    // A ray through pts, brightest at pts[last]. `dash` makes a moving dashed ray (full mode only).
    const stroke = (pts: { x: number; y: number }[], alpha: number, width: number, dash?: number) => {
      const a = pts[0], b = pts[pts.length - 1];
      if (tier) {
        const k = level(alpha), half = pts.length >> 1;
        faint[k].moveTo(a.x, a.y);
        for (let j = 1; j <= half; j++) faint[k].lineTo(pts[j].x, pts[j].y);
        bright[k].moveTo(pts[half].x, pts[half].y);
        for (let j = half + 1; j < pts.length; j++) bright[k].lineTo(pts[j].x, pts[j].y);
        return;
      }
      const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0, rgba(line, 0));
      g.addColorStop(0.4, rgba(line, alpha * (dark ? 0.32 : 0.5)));
      g.addColorStop(1, rgba(tip, alpha * 0.82));
      ctx.strokeStyle = g;
      ctx.lineWidth = width;
      if (dash !== undefined) {
        ctx.setLineDash([1.4, 5.5]);
        ctx.lineDashOffset = dash;
      }
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
      if (dash !== undefined) ctx.setLineDash([]);
    };
    const dot = (x: number, y: number, size: number, alpha: number) => {
      const r = Math.max(0.3, size * 0.55);
      if (tier) {
        const d = dots[level(alpha)];
        d.moveTo(x + r * 1.3, y);
        d.arc(x, y, r * 1.3, 0, Math.PI * 2);
        return;
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size * 3, y - size * 3, size * 6, size * 6);
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = rgba(tip, 1);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    const flush = () => {
      if (!tier) return;
      ctx.lineWidth = 1;
      for (let k = 0; k < LEVELS; k++) {
        const a = ((k + 0.5) / LEVELS) * 0.75;
        ctx.strokeStyle = rgba(line, a * (dark ? 0.3 : 0.45));
        ctx.stroke(faint[k]);
        ctx.strokeStyle = rgba(tip, a * 0.8);
        ctx.stroke(bright[k]);
        ctx.fillStyle = rgba(tip, a * 0.9);
        ctx.fill(dots[k]);
      }
    };

    // A point t of the way along a ray of the fan, nudged sideways by the pointer (parallax).
    const fan = (p: Ray, t: number, cx: number, cy: number, rx: number, ry: number) => {
      const breathe = 1 + LIGHT.swell * Math.sin(time * p.speed + p.phase);
      const parallax = (pointer.x / w - 0.5) * pointer.strength * LIGHT.lean;
      return displace(
        cx + Math.cos(p.angle) * p.radius * rx * t * breathe + parallax * t,
        cy + Math.sin(p.angle) * p.radius * ry * t * breathe,
        t,
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      begin();
      const cx = w * 0.5, cy = h * 1.025, rx = w * 0.46, ry = h * 0.88;
      glow(cx, cy);
      for (let i = 0; i < count; i++) {
        const p = rays[Math.floor((i * rays.length) / count)];
        const start = 1 - p.trail, pts = [];
        for (let j = 0; j <= 8; j++) pts.push(fan(p, start + (p.trail * j) / 8, cx, cy, rx, ry));
        const end = pts[pts.length - 1];
        const alpha = p.opacity * (0.86 + 0.14 * Math.sin(time * 0.65 + p.phase));
        // A few dashed rays run outwards, like light on the move.
        stroke(pts, alpha, p.width, p.dashed ? p.offset - time * 18 * p.speed : undefined);
        dot(end.x, end.y, p.size * (p.dashed ? 0.8 : 1), alpha);
      }
      flush();
      ctx.globalCompositeOperation = "source-over";
    };

    const still = () => pausedRef.current || reduced || tier === 2;
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min((now - last) / 1000 || 0, 0.05);
      if (last) gap = gap * 0.8 + Math.min(now - last, 200) * 0.2;
      last = now;
      if (!still()) time += dt;
      const ease = 1 - Math.exp(-dt * 7);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      pointer.strength += ((still() ? 0 : pointer.target) - pointer.strength) * ease;
      for (const p of pulses) p.age += dt;
      while (pulses.length && pulses[0].age > 1.4) pulses.shift();
      if (now - lastDraw >= budget - 2) {
        lastDraw = now;
        const t0 = performance.now();
        draw();
        // Too slow for 1.5 seconds in a row → step down a tier. "Slow" is our drawing taking most
        // of the frame, or the browser managing under ~25 frames a second (painting the canvas
        // happens after our code, so the frame rate catches what the timer can't).
        cost = cost * 0.8 + (performance.now() - t0) * 0.2;
        if (cost <= budget * 0.6 && gap < 40) slowSince = 0;
        else if (!slowSince) slowSince = now;
        else if (now - slowSince > 1500 && tier < 2) {
          tier += 1;
          slowSince = 0;
          cost = 0;
          gap = 0;
          resize();
        }
      }
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
      const dpr = tier ? 1 : Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.round(rays.length * (tier ? 0.32 : w < 640 ? 0.55 : 1));
      glowCache = null;
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-3/5 bg-linear-to-b from-background via-background/80 to-transparent" />
      <div className="mx-auto flex min-h-[600px] max-w-3xl flex-col items-center px-6 pb-60 pt-20 text-center sm:min-h-[680px] sm:pt-28">
        <p className="text-sm font-medium text-muted-foreground">{copy.label}</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{copy.headline}</h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={copy.primary.href}
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.primary.text}
          </a>
          <a
            href={copy.secondary.href}
            className="inline-flex h-11 items-center rounded-md border border-border bg-background/60 px-6 text-sm font-medium backdrop-blur-sm hover:bg-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.secondary.text}
          </a>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        className="absolute bottom-4 right-4 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {paused ? copy.play : copy.pause}
      </button>
    </section>
  );
}
