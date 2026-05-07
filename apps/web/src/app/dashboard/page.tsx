"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  async function loadStats() {
    const token = localStorage.getItem("accessToken") || "";
    const res = await apiFetch("/stats/dashboard", {}, token);
    setStats(res.data);
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) return <div>Memuat...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Ringkasan sistem arsip</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
        gap: 16,
        marginTop: 20
      }}>
        {[
          ["Users", stats.totalUsers, "#6366f1"],
          ["Units", stats.totalUnits, "#0ea5e9"],
          ["Classifications", stats.totalClassifications, "#22c55e"],
          ["Archives", stats.totalArchives, "#f59e0b"],
          ["Files", stats.totalFiles, "#ef4444"]
        ].map(([label, value, color]) => (
          <div
            key={label}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              borderTop: `4px solid ${color}`,
              boxShadow: "0 6px 16px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ fontSize: 14, color: "#6b7280" }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Arsip per Status</h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginTop: 12
        }}>
          {Object.entries(stats.archivesByStatus).map(([k, v]) => (
            <div
              key={k}
              style={{
                background: "#f9fafb",
                padding: 16,
                borderRadius: 12,
                textAlign: "center"
              }}
            >
              <strong>{k}</strong>
              <div style={{ fontSize: 26 }}>{v as number}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
