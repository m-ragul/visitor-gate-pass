import { useEffect, useState } from "react";
import api from "../services/api";

function AdminGatePassApproval({ onActionComplete }) {
  const [pendingPasses, setPendingPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track which card is in reject mode
  const [rejectingId, setRejectingId] = useState(null);

  // Store rejection reasons per gate pass ID
  const [rejectionReasons, setRejectionReasons] = useState({});

  // Prevent double clicks
  const [processingId, setProcessingId] = useState(null);

  // 🔹 Fetch pending gate passes
  async function fetchPending() {
    try {
      const res = await api.get("/api/admin/gate-passes/pending");
      setPendingPasses(res.data || []);
    } catch (err) {
      alert("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Approve gate pass
  async function approveGatePass(id) {
    if (!window.confirm("Approve this gate pass?")) return;

    try {
      setProcessingId(id);
      await api.post(`/api/admin/gate-passes/${id}/approve`);
      fetchPending();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert("Approval failed");
    } finally {
      setProcessingId(null);
    }
  }

  // 🔹 Reject gate pass
  async function rejectGatePass(id) {
    const reason = rejectionReasons[id];

    if (!reason || !reason.trim()) {
      alert("Rejection reason is required");
      return;
    }

    try {
      setProcessingId(id);
      await api.post(`/api/admin/gate-passes/${id}/reject`, { reason });

      setRejectingId(null);
      setRejectionReasons({});
      fetchPending();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert("Rejection failed");
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "auto" }}>
      <h2>Pending Gate Pass Approvals</h2>
      <p>Review and approve/reject gate pass requests</p>

      {loading ? (
        <p>Loading...</p>
      ) : pendingPasses.length === 0 ? (
        <p>No pending requests 🎉</p>
      ) : (
        pendingPasses.map((gp) => (
          <div
            key={gp.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: "#fafafa",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: 0 }}>
                {gp.user?.username || "User"}
              </h4>

              <span
                style={{
                  backgroundColor: "#ed6c02",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                PENDING
              </span>
            </div>

            <hr />

            {/* DETAILS */}
            <p>
              <strong>Purpose:</strong> {gp.purpose || "—"}
            </p>

            <p>
              <strong>Visit:</strong>{" "}
              {gp.visitDate || "—"} at {gp.visitTime || "—"}
            </p>

            {gp.additionalDetails && (
              <p>
                <strong>Additional Details:</strong><br />
                {gp.additionalDetails}
              </p>
            )}

            <p>
              <strong>Requested At:</strong>{" "}
              {gp.createdAt
                ? new Date(gp.createdAt).toLocaleString()
                : "—"}
            </p>

            {/* ACTIONS */}
            <div style={{ marginTop: "15px" }}>
              <button
                disabled={processingId === gp.id}
                onClick={() => approveGatePass(gp.id)}
                style={{
                  backgroundColor: "#2e7d32",
                  color: "#fff",
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "4px",
                  marginRight: "10px",
                  cursor: "pointer",
                  opacity: processingId === gp.id ? 0.6 : 1,
                }}
              >
                Approve
              </button>

              <button
                disabled={processingId === gp.id}
                onClick={() => setRejectingId(gp.id)}
                style={{
                  backgroundColor: "#c62828",
                  color: "#fff",
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  opacity: processingId === gp.id ? 0.6 : 1,
                }}
              >
                Reject
              </button>
            </div>

            {/* REJECT INPUT */}
            {rejectingId === gp.id && (
              <div style={{ marginTop: "12px" }}>
                <textarea
                  placeholder="Enter rejection reason"
                  rows={3}
                  value={rejectionReasons[gp.id] || ""}
                  onChange={(e) =>
                    setRejectionReasons({
                      ...rejectionReasons,
                      [gp.id]: e.target.value,
                    })
                  }
                  style={{ width: "100%" }}
                />

                <br /><br />

                <button
                  disabled={processingId === gp.id}
                  onClick={() => rejectGatePass(gp.id)}
                  style={{
                    backgroundColor: "#c62828",
                    color: "#fff",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Confirm Reject
                </button>

                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReasons({});
                  }}
                  style={{
                    marginLeft: "10px",
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminGatePassApproval;