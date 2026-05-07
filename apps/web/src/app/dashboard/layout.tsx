"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/units", label: "Units" },
  { href: "/dashboard/classifications", label: "Classifications" },
  { href: "/dashboard/archives", label: "Archives" },
  { href: "/dashboard/audit-logs", label: "Audit Logs" }
];

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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
          width: 270,
          background: "linear-gradient(180deg,#0f172a,#111827)",
          color: "#fff",
          padding: 22,
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, lineHeight: "1.4" }}>
          I love istri tercinta<br />Fenie Ayu ❤️
        </h2>

        <p style={{ fontSize: 14, color: "#cbd5e1", marginBottom: 24 }}>
          {user?.fullName || "User"}
        </p>

        <nav style={{ display: "grid", gap: 10 }}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: "#fff",
                textDecoration: "none",
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                fontWeight: 600
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="secondary-btn"
          style={{ marginTop: 24, width: "100%" }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}
