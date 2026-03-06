import type { CharacterOverview, JournalPage, Quest, QuestLog, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function parseError(res: Response) {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  const msg =
    typeof body === "object" && body && "detail" in body
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        String((body as any).detail)
      : `Request failed (${res.status})`;
  return new ApiError(msg, res.status, body);
}

export async function register(payload: {
  email: string;
  username: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function login(payload: { email: string; password: string }): Promise<{ token: string; user: User }> {
  const body = new URLSearchParams();
  body.set("username", payload.email);
  body.set("password", payload.password);
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function me(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

async function apiFetch<T>(path: string, opts: RequestInit & { token: string }): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      authorization: `Bearer ${opts.token}`
    },
    cache: "no-store"
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export function listQuests(token: string): Promise<Quest[]> {
  return apiFetch<Quest[]>("/quests?is_active=true", { method: "GET", token });
}

export function createQuest(
  token: string,
  payload: {
    title: string;
    description?: string | null;
    category: string;
    difficulty: string;
    quest_type: string;
    progress_target?: number | null;
  }
): Promise<Quest> {
  return apiFetch<Quest>("/quests", {
    method: "POST",
    token,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function getQuest(token: string, id: string): Promise<Quest> {
  return apiFetch<Quest>(`/quests/${id}`, { method: "GET", token });
}

export function completeQuest(
  token: string,
  id: string,
  payload: { notes?: string | null; mood: number; location_name?: string | null; lat?: number | null; lng?: number | null; tags?: string[] }
): Promise<{ quest_log: QuestLog; xp_earned: number; leveled_up: boolean; new_level: number | null }> {
  return apiFetch(`/quests/${id}/complete`, {
    method: "POST",
    token,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function listLogs(token: string): Promise<QuestLog[]> {
  return apiFetch<QuestLog[]>("/logs?limit=50", { method: "GET", token });
}

export function listLogsForQuest(token: string, questId: string): Promise<QuestLog[]> {
  return apiFetch<QuestLog[]>(`/logs?quest_id=${encodeURIComponent(questId)}&limit=50`, { method: "GET", token });
}

export async function getLog(token: string, logId: string): Promise<QuestLog | { id: string; is_sealed: true; opens_on: string }> {
  return apiFetch(`/logs/${logId}`, { method: "GET", token });
}

export async function uploadLogPhoto(
  token: string,
  logId: string,
  file: File
): Promise<{ id: string; url: string; thumbnail_url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/logs/${logId}/photos`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export function getJournalPage(token: string, logId: string): Promise<JournalPage> {
  return apiFetch<JournalPage>(`/journal/${logId}`, { method: "GET", token });
}

export function updateJournalPage(token: string, logId: string, patch: Partial<JournalPage>): Promise<JournalPage> {
  return apiFetch<JournalPage>(`/journal/${logId}`, {
    method: "PUT",
    token,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch)
  });
}

export function getCharacterOverview(token: string): Promise<CharacterOverview> {
  return apiFetch<CharacterOverview>("/character", { method: "GET", token });
}

