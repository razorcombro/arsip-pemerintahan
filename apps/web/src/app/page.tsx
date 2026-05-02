async function getApiHealth() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

    const res = await fetch(`${baseUrl.replace("/api", "")}/api/health`, {
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error("API tidak merespons");
    }

    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await getApiHealth();

  return (
    <main style={{ padding: 32 }}>
      <h1>Arsip Pemerintahan</h1>
      <p>Starter project monorepo Railway + GitHub</p>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid #ccc" }}>
        <h2>Status API</h2>
        {health ? (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        ) : (
          <p>API belum tersambung.</p>
        )}
      </div>
    </main>
  );
}