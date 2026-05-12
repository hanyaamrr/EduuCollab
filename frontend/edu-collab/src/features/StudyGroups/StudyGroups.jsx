import { useState, useEffect } from "react";
import "./MyGroups.css";
 
const BASE_URL = "http://localhost:5000";
 
export default function MyGroups() {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
 
  const token  = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); 
 
  useEffect(() => {
    fetch(`${BASE_URL}/api/studygroup/MyGroups?userId=${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load groups");
        return res.json();
      })
      .then((data) => { setGroups(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);
 
  if (loading) return <div className="mg-loading">Loading...</div>;
  if (error)   return <div className="mg-error">{error}</div>;
 
  return (
    <div className="mg-wrapper">
 
      <div className="mg-header">
        <h2 className="mg-title">My Groups</h2>
        <span className="mg-count">{groups.length} groups</span>
      </div>
 
      {groups.length === 0 && (
        <div className="mg-empty">You have no active groups yet.</div>
      )}
 
      <div className="mg-grid">
        {groups.map((g) => (
          <div className="mg-card" key={g.id}>
 
            <div className="mg-card-top">
              <span className="mg-subject">{g.subject}</span>
              <span className="mg-type">{g.meetingType}</span>
            </div>
 
            <div className="mg-name">{g.name}</div>
 
            <div className="mg-session">
              <i className="ti ti-calendar" aria-hidden="true"></i>
              <span>Next: {g.meetingSchedule}</span>
            </div>
 
            <div className="mg-divider" />
 
            <div className="mg-members-row">
              <i className="ti ti-users" aria-hidden="true"></i>
              <span>{g.currentMembers} / {g.maxMembers} members</span>
            </div>
 
            <div className="mg-progress-label">
              <span>Members</span>
              <span className="mg-progress-pct">
                {Math.round((g.currentMembers / g.maxMembers) * 100)}%
              </span>
            </div>
            <div className="mg-progress-bar">
              <div
                className="mg-progress-fill"
                style={{ width: `${Math.round((g.currentMembers / g.maxMembers) * 100)}%` }}
              />
            </div>
 
          </div>
        ))}
      </div>
 
    </div>
  );
}