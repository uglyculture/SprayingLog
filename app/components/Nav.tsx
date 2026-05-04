"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "New Entry" },
    { href: "/log", label: "Log" },
    { href: "/materials", label: "Materials" },
  ];

  return (
    <nav className="bg-green-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        <span className="font-bold text-lg">Spraying Log</span>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-green-900 text-white"
                  : "text-green-100 hover:bg-green-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
