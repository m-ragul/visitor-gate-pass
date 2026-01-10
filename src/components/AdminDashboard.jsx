import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");

  async function fetchLogs(type) {
    try {
      let url = "/api/admin/logs";

      if (type === "ENTRY" || type === "EXIT") {
        url = `/api/admin/logs/filter?action=${type}`;
      }

      const res = await api.get(url);
      setLogs(res.data);
      setFilter(type);
    } catch (err) {
      alert("Failed to load logs");
    }
  }

  useEffect(() => {
    fetchLogs("ALL");
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <button onClick={() => fetchLogs("ALL")}>All</button>
      <button onClick={() => fetchLogs("ENTRY")}>ENTRY</button>
      <button onClick={() => fetchLogs("EXIT")}>EXIT</button>

      <br /><br />

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Action</th>
            <th>Timestamp</th>
            <th>Gate Pass ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="4">No logs found</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.action}</td>
                <td>{log.timestamp}</td>
                <td>{log.gatePass?.id}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;