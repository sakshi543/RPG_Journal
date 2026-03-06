"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { register } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register({ email, username, password });
      setAuth(res.token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-card p-6">
        <h1 className="font-serif text-3xl">Create your adventurer</h1>
        <p className="mt-2 text-muted">Your side quests are about to start paying off.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <div className="mb-1 text-sm text-muted">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <div className="mb-1 text-sm text-muted">Username</div>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          </div>
          <div>
            <div className="mb-1 text-sm text-muted">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} />
          </div>

          {error ? <div className="rounded-xl border border-red/40 bg-red/10 p-3 text-sm">{error}</div> : null}

          <Button disabled={loading} type="submit" className="w-full">
            {loading ? "Creating..." : "Create account"}
          </Button>

          <div className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link className="text-gold hover:underline" href="/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

