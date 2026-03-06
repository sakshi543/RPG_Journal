"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/Button";
import { useAuthStore } from "@/lib/auth";

function NavLink({ href, label, icon }: { href: string; label: string; icon?: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gold/20 text-gold shadow-gold"
          : "text-muted hover:bg-white/5 hover:text-offwhite"
      }`}
    >
      {icon ? <span className="text-lg">{icon}</span> : null}
      {label}
    </Link>
  );
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-night/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-display text-xl font-semibold tracking-wide text-gold">
              Life RPG
            </Link>
            <nav className="hidden gap-1 md:flex">
              <NavLink href="/dashboard" label="Dashboard" icon="⚔️" />
              <NavLink href="/quests" label="Quests" icon="📜" />
              <NavLink href="/journal" label="Journal" icon="📖" />
              <NavLink href="/character" label="Character" icon="🧙" />
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="rounded-full bg-gold/10 px-3 py-1 font-mono text-xs text-gold">
                  Lv.{user.level}
                </span>
                <span className="text-sm text-muted">{user.username}</span>
              </div>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                clear();
                router.push("/");
              }}
              className="text-muted hover:text-red"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {title ? (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-semibold tracking-wide text-offwhite"
          >
            {title}
          </motion.h1>
        ) : null}
        <div className={title ? "mt-8" : ""}>{children}</div>
      </main>
    </div>
  );
}
