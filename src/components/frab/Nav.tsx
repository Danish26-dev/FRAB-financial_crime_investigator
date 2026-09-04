import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const frabLogo = "/frab-logo.png";

export const NAV_LINKS = [
  { label: "PROBLEM", href: "#problem" },
  { label: "SOLUTION", href: "#solution" },
  { label: "PIPELINE", href: "#how-it-works" },
  { label: "AGENTS", href: "#agents" },
  { label: "ARCHITECTURE", href: "#architecture" },
  { label: "OUTPUT", href: "#output" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-500 ${
        scrolled
          ? "border-border bg-background/92 backdrop-blur-sm"
          : "border-transparent bg-background/40"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-3.5 md:px-14">
        <a href="#top" className="flex items-center gap-2.5">
          <img src={frabLogo} alt="FRAB logo" className="h-6 w-6 object-contain" />
          <span className="font-mono text-sm tracking-[0.3em] text-lime">FRAB</span>
        </a>

        <nav className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono whitespace-nowrap text-[10px] tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden whitespace-nowrap border border-border px-2 py-1 font-mono text-[9px] tracking-[0.24em] text-muted-foreground md:inline">
            SH-FIN-01
          </span>
          <Link
            to="/overview"
            className="whitespace-nowrap border border-lime/70 px-4 py-2 font-mono text-[10px] tracking-[0.24em] text-lime transition-colors hover:bg-lime hover:text-background"
          >
            [ ENTER SYSTEM ]
          </Link>

        </div>
      </div>
    </header>
  );
}
