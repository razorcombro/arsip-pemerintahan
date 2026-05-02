"use client";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p>Selamat datang di panel admin sistem arsip pemerintahan.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          marginTop: 20
        }}
      >
        <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
          <h3>Users</h3>
          <p>Kelola akun pengguna dan role.</p>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
          <h3>Units</h3>
          <p>Kelola master unit kerja.</p>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
          <h3>Archives</h3>
          <p>Kelola arsip, file, dan aksesnya.</p>
        </div>
      </div>
    </div>
  );
}
