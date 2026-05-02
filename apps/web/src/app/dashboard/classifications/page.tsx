"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function ClassificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    activeRetention: 1,
    inactiveRetention: 1
  });
  const [error, setError] = useState("");

  async function loadData() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await apiFetch("/classifications", {}, token);
      setItems(res.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat klasifikasi");
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
        "/classifications",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            activeRetention: Number(form.activeRetention),
            inactiveRetention: Number(form.inactiveRetention)
          })
        },
        token
      );

      setForm({
        code: "",
        name: "",
        activeRetention: 1,
        inactiveRetention: 1
      });

      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal menambah klasifikasi");
    }
  }

  return (
    <div>
      <h1>Classifications</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >
        <h3>Tambah Klasifikasi</h3>
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
          <input
            placeholder="Active Retention"
            type="number"
            value={form.activeRetention}
            onChange={(e) =>
              setForm({ ...form, activeRetention: Number(e.target.value) })
            }
          />
          <input
            placeholder="Inactive Retention"
            type="number"
            value={form.inactiveRetention}
            onChange={(e) =>
              setForm({ ...form, inactiveRetention: Number(e.target.value) })
            }
          />
          <button type="submit">Simpan Klasifikasi</button>
        </div>

        {error ? <p style={{ color: "red" }}>{error}</p> : null}
      </form>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3>Daftar Klasifikasi</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.code} - {item.name} (aktif {item.activeRetention} th, inaktif{" "}
              {item.inactiveRetention} th)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
