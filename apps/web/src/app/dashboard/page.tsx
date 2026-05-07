"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

  const summary = [
    { label: "Users", value: stats.totalUsers },
    { label: "Units", value: stats.totalUnits },
    { label: "Classifications", value: stats.totalClassifications },
    { label: "Archives", value: stats.totalArchives },
    { label: "Files", value: stats.totalFiles }
  ];

  const statusData = Object.entries(stats.archivesByStatus).map(([name, value]) => ({
    name,
    value
  }));

  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Ringkasan statistik sistem arsip pemerintahan.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginTop: 24 }}>
        {summary.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="muted">{item.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginTop: 24 }}>
        <div className="card">
          <h3>Statistik Utama</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Arsip per Status</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
