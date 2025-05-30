import { useEffect, useState } from "react";
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
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [availableTime, setAvailableTime] = useState("");
  const [contact, setContact] = useState("");
  const [notifyMe, setNotifyMe] = useState(false);

  const fetchPlayers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/players");
      setPlayers(res.data);
    } catch (err) {
      console.error("Błąd podczas pobierania graczy:", err);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async () => {
    if (!name.trim()) return;
    const newPlayer = {
      name,
      timestamp: new Date().toISOString(),
      availableUntil,
      availableTime,
      contact,
      location: selectedLocation,
    };
    try {
      const res = await axios.post("http://localhost:4000/players", newPlayer);
      if (res.status !== 201) {
        console.error("Błąd podczas zapisywania gracza: Nieoczekiwany kod odpowiedzi", res.status);
        return;
      }
      if (notifyMe && contact) {
        const subRes = await axios.post("http://localhost:4000/subscribe", { contact });
        if (subRes.status !== 200 && subRes.status !== 201) {
          console.error("Błąd podczas zapisu do powiadomień: Nieoczekiwany kod odpowiedzi", subRes.status);
        }
      }
      fetchPlayers();
      setName("");
      setAvailableUntil("");
      setAvailableTime("");
      setContact("");
    } catch (err) {
      console.error("Błąd podczas zapisywania gracza:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Stoły do Ping Ponga</h1>
      <div className="mb-4">
        <label className="block text-sm mb-1 font-medium">Wybierz lokalizację (do zgłoszenia):</label>
        <select
          className="w-full p-2 rounded border"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 border rounded p-2 bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Wszyscy chętni do gry:</h2>
        {players.length === 0 ? (
          <p>Brak zapisanych graczy.</p>
        ) : (
          <ul className="space-y-2">
            {players.map((player, index) => (
              <li key={index} className="border-b pb-2">
                <div className="text-sm text-gray-700 font-semibold">
                  Imię / Nick: {player.name}
                </div>
                <div className="text-sm text-gray-500">
                  Lokalizacja: {player.location}
                </div>
                <div className="text-sm text-gray-500">
                  Zgłoszono o: {new Date(player.timestamp).toLocaleTimeString()}
                </div>
                {player.availableUntil && (
                  <div className="text-sm text-gray-600">
                    Dostępny do: {player.availableUntil}
                  </div>
                )}
                {player.availableTime && (
                  <div className="text-sm text-gray-600">
                    Preferowany czas: {player.availableTime}
                  </div>
                )}
                {player.contact && (
                  <div className="text-sm text-gray-600">
                    Kontakt: {player.contact}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-2">
        <input
          className="w-full border p-2 rounded"
          placeholder="Twoje imię / pseudonim"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Dostępny do (np. 18:30)"
          value={availableUntil}
          onChange={(e) => setAvailableUntil(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Chcę grać między (np. 17:00 - 18:00)"
          value={availableTime}
          onChange={(e) => setAvailableTime(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Dane kontaktowe (np. tel, WhatsApp)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          onClick={handleJoin}
        >
          Dołącz
        </button>
        <label className="flex items-center space-x-2 mt-2 text-sm">
          <input
            type="checkbox"
            checked={notifyMe}
            onChange={(e) => setNotifyMe(e.target.checked)}
          />
          <span>Powiadom mnie, gdy ktoś się zapisze</span>
        </label>
      </div>
    </div>
  );
}

export default App;
