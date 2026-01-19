import { useState, useEffect } from "react";
import api from "../services/api";
import AdminGatePassApproval from "./AdminGatePassApproval";

function AdminDashboard() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        totalVisitorsToday: 0,
        currentVisitorsInside: 0,
        totalPassesGenerated: 0,
        pendingApprovals: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            // DEBUG: Check what role we are actually sending
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log("DEBUG: Token Payload Role:", payload.role);
                } catch (e) {
                    console.error("DEBUG: Error parsing token", e);
                }
            }

            const [logsRes, statsRes] = await Promise.all([
                api.get("/api/admin/logs"),
                api.get("/api/admin/stats"),
            ]);
            setLogs(logsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    }

    function downloadCSV() {
        if (!logs.length) return;

        const headers = ["ID", "Visitor Name", "Action", "Time", "Gate Pass ID"];
        const csvContent = [
            headers.join(","),
            ...logs.map(log =>
                [
                    log.id,
                    log.gatePass?.user?.username || "Unknown",
                    log.action,
                    log.timestamp,
                    log.gatePass?.id
                ].join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    if (loading) return <div>Loading Dashboard...</div>;

    return (
        <div className="container" style={{ padding: "2rem" }}>
            <h1>📊 Admin Dashboard</h1>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <div className="card" style={{ textAlign: "center", background: "#f8f9fa", border: "1px solid #ddd" }}>
                    <h3>Today's Visitors</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0" }}>{stats.totalVisitorsToday}</p>
                </div>
                <div className="card" style={{ textAlign: "center", background: "#f8f9fa", border: "1px solid #ddd" }}>
                    <h3>Currently Inside</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0", color: "#28a745" }}>{stats.currentVisitorsInside}</p>
                </div>
                <div className="card" style={{ textAlign: "center", background: "#f8f9fa", border: "1px solid #ddd" }}>
                    <h3>Pending Approvals</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0", color: "#fd7e14" }}>{stats.pendingApprovals}</p>
                </div>
                <div className="card" style={{ textAlign: "center", background: "#f8f9fa", border: "1px solid #ddd" }}>
                    <h3>Total Passes</h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0" }}>{stats.totalPassesGenerated}</p>
                </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
                <AdminGatePassApproval onActionComplete={fetchData} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2>📜 Entry/Exit Logs</h2>
                <button onClick={downloadCSV} style={{ padding: "0.5rem 1rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    📥 Export to CSV
                </button>
            </div>

            {/* Logs Table */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                    <thead>
                        <tr style={{ background: "#f1f1f1", textAlign: "left" }}>
                            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>ID</th>
                            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Visitor</th>
                            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Action</th>
                            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Timestamp</th>
                            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px" }}>{log.id}</td>
                                <td style={{ padding: "10px" }}>{log.gatePass?.user?.username}</td>
                                <td style={{ padding: "10px" }}>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        background: log.action === "ENTRY" ? "#d4edda" : "#f8d7da",
                                        color: log.action === "ENTRY" ? "#155724" : "#721c24",
                                        fontWeight: "bold"
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ padding: "10px" }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{ padding: "10px" }}>{log.gatePass?.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
