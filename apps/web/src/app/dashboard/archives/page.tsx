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
  const [uploadArchiveId, setUploadArchiveId] = useState("");
  const [editingArchiveId, setEditingArchiveId] = useState("");
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

  const [editForm, setEditForm] = useState({
    title: "",
    summary: "",
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
      setUploadArchiveId(res.data.id);
      setSuccess("Arsip berhasil dibuat. Anda bisa upload file sekarang.");
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
    const targetArchiveId = uploadArchiveId || createdArchiveId;

    if (!targetArchiveId) {
      setError("Pilih atau isi Archive ID terlebih dahulu");
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
        `${API_BASE_URL}/archives/${targetArchiveId}/upload`,
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
      setUploadArchiveId("");

      const input = document.getElementById("archive-file-input") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }

      await loadData();
    } catch (err: any) {
      setError(err.message || "Upload file gagal");
    }
  }

  function startEdit(archive: any) {
    setEditingArchiveId(archive.id);
    setEditForm({
      title: archive.title || "",
      summary: archive.summary || "",
      status: archive.status || "ACTIVE",
      keywords: Array.isArray(archive.keywords)
        ? archive.keywords.join(", ")
        : ""
    });
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditingArchiveId("");
    setEditForm({
      title: "",
      summary: "",
      status: "ACTIVE",
      keywords: ""
    });
  }

  async function handleUpdateArchive(archiveId: string) {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("accessToken") || "";

    try {
      await apiFetch(
        `/archives/${archiveId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: editForm.title,
            summary: editForm.summary,
            status: editForm.status,
            keywords: editForm.keywords
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          })
        },
        token
      );

      setSuccess("Arsip berhasil diperbarui");
      cancelEdit();
      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui arsip");
    }
  }

  async function handleDeleteArchive(archiveId: string) {
    const ok = window.confirm("Yakin ingin soft delete arsip ini?");
    if (!ok) return;

    setError("");
    setSuccess("");

    const token = localStorage.getItem("accessToken") || "";

    try {
      await apiFetch(
        `/archives/${archiveId}`,
        {
          method: "DELETE"
        },
        token
      );

      setSuccess("Arsip berhasil di-soft delete");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus arsip");
    }
  }

  async function handleDownloadFile(archiveId: string, fileId: string, fileName: string) {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await fetch(
        `${API_BASE_URL}/archives/${archiveId}/files/${fileId}/download`,
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
          <h3>Upload File</h3>

          <p style={{ fontSize: 14 }}>
            Bisa upload ke arsip baru atau ke arsip yang sudah ada.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Archive ID"
              value={uploadArchiveId || createdArchiveId}
              onChange={(e) => {
                setUploadArchiveId(e.target.value);
                setCreatedArchiveId("");
              }}
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

        <div style={{ display: "grid", gap: 16 }}>
          {archives.map((archive) => (
            <div
              key={archive.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>{archive.archiveNumber}</strong> - {archive.title} -{" "}
                {archive.status}
              </div>

              <div style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
                Unit: {archive.createdByUnit?.name || "-"} | Klasifikasi:{" "}
                {archive.classification?.name || "-"}
              </div>

              {editingArchiveId === archive.id ? (
                <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                  <input
                    placeholder="Judul"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Ringkasan"
                    rows={3}
                    value={editForm.summary}
                    onChange={(e) =>
                      setEditForm({ ...editForm, summary: e.target.value })
                    }
                  />
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DESTROYED">DESTROYED</option>
                  </select>
                  <input
                    placeholder="Keywords pisahkan dengan koma"
                    value={editForm.keywords}
                    onChange={(e) =>
                      setEditForm({ ...editForm, keywords: e.target.value })
                    }
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateArchive(archive.id)}
                    >
                      Simpan Edit
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 14 }}>
                    Ringkasan: {archive.summary || "-"}
                  </div>
                  <div style={{ fontSize: 13, color: "#777" }}>
                    Keywords:{" "}
                    {Array.isArray(archive.keywords) && archive.keywords.length
                      ? archive.keywords.join(", ")
                      : "-"}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button type="button" onClick={() => startEdit(archive)}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteArchive(archive.id)}
                >
                  Soft Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadArchiveId(archive.id);
                    setSuccess(`Upload diarahkan ke arsip ${archive.archiveNumber}`);
                    setError("");
                  }}
                >
                  Pilih untuk Upload
                </button>
              </div>

              <div>
                <strong>Files:</strong>
                {archive.files?.length ? (
                  <ul style={{ marginTop: 8 }}>
                    {archive.files.map((file: any) => (
                      <li key={file.id} style={{ marginBottom: 6 }}>
                        {file.originalName}{" "}
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadFile(
                              archive.id,
                              file.id,
                              file.originalName
                            )
                          }
                          style={{ marginLeft: 8 }}
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 14, color: "#777", marginTop: 8 }}>
                    Belum ada file
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
