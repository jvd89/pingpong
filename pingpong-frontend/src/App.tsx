import { useState, useEffect } from "react";
import axios from "axios";

const locations = [
  "Park Hannover (Auestraße 14)",
  "Pfarrlandplatz (Linden-Nord)",
  "Noltestraße / Liepmannstraße (Linden-Nord)",
  "Walter-Ballhause-Str. 12 (Linden-Mitte)",
  "Sackmannstraße 32 (Limmer)",
  "Haspelfelder Weg (Südstadt)",
  "Bertha-von-Suttner-Platz II (Südstadt)",
];

function App() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [availableTime, setAvailableTime] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState(locations[0]);
  const [notify, setNotify] = useState(false);

  const fetchPlayers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/players");
      setPlayers(res.data);
    } catch (err) {
      console.error("Błąd pobierania graczy:", err);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 60000); // co 60s
    return () => clearInterval(interval);
  }, []);

const handleJoin = async () => {
  if (!name.trim()) {
    alert("Podaj imię lub nick");
    return;
  }

  const player = {
    name,
    timestamp: new Date().toISOString(),
    availableUntil,
    availableTime,
    contact,
    location,
  };

  console.log("📤 Wysyłanie gracza:", player);

  try {
    const res = await axios.post("http://localhost:4000/players", player);
    console.log("✅ Gracz zapisany:", res.data);

    if (notify && contact) {
      const subRes = await axios.post("http://localhost:4000/subscribe", { contact });
      console.log("🔔 Subskrypcja zapisana:", subRes.data);
    }

    fetchPlayers(); // odśwież listę
    setName("");
    setAvailableUntil("");
    setAvailableTime("");
    setContact("");
  } catch (err) {
    console.error("❌ Błąd przy zapisie gracza:", err);
    alert("Wystąpił błąd. Sprawdź konsolę.");
  }
};
  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: "1rem" }}>
      <h1>Pingpong Spot</h1>

      <label>Lokalizacja:</label>
      <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: "100%" }}>
        {locations.map((loc) => (
          <option key={loc}>{loc}</option>
        ))}
      </select>

      <input
        placeholder="Imię / Nick"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <input
        placeholder="Dostępny do (np. 18:30)"
        value={availableUntil}
        onChange={(e) => setAvailableUntil(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <input
        placeholder="Preferowany czas (np. 17:00-18:00)"
        value={availableTime}
        onChange={(e) => setAvailableTime(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <input
        placeholder="Kontakt (np. WhatsApp, tel)"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
      <label style={{ display: "block", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
        />{" "}
        Powiadom mnie, gdy ktoś się zapisze
      </label>

      <button onClick={handleJoin} style={{ marginTop: 10, width: "100%" }}>
        Dołącz
      </button>

      <h2 style={{ marginTop: 20 }}>Zapisani gracze:</h2>
      {players.length === 0 ? (
        <p>Brak graczy</p>
      ) : (
        <ul>
          {players.map((p: any, i) => (
            <li key={i} style={{ borderBottom: "1px solid #ccc", marginBottom: 8 }}>
              <strong>{p.name}</strong> — {p.location} <br />
              🕓 {new Date(p.timestamp).toLocaleTimeString()}{" "}
              {p.availableUntil && ` | do: ${p.availableUntil}`}
              {p.availableTime && ` | czas: ${p.availableTime}`}
              {p.contact && <><br />📱 {p.contact}</>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
