import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../services/api";

function GuardPage() {
  const [qrData, setQrData] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let scanner;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          setQrData(decodedText);
          setMessage("QR Scanned! Verifying...");
          verifyQr(decodedText);
          scanner.clear();
          setShowScanner(false);
        },
        (error) => {
          // ignore failures, they happen for every frame
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [showScanner]);

  async function verifyQr(data) {
    try {
      // Validate QR with backend immediately to check status/validity
      const res = await api.post("/api/guard/scan", null, {
        params: { qrData: data },
      });
      setMessage(res.data); // "QR VALID. OTP GENERATED." or error
    } catch (err) {
      console.error(err);
      setMessage("Invalid QR Code");
    }
  }

  async function handleAction(action) {
    try {
      const res = await api.post("/api/guard/verify", null, {
        params: { qrData, otp, action },
      });
      setMessage(res.data);
      // Clear state on success? Maybe keep it for reference.
      if (res.data && res.data.includes("LOGGED")) {
        setQrData("");
        setOtp("");
        // setTimeout(() => setMessage("Ready for next visitor"), 3000);
      }
    } catch (err) {
      setMessage("Verification Failed: " + (err.response?.data || err.message));
    }
  }

  return (
    <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>👮 Guard Terminal</h2>

      {/* Message Box */}
      {message && (
        <div style={{
          padding: "1rem",
          background: message.includes("VALID") || message.includes("LOGGED") ? "#d4edda" : "#f8d7da",
          color: message.includes("VALID") || message.includes("LOGGED") ? "#155724" : "#721c24",
          marginBottom: "1rem",
          borderRadius: "4px",
          textAlign: "center"
        }}>
          {message}
        </div>
      )}

      {/* Scanner Section */}
      {!showScanner && !qrData && (
        <button
          className="primary"
          style={{ width: "100%", padding: "1.5rem", fontSize: "1.2rem" }}
          onClick={() => {
            setMessage("");
            setShowScanner(true);
          }}
        >
          📸 Scan QR Code
        </button>
      )}

      {showScanner && (
        <div style={{ textAlign: "center" }}>
          <div id="reader" style={{ width: "100%" }}></div>
          <button
            style={{ marginTop: "1rem", background: "#666" }}
            onClick={() => setShowScanner(false)}
          >
            Cancel Scan
          </button>
        </div>
      )}

      {/* Manual Input Fallback */}
      {!showScanner && (
        <div style={{ marginTop: "2rem" }}>
          <details>
            <summary>Manual Entry</summary>
            <input
              placeholder="Enter QR Data manually"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              style={{ marginTop: "0.5rem" }}
            />
            <button onClick={() => verifyQr(qrData)}>Verify Code</button>
          </details>
        </div>
      )}

      {/* Action Section - Only shows after QR is scanned */}
      {qrData && !showScanner && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
          <p><strong>Scanned Pass:</strong> {qrData.substring(0, 15)}...</p>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              🔐 Ask Visitor for OTP:
            </label>
            <input
              type="tel" // optimized for mobile number pad
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                fontSize: "1.5rem",
                textAlign: "center",
                letterSpacing: "5px",
                padding: "0.5rem"
              }}
              maxLength={6}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
            <button
              style={{ background: "#28a745", padding: "1rem" }}
              onClick={() => handleAction("ENTRY")}
              disabled={otp.length !== 6}
            >
              ✅ ALLOW ENTRY
            </button>
            <button
              style={{ background: "#dc3545", padding: "1rem" }}
              onClick={() => handleAction("EXIT")}
              disabled={otp.length !== 6}
            >
              👋 LOG EXIT
            </button>
          </div>

          <button
            style={{ marginTop: "1rem", background: "transparent", color: "#666", textDecoration: "underline" }}
            onClick={() => {
              setQrData("");
              setOtp("");
              setMessage("");
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default GuardPage;