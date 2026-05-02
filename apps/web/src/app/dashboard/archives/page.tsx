"use client";

import { useEffect, useState } from "react";
import { apiFetch, API_BASE_URL } from "../../../lib/api";

export default function ArchivesPage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createdArchiveId, setCreatedArchiveId] = useState("");
  const [form, setForm] = useState({
    archiveNumber: "",
    letterNumber: "",
    title: "",
    summary: "",
    createdByUnitId: "",
    classificationId: "",
    securityLevel: "BIASA",
    status: "ACTIVE",
    keywords: ""
  });

  async function loadData() {
    const token = localStorage.getItem("accessToken") || "";

    try {
      const [archivesRes, unitsRes, classificationsRes] = await Promise.all([
        apiFetch("/archives", {}, token),
        apiFetch("/units", {}, token),
        apiFetch("/classifications", {}, token)
      ]);

      setArchives(archivesRes.data || []);
      setUnits(unitsRes.data || []);
      setClassifications(classificationsRes.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data arsip");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateArchive(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await apiFetch(
        "/archives",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            keywords: form.keywords
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          })
        },
        token
      );

      setCreatedArchiveId(res.data.id);
      setSuccess("Arsip berhasil dibuat. Sekarang Anda bisa upload file.");
      setForm({
        archiveNumber: "",
        letterNumber: "",
        title: "",
        summary: "",
        createdByUnitId: "",
        classificationId: "",
        securityLevel: "BIASA",
        status: "ACTIVE",
        keywords: ""
      });

      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal membuat arsip");
    }
  }

  async function handleUploadFile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("accessToken") || "";

    if (!createdArchiveId) {
      setError("Buat arsip dulu sebelum upload file");
      return;
    }

    if (!selectedFile) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(
        `${API_BASE_URL}/archives/${createdArchiveId}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload file gagal");
      }

      setSuccess("File berhasil diupload ke arsip");
      setSelectedFile(null);
      setCreatedArchiveId("");

      const input = document.getElementById("archive-file-input") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }

      await loadData();
    } catch (err: any) {
      setError(err.message || "Upload file gagal");
    }
  }

  return (
    <div>
      <h1>Archives</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          alignItems: "start"
        }}
      >
        <form
          onSubmit={handleCreateArchive}
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12
          }}
        >
          <h3>Buat Arsip Baru</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Nomor Arsip"
              value={form.archiveNumber}
              onChange={(e) =>
                setForm({ ...form, archiveNumber: e.target.value })
              }
            />
            <input
              placeholder="Nomor Surat"
              value={form.letterNumber}
              onChange={(e) =>
                setForm({ ...form, letterNumber: e.target.value })
              }
            />
            <input
              placeholder="Judul Arsip"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Ringkasan"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={4}
            />

            <select
              value={form.createdByUnitId}
              onChange={(e) =>
                setForm({ ...form, createdByUnitId: e.target.value })
              }
            >
              <option value="">Pilih Unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>

            <select
              value={form.classificationId}
              onChange={(e) =>
                setForm({ ...form, classificationId: e.target.value })
              }
            >
              <option value="">Pilih Klasifikasi</option>
              {classifications.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>

            <select
              value={form.securityLevel}
              onChange={(e) =>
                setForm({ ...form, securityLevel: e.target.value })
              }
            >
              <option value="BIASA">BIASA</option>
              <option value="TERBATAS">TERBATAS</option>
              <option value="RAHASIA">RAHASIA</option>
              <option value="SANGAT_RAHASIA">SANGAT_RAHASIA</option>
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <input
              placeholder="Keywords pisahkan dengan koma"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            />

            <button type="submit">Simpan Arsip</button>
          </div>
        </form>

        <form
          onSubmit={handleUploadFile}
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12
          }}
        >
          <h3>Upload File ke Arsip Baru</h3>

          <p style={{ fontSize: 14 }}>
            Setelah membuat arsip, ID arsip akan disimpan sementara untuk upload file.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Archive ID hasil create"
              value={createdArchiveId}
              onChange={(e) => setCreatedArchiveId(e.target.value)}
            />

            <input
              id="archive-file-input"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <button type="submit">Upload File</button>
          </div>
        </form>
      </div>

      {error ? (
        <p style={{ color: "red", marginTop: 16 }}>{error}</p>
      ) : null}

      {success ? (
        <p style={{ color: "green", marginTop: 16 }}>{success}</p>
      ) : null}

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginTop: 20
        }}
      >
        <h3>Daftar Arsip</h3>

        <ul style={{ paddingLeft: 18 }}>
          {archives.map((archive) => (
            <li key={archive.id} style={{ marginBottom: 12 }}>
              <div>
                <strong>{archive.archiveNumber}</strong> - {archive.title} -{" "}
                {archive.status}
              </div>
              <div style={{ fontSize: 14, color: "#555" }}>
                Unit: {archive.createdByUnit?.name || "-"} | Klasifikasi:{" "}
                {archive.classification?.name || "-"}
              </div>
              <div style={{ fontSize: 13, color: "#777" }}>
                Files: {archive.files?.length || 0}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
