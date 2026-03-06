"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useAuthStore } from "@/lib/auth";

export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-card/60 p-8 backdrop-blur"
      >
        <h1 className="font-display text-4xl font-bold tracking-wide text-gold">
          Life RPG
        </h1>
        <p className="mt-4 text-lg text-muted">
          Journal your life as side quests. Complete them, earn XP, level up, and build a scrapbook journal you can decorate.
        </p>

        {token && user ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
              <div className="text-sm text-muted">Adventurer</div>
              <div className="font-display text-2xl font-semibold text-offwhite">
                {user.username}
              </div>
              <div className="mt-2 font-mono text-sm text-gold">
                Level {user.level} · {user.total_xp} XP
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-gold-dim to-gold px-5 py-2.5 font-semibold text-ink shadow-gold transition hover:shadow-gold-strong"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/quests"
                className="rounded-xl border border-white/10 px-5 py-2.5 transition hover:bg-white/5"
              >
                Quest Board
              </Link>
              <Link
                href="/journal"
                className="rounded-xl border border-white/10 px-5 py-2.5 transition hover:bg-white/5"
              >
                Journal
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-gold-dim to-gold px-5 py-2.5 font-semibold text-ink shadow-gold transition hover:shadow-gold-strong"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-gold/40 px-5 py-2.5 text-gold transition hover:bg-gold/10"
            >
              Create account
            </Link>
          </div>
        )}
      </motion.div>
    </main>
  );
}
