"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  async function loadData() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await apiFetch("/audit-logs", {}, token);
      setLogs(res.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat audit log");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = `${log.action || ""} ${log.entityType || ""} ${log.description || ""} ${log.user?.username || ""} ${log.user?.fullName || ""} ${log.archive?.archiveNumber || ""}`.toLowerCase();

      const matchesSearch = search
        ? text.includes(search.toLowerCase())
        : true;

      const matchesAction = actionFilter
        ? log.action === actionFilter
        : true;

      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const actions = Array.from(new Set(logs.map((log) => log.action).filter(Boolean)));

  return (
    <div>
      <h1>Audit Logs</h1>
      <p>Riwayat aktivitas penting pada sistem arsip.</p>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >
        <h3>Filter</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 10
          }}
        >
          <input
            placeholder="Cari user, arsip, aksi, deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">Semua Aksi</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12
        }}
      >
        <h3>Daftar Audit Log ({filteredLogs.length})</h3>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14
            }}
          >
            <thead>
              <tr>
                <th style={th}>Waktu</th>
                <th style={th}>User</th>
                <th style={th}>Aksi</th>
                <th style={th}>Entity</th>
                <th style={th}>Arsip</th>
                <th style={th}>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={td}>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                  <td style={td}>
                    {log.user
                      ? `${log.user.fullName} (${log.user.username})`
                      : "-"}
                  </td>
                  <td style={td}>
                    <strong>{log.action}</strong>
                  </td>
                  <td style={td}>
                    {log.entityType}
                    <br />
                    <span style={{ color: "#777" }}>{log.entityId || "-"}</span>
                  </td>
                  <td style={td}>
                    {log.archive
                      ? `${log.archive.archiveNumber} - ${log.archive.title}`
                      : "-"}
                  </td>
                  <td style={td}>{log.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredLogs.length ? (
          <p style={{ color: "#777" }}>Belum ada audit log.</p>
        ) : null}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 10,
  borderBottom: "1px solid #ddd",
  background: "#f9fafb"
};

const td: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #eee",
  verticalAlign: "top"
};
