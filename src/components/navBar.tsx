"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/paintings", label: "Paintings" },
  { href: "/tickets", label: "Tickets" },
  { href: "/about", label: "About" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 z-50 w-screen p-gutter text-[10px] leading-3 font-medium text-white uppercase mix-blend-difference">
      <div className="flex w-full items-center justify-between gap-gutter">
        <Link href="/" className="text-nowrap">
          Wall of Art
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex gap-gutter">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-nowrap transition-colors duration-300 ${
                      active ? "text-white" : "text-muted hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
