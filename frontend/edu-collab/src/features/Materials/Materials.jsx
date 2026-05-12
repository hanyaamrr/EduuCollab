import { useState, useEffect, useRef } from "react";
import "./GroupMaterials.css";
 
const BASE_URL = "http://localhost:5000";
 
const getIcon = (fileName) => {
  if (!fileName) return "ti-file";
  const ext = fileName.split(".").pop().toLowerCase();
  if (ext === "pdf")                     return "ti-file-type-pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "ti-file-spreadsheet";
  if (["mp4", "mov", "avi"].includes(ext)) return "ti-video";
  if (["jpg", "jpeg", "png"].includes(ext)) return "ti-photo";
  if (["docx", "doc"].includes(ext))    return "ti-file-word";
  if (["pptx", "ppt"].includes(ext))    return "ti-presentation";
  return "ti-file";
};
 
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};
 
export default function GroupMaterials({ groupId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tag, setTag]             = useState("");
  const fileRef                   = useRef();
 
  const token  = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
 
  const fetchMaterials = () => {
    fetch(`${BASE_URL}/api/material/group/${groupId}?userId=${userId}`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load materials");
        return res.json();
      })
      .then((data) => { setMaterials(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };
 
  useEffect(() => { fetchMaterials(); }, [groupId]);
 
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
 
    setUploading(true);
    const formData = new FormData();
    formData.append("File", file);
    formData.append("FileName", file.name);
    formData.append("StudyGroupId", groupId);
    formData.append("UserId", userId);
    formData.append("Tag", tag || "");
 
    try {
      const res = await fetch(`${BASE_URL}/api/material/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setTag("");
      fileRef.current.value = "";
      fetchMaterials(); // refresh list
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };
 

  const handleDownload = async (id, fileName) => {
    try {
      const res = await fetch(`${BASE_URL}/api/material/download/${id}?userId=${userId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
 
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/material/${id}?userId=${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
 
  if (loading) return <div className="gm-loading">Loading materials...</div>;
  if (error)   return <div className="gm-error">{error}</div>;
 
  return (
    <div className="gm-wrapper">
 
      <div className="gm-header">
        <div className="gm-header-left">
          <h2 className="gm-title">Group Materials</h2>
          <span className="gm-count">{materials.length}</span>
        </div>
 
        <label className="gm-upload-btn" title="Upload file">
          <i className="ti ti-plus" aria-hidden="true"></i>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.docx,.pptx"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </label>
      </div>
 
      <div className="gm-tag-row">
        <i className="ti ti-tag" aria-hidden="true"></i>
        <input
          className="gm-tag-input"
          placeholder="Tag before uploading e.g. #ExamPrep"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
      </div>

      {materials.length === 0 && (
        <div className="gm-empty">No materials uploaded yet.</div>
      )}
 
      <div className="gm-list">
        {materials.map((m) => (
          <div className="gm-row" key={m.id}>
            <i className={`ti ${getIcon(m.fileName)} gm-file-icon`} aria-hidden="true"></i>
            <div className="gm-info">
              <div className="gm-filename">{m.fileName}</div>
              <div className="gm-meta">
                {m.tag && <span className="gm-tag">{m.tag}</span>}
                <span>Added {timeAgo(m.uploadedAt)}</span>
              </div>
            </div>
            <div className="gm-actions">
              <button
                className="gm-icon-btn"
                title="Download"
                onClick={() => handleDownload(m.id, m.fileName)}
              >
                <i className="ti ti-download" aria-hidden="true"></i>
              </button>
              <button
                className="gm-icon-btn gm-delete-btn"
                title="Delete"
                onClick={() => handleDelete(m.id)}
              >
                <i className="ti ti-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
 
      {uploading && <div className="gm-uploading">Uploading...</div>}
 
    </div>
  );
}