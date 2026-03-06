"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { login } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res.token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-card p-6">
        <h1 className="font-serif text-3xl">Welcome back</h1>
        <p className="mt-2 text-muted">Log in to continue your adventure.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <div className="mb-1 text-sm text-muted">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <div className="mb-1 text-sm text-muted">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          {error ? <div className="rounded-xl border border-red/40 bg-red/10 p-3 text-sm">{error}</div> : null}

          <Button disabled={loading} type="submit" className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center text-sm text-muted">
            New here?{" "}
            <Link className="text-gold hover:underline" href="/register">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

