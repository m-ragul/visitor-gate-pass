import QRCode from "react-qr-code";

function GatePassStatusView({ gatePass }) {
  return (
    <div>
      <h3>Gate Pass Status</h3>

      <p><strong>Status:</strong> {gatePass.status}</p>

      {gatePass.status === "PENDING" && (
        <p>⏳ Waiting for admin approval</p>
      )}

      {gatePass.status === "REJECTED" && (
        <p style={{ color: "red" }}>
          ❌ Rejected: {gatePass.rejectionReason}
        </p>
      )}

      {gatePass.status === "APPROVED" && (
        <>
          <p>✅ Approved! Show this QR at the gate.</p>
          <div style={{ background: "white", padding: "10px", display: "inline-block" }}>
            <QRCode value={gatePass.qrData} size={200} />
          </div>
          {/* DEMO FEATURE: Show OTP so User can tell Guard */}
          {gatePass.currentOtp && (
            <div style={{ marginTop: "1rem", border: "2px dashed #007bff", padding: "0.5rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>🔐 OTP (Tell Guard):</p>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#007bff" }}>
                {gatePass.currentOtp}
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "red" }}>
                Expires: {new Date(gatePass.otpExpiry).toLocaleTimeString()}
              </p>
            </div>
          )}
        </>
      )}

      {gatePass.status === "COMPLETED" && (
        <p style={{ color: "blue" }}>
          🏁 Visit Completed.
        </p>
      )}

      {gatePass.status === "EXPIRED" && (
        <p style={{ color: "gray" }}>
          ⚠️ Pass Expired.
        </p>
      )}
    </div>
  );
}

export default GatePassStatusView;