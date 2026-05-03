"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  async function loadStats() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await apiFetch("/stats/dashboard", {}, token);
      setStats(res.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat statistik dashboard");
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!stats) {
    return <div>Memuat statistik dashboard...</div>;
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  };

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p>Ringkasan statistik sistem arsip pemerintahan.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 16,
          marginTop: 20
        }}
      >
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <p style={{ fontSize: 28, margin: 0 }}>{stats.totalUsers}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Units</h3>
          <p style={{ fontSize: 28, margin: 0 }}>{stats.totalUnits}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Classifications</h3>
          <p style={{ fontSize: 28, margin: 0 }}>{stats.totalClassifications}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Archives</h3>
          <p style={{ fontSize: 28, margin: 0 }}>{stats.totalArchives}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Files</h3>
          <p style={{ fontSize: 28, margin: 0 }}>{stats.totalFiles}</p>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginTop: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}
      >
        <h3>Arsip per Status</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginTop: 12
          }}
        >
          <div style={{ padding: 16, background: "#f9fafb", borderRadius: 10 }}>
            <strong>DRAFT</strong>
            <p style={{ fontSize: 26, margin: "8px 0 0" }}>
              {stats.archivesByStatus.DRAFT}
            </p>
          </div>

          <div style={{ padding: 16, background: "#f9fafb", borderRadius: 10 }}>
            <strong>ACTIVE</strong>
            <p style={{ fontSize: 26, margin: "8px 0 0" }}>
              {stats.archivesByStatus.ACTIVE}
            </p>
          </div>

          <div style={{ padding: 16, background: "#f9fafb", borderRadius: 10 }}>
            <strong>INACTIVE</strong>
            <p style={{ fontSize: 26, margin: "8px 0 0" }}>
              {stats.archivesByStatus.INACTIVE}
            </p>
          </div>

          <div style={{ padding: 16, background: "#f9fafb", borderRadius: 10 }}>
            <strong>DESTROYED</strong>
            <p style={{ fontSize: 26, margin: "8px 0 0" }}>
              {stats.archivesByStatus.DESTROYED}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
