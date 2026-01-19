import { useEffect, useState } from "react";
import api from "../services/api";
import QRCode from "react-qr-code";

function UserDashboard() {
  const [gatePasses, setGatePasses] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all gate passes of logged-in user
  async function fetchGatePasses() {
    try {
      const res = await api.get("/api/user/gate-passes");
      setGatePasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert("Failed to load gate passes");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Request new gate pass
  async function requestGatePass(e) {
    e.preventDefault();

    if (!purpose || !visitDate || !visitTime) {
      alert("Purpose, visit date and time are required");
      return;
    }

    try {
      await api.post("/api/user/gate-passes", {
        purpose,
        visitDate,
        visitTime,
        additionalDetails: details,
      });

      // Reset form
      setPurpose("");
      setVisitDate("");
      setVisitTime("");
      setDetails("");

      fetchGatePasses();
      alert("Gate pass request submitted");
    } catch (err) {
      alert(err.response?.data || "Request failed");
    }
  }

  useEffect(() => {
    fetchGatePasses();
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>
      <h2>User Dashboard</h2>
      <p>Request and track your gate passes</p>

      {/* 🔹 REQUEST FORM */}
      <div
        className="card"
        style={{
          padding: "20px",
          marginBottom: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ marginBottom: "15px" }}>Request New Gate Pass</h3>

        <form onSubmit={requestGatePass}>
          {/* PURPOSE */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold" }}>Purpose of Visit *</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Eg: Meeting, Event, Personal work"
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* DATE & TIME */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label style={{ fontWeight: "bold" }}>Visit Date *</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: "bold" }}>Visit Time *</label>
              <input
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          {/* ADDITIONAL DETAILS */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "bold" }}>
              Additional Details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any extra information for admin reference"
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />
            <small style={{ color: "#666" }}>
              This will help the admin during approval
            </small>
          </div>

          {/* SUBMIT */}
          <button
            className="primary"
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1976d2",
              color: "#fff",
              fontSize: "16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Submit Gate Pass Request
          </button>
        </form>
      </div>


      {/* 🔹 GATE PASS LIST */}
      <div className="card" style={{ marginTop: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>My Gate Passes</h3>

        {loading ? (
          <p>Loading...</p>
        ) : gatePasses.length === 0 ? (
          <p>No gate passes found</p>
        ) : (
          gatePasses.map((gp) => {
            const statusColor =
              gp.status === "APPROVED"
                ? "#2e7d32"
                : gp.status === "REJECTED"
                  ? "#c62828"
                  : "#ed6c02";

            return (
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
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>
                    {gp.purpose || "Gate Pass Request"}
                  </h4>

                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#fff",
                      backgroundColor: statusColor,
                    }}
                  >
                    {gp.status}
                  </span>
                </div>

                {/* DETAILS */}
                <p>
                  <strong>Visit:</strong>{" "}
                  {gp.visitDate} at {gp.visitTime}
                </p>

                <p>
                  <strong>Requested At:</strong>{" "}
                  {gp.createdAt
                    ? new Date(gp.createdAt).toLocaleString()
                    : "—"}
                </p>

                {/* 🔴 REJECTED */}
                {gp.status === "REJECTED" && (
                  <p style={{ color: "#c62828", marginTop: "8px" }}>
                    <strong>Rejection Reason:</strong>{" "}
                    {gp.rejectionReason || "Not specified"}
                  </p>
                )}

                {/* 🟡 PENDING */}
                {gp.status === "PENDING" && (
                  <p style={{ marginTop: "8px", color: "#ed6c02" }}>
                    ⏳ Waiting for admin approval
                  </p>
                )}

                {/* 🟢 APPROVED */}
                {gp.status === "APPROVED" && gp.qrData && (
                  <div style={{ marginTop: "15px" }}>
                    <p style={{ color: "#2e7d32", fontWeight: "bold" }}>
                      ✅ Approved – show this QR at gate
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "10px",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <QRCode value={gp.qrData} size={140} />

                      {/* 🔑 OTP SECTION */}
                      <div style={{ marginTop: "15px", textAlign: "center" }}>
                        {gp.currentOtp ? (
                          <div
                            style={{
                              backgroundColor: "#e8f5e9",
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #2e7d32",
                            }}
                          >
                            <span style={{ fontSize: "14px", color: "#2e7d32" }}>
                              Entry OTP:
                            </span>
                            <br />
                            <strong style={{ fontSize: "24px", letterSpacing: "4px" }}>
                              {gp.currentOtp}
                            </strong>
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                              Valid for 5 mins
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: "10px" }}>
                            <p style={{ fontSize: "13px", color: "#666", margin: "0 0 5px 0" }}>
                              Scan to generate OTP
                            </p>
                            <button
                              onClick={fetchGatePasses}
                              style={{
                                padding: "5px 10px",
                                fontSize: "12px",
                                cursor: "pointer",
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #ccc",
                                borderRadius: "4px"
                              }}
                            >
                              🔄 Refresh Status
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default UserDashboard;