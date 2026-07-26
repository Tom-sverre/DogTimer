import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { exportDb, importDb } from "../api";

export default function Settings() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleExport = () => {
    exportDb();
    showToast("Eksport startet – sjekk nedlastinger 📁");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!confirm(`Importer "${file.name}"? Dette vil erstatte gjeldende database. Sørg for å ha en sikkerhetskopi.`)) {
      fileRef.current.value = "";
      return;
    }
    setImporting(true);
    try {
      const result = await importDb(file);
      showToast(result.message || "Import fullført ✅");
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      showToast("Feil ved import: " + e.message);
    } finally {
      setImporting(false);
      fileRef.current.value = "";
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <button className="back-btn btn-secondary" onClick={() => navigate("/")}>← Tilbake</button>
        <h1>⚙️ Innstillinger</h1>
      </div>

      {/* Database section */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">💾 Database</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>Eksporter database</div>
          <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 12 }}>
            Last ned en kopi av all data som en .db fil. Bruk denne som sikkerhetskopi eller for å flytte til en annen enhet.
          </div>
          <button className="btn-primary" onClick={handleExport}>
            ⬇️ Eksporter database
          </button>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />

        <div>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>Importer database</div>
          <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 12 }}>
            Erstatt gjeldende database med en tidligere eksportert .db fil.{" "}
            <strong style={{ color: "var(--danger)" }}>All eksisterende data vil bli overskrevet!</strong>
          </div>
          <div style={{
            background: "var(--danger-bg)", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)",
            padding: "12px", fontSize: 13, marginBottom: 12, color: "#991b1b"
          }}>
            ⚠️ Pass på: Importer kun filer fra DogTime. Appen startes på nytt etter import.
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".db"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <button
            className="btn-danger"
            disabled={importing}
            onClick={() => fileRef.current.click()}
          >
            {importing ? "Importerer..." : "⬆️ Importer database"}
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">ℹ️ Om DogTime</div>
        <div style={{ fontSize: 14, color: "var(--text-sub)", lineHeight: 1.8 }}>
          <div>🐾 <strong>DogTime</strong> – Søvn- og aktivitetssporing for hunder</div>
          <div>📦 Versjon 1.0.0</div>
          <div>🗄️ Database: SQLite</div>
          <div>🐋 Kjører i Docker</div>
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{ background: "var(--sleep-bg)", border: "1px solid #c7d2fe" }}>
        <div className="card-title" style={{ color: "var(--sleep)" }}>💡 Hurtigtips</div>
        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 2 }}>
          <div>🔁 Timer kjører i bakgrunnen selv om du navigerer til andre sider</div>
          <div>📅 Legg til veterinærtimer i iPhone-kalenderen via "Legg til kalender"-knappen</div>
          <div>✏️ Du kan redigere og legge til historiske økt- og måltidstider manuelt</div>
          <div>🐕 Støtter flere hunder – bytt mellom dem på hovedsiden</div>
          <div>⬇️ Ta regelmessige sikkerhetskopier av databasen via Eksporter</div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
