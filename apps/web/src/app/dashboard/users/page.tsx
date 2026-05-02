"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    unitId: "",
    roleCode: "OPERATOR_BIDANG"
  });
  const [error, setError] = useState("");

  async function loadData() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const usersRes = await apiFetch("/users", {}, token);
      const unitsRes = await apiFetch("/units", {}, token);

      setUsers(usersRes.data || []);
      setUnits(unitsRes.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data");
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
        "/users",
        {
          method: "POST",
          body: JSON.stringify(form)
        },
        token
      );

      setForm({
        fullName: "",
        email: "",
        username: "",
        password: "",
        unitId: "",
        roleCode: "OPERATOR_BIDANG"
      });

      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal membuat user");
    }
  }

  return (
    <div>
      <h1>Users</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >
        <h3>Tambah User</h3>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            value={form.unitId}
            onChange={(e) => setForm({ ...form, unitId: e.target.value })}
          >
            <option value="">Pilih Unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>

          <select
            value={form.roleCode}
            onChange={(e) => setForm({ ...form, roleCode: e.target.value })}
          >
            <option value="OPERATOR_BIDANG">OPERATOR_BIDANG</option>
            <option value="ARSIPARIS">ARSIPARIS</option>
            <option value="VERIFIKATOR">VERIFIKATOR</option>
            <option value="PIMPINAN">PIMPINAN</option>
            <option value="VIEWER">VIEWER</option>
            <option value="ADMIN_INSTANSI">ADMIN_INSTANSI</option>
          </select>

          <button type="submit">Simpan User</button>
        </div>

        {error ? <p style={{ color: "red" }}>{error}</p> : null}
      </form>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3>Daftar User</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.fullName} - {user.username} - {user.roles?.join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
