"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: "",
    name: ""
  });
  const [error, setError] = useState("");

  async function loadData() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await apiFetch("/units", {}, token);
      setUnits(res.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat unit");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("accessToken") || "";

    try {
      await apiFetch(
        "/units",
        {
          method: "POST",
          body: JSON.stringify(form)
        },
        token
      );

      setForm({ code: "", name: "" });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal menambah unit");
    }
  }

  return (
    <div>
      <h1>Units</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >
        <h3>Tambah Unit</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <button type="submit">Simpan Unit</button>
        </div>

        {error ? <p style={{ color: "red" }}>{error}</p> : null}
      </form>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3>Daftar Unit</h3>
        <ul>
          {units.map((unit) => (
            <li key={unit.id}>
              {unit.code} - {unit.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
