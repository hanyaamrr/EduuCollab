import { useState, useEffect } from "react";
import "./PendingRequests.css";
 
const BASE_URL = "http://localhost:3000";
 
export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
 
  const token = localStorage.getItem("token");
 
  useEffect(() => {
    fetch(`${BASE_URL}/api/studygroup/Requests/pending`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load pending requests");
        return res.json();
      })
      .then((data) => { setRequests(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);
 
  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/studygroup/Request/${id}?accept=true`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to accept");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
 
  const handleDecline = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/studygroup/Request/${id}?accept=false`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to decline");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
 
  if (loading) return <div className="pr-loading">Loading...</div>;
  if (error)   return <div className="pr-error">{error}</div>;
 
  return (
    <div className="pr-wrapper">
 
      <h2 className="pr-title">Pending Requests</h2>
 
      {requests.length === 0 && (
        <div className="pr-empty">No pending requests.</div>
      )}
 
      <div className="pr-list">
        {requests.map((req) => (
          <div className="pr-card" key={req.id}>
 
            <div className="pr-info">
              <div className="pr-name">{req.studentName}</div>
              <div className="pr-desc">
                wants to join <span className="pr-group-name">{req.groupName}</span>
              </div>
            </div>
 
            <div className="pr-actions">
              <button className="pr-btn-accept" onClick={() => handleAccept(req.id)}>
                Accept
              </button>
              <button className="pr-btn-decline" onClick={() => handleDecline(req.id)}>
                Decline
              </button>
            </div>
 
          </div>
        ))}
      </div>
 
    </div>
  );
}