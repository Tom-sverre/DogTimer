import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { exportDb } from "../api";

export default function Settings() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null); // null | "uploading" | "success" | "error"
  const [importMsg, setImportMsg] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

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

    setImportStatus("uploading");
    setImportMsg(`Laster opp "${file.name}" (${(file.size / 1024).toFixed(1)} KB)…`);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/settings/import-db", { method: "POST", body: form });
      const result = await res.json();

      if (!res.ok) {
        // FastAPI returnerer { detail: "..." } ved feil
        throw new Error(result.detail || `Serverfeil ${res.status}`);
      }

      if (!result.ok) {
        throw new Error(result.message || "Ukjent feil fra server");
      }

      setImportStatus("success");
      setImportMsg(result.message || "Import fullført!");
    } catch (err) {
      setImportStatus("error");
      setImportMsg(err.message || "Ukjent feil");
    } finally {
      fileRef.current.value = "";
    }
  };

  const statusBox = () => {
    if (!importStatus) return null;

    const styles = {
      uploading: { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", icon: "⏳" },
      success:   { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", icon: "✅" },
      error:     { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", icon: "❌" },
    }[importStatus];

    return (
      <div style={{
        marginTop: 14,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: "var(--radius-sm)",
        padding: "14px 16px",
        fontSize: 13,
        color: styles.color,
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          {styles.icon} {importStatus === "uploading" ? "Importerer…" : importStatus === "success" ? "Import fullført" : "Import feilet"}
        </div>
        <div>{importMsg}</div>
        {importStatus === "success" && (
          <button
            className="btn-primary"
            style={{ marginTop: 12, fontSize: 13 }}
            onClick={() => window.location.reload()}
          >
            🔄 Last inn siden på nytt
          </button>
        )}
        {importStatus === "error" && (
          <button
            className="btn-secondary"
            style={{ marginTop: 10, fontSize: 13 }}
            onClick={() => setImportStatus(null)}
          >
            Lukk
          </button>
        )}
      </div>
    );
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
            ⚠️ Importer kun .db-filer eksportert fra DogTime. Last inn siden etter import for å se de nye dataene.
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
            disabled={importStatus === "uploading"}
            onClick={() => { setImportStatus(null); fileRef.current.click(); }}
          >
            {importStatus === "uploading" ? "⏳ Importerer…" : "⬆️ Importer database"}
          </button>

          {statusBox()}
        </div>
      </div>

      {/* App info */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">ℹ️ Om DogTime</div>
        <div style={{ fontSize: 14, color: "var(--text-sub)", lineHeight: 1.8 }}>
          <div>🐾 <strong>DogTime</strong> – Søvn- og aktivitetssporing for hunder</div>
          <div>📦 Versjon 2.2.1</div>
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
