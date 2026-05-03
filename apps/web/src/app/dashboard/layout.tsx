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

    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }

    setReady(true);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    router.push("/login");
  }

  if (!ready) {
    return <div style={{ padding: 30 }}>Memuat...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 250,
          background: "#111827",
          color: "#fff",
          padding: 20
        }}
      >
        <h2 style={{ marginTop: 0 }}>Admin Panel</h2>
        <p style={{ fontSize: 14, opacity: 0.8 }}>
          {user?.fullName || "User"}
        </p>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: "#fff",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)"
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "none",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
