"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, API_BASE_URL } from "../../../../lib/api";

export default function ArchiveDetailPage({
  params
}: {
  params: { id: string };
}) {
  const [archive, setArchive] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await apiFetch(`/archives/${params.id}`, {}, token);
      setArchive(res.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail arsip");
    }
  }

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function handleDownloadFile(fileId: string, fileName: string) {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await fetch(
        `${API_BASE_URL}/archives/${params.id}/files/${fileId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        let msg = "Gagal download file";
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("File berhasil didownload");
    } catch (err: any) {
      setError(err.message || "Gagal download file");
    }
  }

  if (error) {
    return (
      <div>
        <Link href="/dashboard/archives">← Kembali ke Arsip</Link>
        <p style={{ color: "red", marginTop: 16 }}>{error}</p>
      </div>
    );
  }

  if (!archive) {
    return <div>Memuat detail arsip...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/dashboard/archives">← Kembali ke Arsip</Link>
      </div>

      <h1>Detail Arsip</h1>

      {success ? <p style={{ color: "green" }}>{success}</p> : null}

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >
        <h3>Metadata Arsip</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <div><strong>ID:</strong> {archive.id}</div>
          <div><strong>Nomor Arsip:</strong> {archive.archiveNumber}</div>
          <div><strong>Nomor Surat:</strong> {archive.letterNumber || "-"}</div>
          <div><strong>Judul:</strong> {archive.title}</div>
          <div><strong>Ringkasan:</strong> {archive.summary || "-"}</div>
          <div><strong>Status:</strong> {archive.status}</div>
          <div><strong>Security Level:</strong> {archive.securityLevel}</div>
          <div><strong>Versi:</strong> {archive.version}</div>
          <div><strong>Unit:</strong> {archive.createdByUnit?.name || "-"}</div>
          <div><strong>Klasifikasi:</strong> {archive.classification?.name || "-"}</div>
          <div>
            <strong>Keywords:</strong>{" "}
            {Array.isArray(archive.keywords) && archive.keywords.length
              ? archive.keywords.join(", ")
              : "-"}
          </div>
          <div><strong>Dibuat:</strong> {archive.createdAt}</div>
          <div><strong>Diupdate:</strong> {archive.updatedAt}</div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12
        }}
      >
        <h3>Metadata File</h3>

        {archive.files?.length ? (
          <div style={{ display: "grid", gap: 16 }}>
            {archive.files.map((file: any) => (
              <div
                key={file.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 14
                }}
              >
                <div><strong>File ID:</strong> {file.id}</div>
                <div><strong>Nama Asli:</strong> {file.originalName}</div>
                <div><strong>Nama Simpan:</strong> {file.storedName}</div>
                <div><strong>MIME Type:</strong> {file.mimeType}</div>
                <div><strong>Ukuran:</strong> {file.sizeBytes}</div>
                <div><strong>Storage Key:</strong> {file.storageKey}</div>
                <div><strong>Checksum SHA-256:</strong> {file.checksumSha256}</div>
                <div><strong>Uploaded At:</strong> {file.uploadedAt}</div>

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadFile(file.id, file.originalName)
                  }
                  style={{ marginTop: 10 }}
                >
                  Download File
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Belum ada file pada arsip ini.</p>
        )}
      </div>
    </div>
  );
}
