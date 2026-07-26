const BASE = "/api";

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Feil ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Dogs
export const getDogs = () => req("/dogs");
export const getDog = (id) => req(`/dogs/${id}`);
export const createDog = (data) => req("/dogs", { method: "POST", body: JSON.stringify(data) });
export const updateDog = (id, data) => req(`/dogs/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDog = (id) => req(`/dogs/${id}`, { method: "DELETE" });

// Sleep sessions
export const getSessions = (dogId) => req(`/dogs/${dogId}/sessions`);
export const createSession = (dogId, data) => req(`/dogs/${dogId}/sessions`, { method: "POST", body: JSON.stringify(data) });
export const updateSession = (dogId, id, data) => req(`/dogs/${dogId}/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSession = (dogId, id) => req(`/dogs/${dogId}/sessions/${id}`, { method: "DELETE" });

// Timer
export const getActiveTimer = (dogId) => req(`/dogs/${dogId}/active-timer`);
export const startTimer = (dogId, session_type) => req(`/dogs/${dogId}/timer/start`, { method: "POST", body: JSON.stringify({ session_type }) });
export const stopTimer = (dogId) => req(`/dogs/${dogId}/timer/stop`, { method: "POST" });

// Feedings
export const getFeedings = (dogId) => req(`/dogs/${dogId}/feedings`);
export const createFeeding = (dogId, data) => req(`/dogs/${dogId}/feedings`, { method: "POST", body: JSON.stringify(data) });
export const updateFeeding = (dogId, id, data) => req(`/dogs/${dogId}/feedings/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteFeeding = (dogId, id) => req(`/dogs/${dogId}/feedings/${id}`, { method: "DELETE" });

// Vet
export const getVetAppts = (dogId) => req(`/dogs/${dogId}/vet`);
export const createVetAppt = (dogId, data) => req(`/dogs/${dogId}/vet`, { method: "POST", body: JSON.stringify(data) });
export const updateVetAppt = (dogId, id, data) => req(`/dogs/${dogId}/vet/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVetAppt = (dogId, id) => req(`/dogs/${dogId}/vet/${id}`, { method: "DELETE" });
export const exportVetIcal = (dogId) => `/api/dogs/${dogId}/vet/export/ical`;
export const exportSingleVetIcal = (dogId, apptId) => `/api/dogs/${dogId}/vet/${apptId}/ical`;

// Settings
export const exportDb = () => window.open("/api/settings/export-db", "_blank");
export const importDb = (file) => {
  const form = new FormData();
  form.append("file", file);
  return fetch("/api/settings/import-db", { method: "POST", body: form }).then(r => r.json());
};
