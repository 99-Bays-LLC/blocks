"use client";

import { useRef, useState } from "react";

const copy = {
  before: "Invoices that ",
  highlight: "get paid",
  after: ", without the awkward follow-up.",
  body: "One short email a month: what we shipped, and one tip for getting paid on time. No spam, and you can leave with one click.",
  label: "Email address",
  placeholder: "you@company.com",
  button: "Get the monthly email",
  thanks: "Thanks, you're on the list.",
};

/**
 * Hero: Signup · Steal My Slop Blocks · https://blocks.stealmyslop.com
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
 * Centred headline with one highlighted phrase and an email form. The form doesn't send
 * anything yet: connect `onSubmit` to your email tool (or point `action` at its form URL),
 * then change the thank-you line to say what your tool really does (for example, asking
 * people to confirm by email).
 * Uses your theme's colors (background, foreground, primary, muted-foreground, border).
 */
export function HeroSignup() {
  const [sent, setSent] = useState(false);
  const thanksRef = useRef<HTMLParagraphElement>(null);

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {copy.before}
          <span className="rounded-sm bg-primary px-2 text-primary-foreground [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
            {copy.highlight}
          </span>
          {copy.after}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.body}</p>

        {/* The live region is always in the page, so screen readers announce the message when it fills. */}
        <p role="status" tabIndex={-1} ref={thanksRef} className="mt-10 text-base font-medium empty:mt-0">
          {sent ? copy.thanks : ""}
        </p>
        {sent ? null : (
          <form
            className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              // Send the address to your email tool here.
              setSent(true);
              // Move focus to the message so keyboard and screen-reader users land on it.
              setTimeout(() => thanksRef.current?.focus(), 0);
            }}
          >
            <div className="min-w-0 text-left sm:flex-1">
              <label htmlFor="hero-signup-email" className="mb-1.5 block text-sm font-medium">
                {copy.label}
              </label>
              <input
                id="hero-signup-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder={copy.placeholder}
                className="h-11 w-full min-w-0 rounded-md border border-border bg-background px-4 text-base outline-hidden placeholder:text-muted-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              />
            </div>
            <button
              type="submit"
              className="h-11 shrink-0 whitespace-nowrap rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {copy.button}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default HeroSignup;
