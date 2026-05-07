"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, API_BASE_URL } from "../../../lib/api";

export default function ArchivesPage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [editingArchiveId, setEditingArchiveId] = useState("");

  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

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

  const filteredArchives = useMemo(() => {
    return archives.filter((archive) => {
      const text = `${archive.archiveNumber || ""} ${archive.title || ""} ${
        archive.letterNumber || ""
      } ${archive.summary || ""}`.toLowerCase();

      return (
        (!search || text.includes(search.toLowerCase())) &&
        (!statusFilter || archive.status === statusFilter) &&
        (!unitFilter || archive.createdByUnitId === unitFilter) &&
        (!classificationFilter || archive.classificationId === classificationFilter)
      );
    });
  }, [archives, search, statusFilter, unitFilter, classificationFilter]);

  async function handleCreateArchive(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("accessToken") || "";

    try {
      await apiFetch(
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

      setSuccess("Arsip berhasil dibuat.");
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

  async function uploadFileToArchive(archiveId: string, file: File | null) {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    const token = localStorage.getItem("accessToken") || "";

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/archives/${archiveId}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload file gagal");
      }

      setSuccess("File berhasil diupload.");
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

      setSuccess("Arsip berhasil diperbarui.");
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
      await apiFetch(`/archives/${archiveId}`, { method: "DELETE" }, token);
      setSuccess("Arsip berhasil di-soft delete.");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Gagal menghapus arsip");
    }
  }

  async function fetchFileBlob(archiveId: string, fileId: string) {
    const token = localStorage.getItem("accessToken") || "";

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
      let msg = "Gagal mengambil file";
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {}
      throw new Error(msg);
    }

    return res.blob();
  }

  async function handleDownloadFile(
    archiveId: string,
    fileId: string,
    fileName: string
  ) {
    setError("");
    setSuccess("");

    try {
      const blob = await fetchFileBlob(archiveId, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("File berhasil didownload.");
    } catch (err: any) {
      setError(err.message || "Gagal download file");
    }
  }

  async function handlePreviewPdf(archiveId: string, file: any) {
    setError("");
    setSuccess("");

    if (file.mimeType !== "application/pdf") {
      setError("Preview hanya tersedia untuk PDF.");
      return;
    }

    try {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }

      const blob = await fetchFileBlob(archiveId, file.id);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewTitle(file.originalName);
    } catch (err: any) {
      setError(err.message || "Gagal preview PDF");
    }
  }

  function closePreview() {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPreviewTitle("");
  }

  function statusBadgeColor(status: string) {
    if (status === "ACTIVE") return "#dcfce7";
    if (status === "DRAFT") return "#fef9c3";
    if (status === "INACTIVE") return "#e0f2fe";
    if (status === "DESTROYED") return "#fee2e2";
    return "#e5e7eb";
  }

  function statusTextColor(status: string) {
    if (status === "ACTIVE") return "#166534";
    if (status === "DRAFT") return "#854d0e";
    if (status === "INACTIVE") return "#075985";
    if (status === "DESTROYED") return "#991b1b";
    return "#111827";
  }

  return (
    <div>
      <h1>Archives</h1>
      <p className="muted">Kelola arsip, metadata, file, dan dokumen digital.</p>

      <form onSubmit={handleCreateArchive} className="card" style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h3>Buat Arsip Baru</h3>
            <p className="muted">Lengkapi metadata arsip sebelum upload dokumen.</p>
          </div>
          <span className="badge">Create Archive</span>
        </div>

        <div className="grid-2" style={{ marginTop: 14 }}>
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
          <input
            placeholder="Keywords pisahkan dengan koma"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
          />

          <textarea
            placeholder="Ringkasan"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={4}
            style={{ gridColumn: "span 2" }}
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
        </div>

        <div style={{ marginTop: 16 }}>
          <button type="submit">Simpan Arsip</button>
        </div>
      </form>

      <div className="card" style={{ marginTop: 22 }}>
        <h3>Filter & Pencarian</h3>
        <div className="grid-4" style={{ marginTop: 12 }}>
          <input
            placeholder="Cari nomor arsip, judul, nomor surat, ringkasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="DESTROYED">DESTROYED</option>
          </select>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
          >
            <option value="">Semua Unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>

          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
          >
            <option value="">Semua Klasifikasi</option>
            {classifications.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      <div style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>Daftar Arsip</h3>
            <p className="muted">{filteredArchives.length} arsip ditemukan</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18, marginTop: 14 }}>
          {filteredArchives.map((archive) => (
            <div key={archive.id} className="archive-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 18,
                  alignItems: "flex-start"
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>
                      {archive.archiveNumber} — {archive.title}
                    </h3>
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                        background: statusBadgeColor(archive.status),
                        color: statusTextColor(archive.status)
                      }}
                    >
                      {archive.status}
                    </span>
                  </div>

                  <p className="muted" style={{ marginTop: 8 }}>
                    Unit: {archive.createdByUnit?.name || "-"} · Klasifikasi:{" "}
                    {archive.classification?.name || "-"} · File:{" "}
                    {archive.files?.length || 0}
                  </p>

                  <p style={{ margin: "12px 0 0" }}>
                    {archive.summary || "Tidak ada ringkasan."}
                  </p>
                </div>

                <div className="action-row" style={{ margin: 0 }}>
                  <button type="button" className="secondary-btn" onClick={() => startEdit(archive)}>
                    Edit
                  </button>
                  <button type="button" className="danger-btn" onClick={() => handleDeleteArchive(archive.id)}>
                    Delete
                  </button>
                  <Link
                    href={`/dashboard/archives/${archive.id}`}
                    style={{
                      background: "#111827",
                      color: "#fff",
                      textDecoration: "none",
                      padding: "11px 14px",
                      borderRadius: 12,
                      fontWeight: 800
                    }}
                  >
                    Detail
                  </Link>
                </div>
              </div>

              {editingArchiveId === archive.id ? (
                <div className="card" style={{ marginTop: 16, boxShadow: "none" }}>
                  <h3>Edit Arsip</h3>
                  <div className="grid-2">
                    <input
                      placeholder="Judul"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
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
                    <textarea
                      placeholder="Ringkasan"
                      rows={3}
                      value={editForm.summary}
                      onChange={(e) =>
                        setEditForm({ ...editForm, summary: e.target.value })
                      }
                      style={{ gridColumn: "span 2" }}
                    />
                    <input
                      placeholder="Keywords pisahkan dengan koma"
                      value={editForm.keywords}
                      onChange={(e) =>
                        setEditForm({ ...editForm, keywords: e.target.value })
                      }
                      style={{ gridColumn: "span 2" }}
                    />
                  </div>
                  <div className="action-row">
                    <button type="button" onClick={() => handleUpdateArchive(archive.id)}>
                      Simpan Edit
                    </button>
                    <button type="button" className="secondary-btn" onClick={cancelEdit}>
                      Batal
                    </button>
                  </div>
                </div>
              ) : null}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginTop: 16
                }}
              >
                <div
                  style={{
                    border: "1px dashed #cbd5e1",
                    borderRadius: 16,
                    padding: 16,
                    background: "rgba(248,250,252,.6)"
                  }}
                >
                  <strong>Upload File</strong>
                  <p className="muted" style={{ marginTop: 4 }}>
                    PDF, DOCX, XLSX sesuai validasi backend.
                  </p>
                  <input
                    type="file"
                    onChange={(e) =>
                      uploadFileToArchive(archive.id, e.target.files?.[0] || null)
                    }
                  />
                </div>

                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 16
                  }}
                >
                  <strong>File Arsip</strong>
                  {archive.files?.length ? (
                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                      {archive.files.map((file: any) => (
                        <div
                          key={file.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "center",
                            padding: 10,
                            borderRadius: 12,
                            background: "#f8fafc"
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800 }}>{file.originalName}</div>
                            <div className="muted">
                              {file.mimeType} · {file.sizeBytes} bytes
                            </div>
                          </div>
                          <div className="action-row" style={{ margin: 0 }}>
                            {file.mimeType === "application/pdf" ? (
                              <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => handlePreviewPdf(archive.id, file)}
                              >
                                Preview
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadFile(
                                  archive.id,
                                  file.id,
                                  file.originalName
                                )
                              }
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Belum ada file.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewUrl ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,.72)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 30
          }}
        >
          <div
            style={{
              width: "90vw",
              height: "88vh",
              background: "#fff",
              borderRadius: 18,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb"
              }}
            >
              <strong>{previewTitle}</strong>
              <button type="button" onClick={closePreview}>
                Tutup
              </button>
            </div>
            <iframe
              src={previewUrl}
              style={{
                flex: 1,
                width: "100%",
                border: 0
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
