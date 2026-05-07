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

  if (!stats) return <div className="card">Memuat dashboard...</div>;

  const cards = [
    ["Total Users", stats.totalUsers, "#6366f1"],
    ["Total Units", stats.totalUnits, "#0ea5e9"],
    ["Classifications", stats.totalClassifications, "#22c55e"],
    ["Archives", stats.totalArchives, "#f59e0b"],
    ["Files", stats.totalFiles, "#ef4444"]
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Ringkasan statistik sistem arsip pemerintahan.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0,1fr))",
          gap: 16,
          marginTop: 24
        }}
      >
        {cards.map(([label, value, color]) => (
          <div key={label as string} className="stat-card">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: `${color}22`,
                marginBottom: 14
              }}
            />
            <div className="muted">{label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 6 }}>
              {value as number}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Arsip per Status</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginTop: 14
          }}
        >
          {Object.entries(stats.archivesByStatus).map(([k, v]) => (
            <div
              key={k}
              style={{
                background: "#f8fafc",
                padding: 18,
                borderRadius: 16,
                border: "1px solid #e5e7eb"
              }}
            >
              <div className="muted">{k}</div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>
                {v as number}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
