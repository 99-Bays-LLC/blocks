const copy = {
  label: "Invoicing for small teams",
  headline: "Send the invoice today. Get paid this week.",
  body: "Connect your bank, pick a template, and your first invoice goes out in about ten minutes. You see when each one is opened and when it's paid.",
  primary: { text: "Start free", href: "#start" },
  secondary: { text: "See a sample invoice", href: "#sample" },
  proof: ["No card needed", "Cancel any time", "Your data exports as CSV"],
};

/**
 * Hero: Plain · Steal My Slop Blocks · https://blocks.stealmyslop.com
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
 * Uses your theme's colors (background, foreground, primary, muted-foreground, border), so it
 * matches the rest of your shadcn/ui project. Edit the words in `copy` above; they're written for a
 * fictional invoicing app, as an example of specific copy.
 */
export function HeroPlain() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-sm font-medium text-muted-foreground">{copy.label}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          {copy.headline}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.body}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={copy.primary.href}
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.primary.text}
          </a>
          <a
            href={copy.secondary.href}
            className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.secondary.text}
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {copy.proof.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default HeroPlain;
