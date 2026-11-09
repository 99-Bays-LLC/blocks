"use client";

import { useState } from "react";

const copy = {
  before: "Invoices that ",
  highlight: "get paid",
  after: ", without the awkward follow-up.",
  body: "One short email a month: what we shipped, and one tip for getting paid on time. No spam, and you can leave with one click.",
  label: "Email address",
  placeholder: "you@company.com",
  button: "Get the monthly email",
  thanks: "Thanks. Check your inbox to confirm.",
};

/**
 * Hero: Signup · Steal My Slop Blocks · https://blocks.stealmyslop.com
 * MIT License. Copyright (c) 2026 99 Bays LLC. Free to use, change and share; keep this
 * notice with the code. Full text: https://blocks.stealmyslop.com/license
 * SPDX-License-Identifier: MIT
 *
 * Centred headline with one highlighted phrase and an email form. The form doesn't send
 * anything yet: connect `onSubmit` to your email tool (or point `action` at its form URL).
 * Uses your theme's colors (background, foreground, primary, muted-foreground, border).
 */
export function HeroSignup() {
  const [sent, setSent] = useState(false);

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {copy.before}
          <span className="rounded bg-primary px-2 text-primary-foreground [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
            {copy.highlight}
          </span>
          {copy.after}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.body}</p>

        {sent ? (
          <p role="status" className="mt-10 text-base font-medium">
            {copy.thanks}
          </p>
        ) : (
          <form
            className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              // Send the address to your email tool here.
              setSent(true);
            }}
          >
            <label htmlFor="hero-signup-email" className="sr-only">
              {copy.label}
            </label>
            <input
              id="hero-signup-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={copy.placeholder}
              className="h-11 w-full min-w-0 rounded-md sm:flex-1 border border-border bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            />
            <button
              type="submit"
              className="h-11 shrink-0 whitespace-nowrap rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
