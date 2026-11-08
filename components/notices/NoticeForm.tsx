"use client";

import { useState } from "react";

const inputClass =
  "w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-text focus:outline-2 focus:outline-brand-primary";

export default function NoticeForm() {
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    if (!time) return setError("Elegí una hora.");

    // Próxima vez que llega esa hora: hoy si todavía no pasó, si no mañana.
    const [h, m] = time.split(":").map(Number);
    const fireAt = new Date();
    fireAt.setHours(h, m, 0, 0);
    if (fireAt.getTime() - Date.now() < 60 * 1000) fireAt.setDate(fireAt.getDate() + 1);

    setLoading(true);
    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fire_at: fireAt.toISOString() }),
    });
    const json = (await res.json()) as { ok: boolean; error?: string };
    setLoading(false);

    if (!res.ok || !json.ok) return setError(json.error ?? "No pudimos programar el aviso.");
    setStatus("Aviso programado.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="fire_time" className="mb-1 block text-sm font-medium">
          Hora del aviso
        </label>
        <input
          id="fire_time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {status && <p role="status" className="text-sm text-success">{status}</p>}

      <button
        type="submit"
        disabled={loading}
        className="min-h-11 w-full rounded-lg bg-brand-primary px-4 py-2 font-medium text-brand-on-primary disabled:opacity-60"
      >
        {loading ? "Programando…" : "Programar aviso"}
      </button>
    </form>
  );
}
