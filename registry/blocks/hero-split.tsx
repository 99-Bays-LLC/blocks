const copy = {
  headline: "Know which invoices are late before your client does.",
  body: "Every invoice shows when it was sent, opened and paid. Late ones get a polite reminder on the day you choose, written by you, not a robot.",
  primary: { text: "Try it free for 30 days", href: "#start" },
  note: "Set up in about ten minutes. No card needed.",
};

const invoices = [
  { client: "Harbor Studio", amount: "$2,400", status: "Paid" },
  { client: "Northside Dental", amount: "$860", status: "Opened" },
  { client: "Fig & Co.", amount: "$1,150", status: "3 days late" },
];

/**
 * Hero: Split · Steal My Slop Blocks · https://blocks.stealmyslop.com
 * MIT License. Copyright (c) 2026 99 Bays LLC. Free to use, change and share; keep this
 * notice with the code. Full text: https://stealmyslop.com/license#blocks
 * SPDX-License-Identifier: MIT
 *
 * Words on the left, a small product picture on the right, drawn with plain elements so there's
 * no image to replace before it looks finished. Swap the picture for a screenshot when you have
 * one. Uses your theme's colors (background, foreground, primary, muted, border).
 */
export function HeroSplit() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{copy.headline}</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">{copy.body}</p>
          <a
            href={copy.primary.href}
            className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.primary.text}
          </a>
          <p className="mt-3 text-sm text-muted-foreground">{copy.note}</p>
        </div>

        {/* The picture: an invoice list. Decorative, so screen readers skip it. */}
        <div aria-hidden="true" className="rounded-lg border border-border bg-muted p-4 sm:p-6">
          <div className="rounded-md border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm">
              <span className="font-medium">Invoices this month</span>
              <span className="text-muted-foreground">3</span>
            </div>
            <ul>
              {invoices.map((i) => (
                <li key={i.client} className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 text-sm last:border-b-0">
                  <span>{i.client}</span>
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums">{i.amount}</span>
                    <span
                      className={
                        i.status === "Paid"
                          ? "rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
                          : "rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      }
                    >
                      {i.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSplit;
