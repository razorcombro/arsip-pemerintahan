import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Arsip Pemerintahan</h1>
      <p>Frontend admin sederhana untuk sistem arsip.</p>

      <div style={{ marginTop: 20 }}>
        <Link
          href="/login"
          style={{
            background: "#111827",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 8,
            textDecoration: "none"
          }}
        >
          Masuk ke Admin Panel
        </Link>
      </div>
    </main>
  );
}
