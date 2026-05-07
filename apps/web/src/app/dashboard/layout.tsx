"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/units", label: "Units" },
  { href: "/dashboard/classifications", label: "Classifications" },
  { href: "/dashboard/archives", label: "Archives" },
  { href: "/dashboard/audit-logs", label: "Audit Logs" }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const currentUser = localStorage.getItem("currentUser");

    if (!token) {
      router.push("/login");
      return;
    }

    if (currentUser) setUser(JSON.parse(currentUser));
    setReady(true);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    router.push("/login");
  }

  if (!ready) return <div style={{ padding: 30 }}>Memuat...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 280,
          background: "linear-gradient(180deg,#020617,#111827)",
          color: "#fff",
          padding: 24,
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
            padding: 16,
            borderRadius: 20,
            marginBottom: 22
          }}
        >
          <h2 style={{ margin: 0, fontSize: 19, lineHeight: 1.4 }}>
            I love istri tercinta<br />Fenie Ayu ❤️
          </h2>
          <p style={{ margin: "10px 0 0", color: "#cbd5e1", fontSize: 13 }}>
            {user?.fullName || "User"}
          </p>
        </div>

        <nav style={{ display: "grid", gap: 9 }}>
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  padding: "13px 14px",
                  borderRadius: 14,
                  background: active
                    ? "linear-gradient(90deg,#2563eb,#7c3aed)"
                    : "rgba(255,255,255,.07)",
                  fontWeight: 700,
                  boxShadow: active ? "0 10px 20px rgba(37,99,235,.25)" : "none"
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="secondary-btn"
          style={{ marginTop: 24, width: "100%" }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: 34 }}>
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div className="badge">Production</div>
          </div>
          <div className="muted">
            Sistem Arsip Pemerintahan
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
