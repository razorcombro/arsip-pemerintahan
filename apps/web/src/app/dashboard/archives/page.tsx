"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function ArchivesPage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function loadData() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await apiFetch("/archives", {}, token);
      setArchives(res.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat arsip");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1>Archives</h1>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3>Daftar Arsip</h3>
        <ul>
          {archives.map((archive) => (
            <li key={archive.id}>
              <strong>{archive.archiveNumber}</strong> - {archive.title} -{" "}
              {archive.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
