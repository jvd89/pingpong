const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4000;

let players = [];
let subscribers = [];

app.use(cors());
app.use(bodyParser.json());

app.get("/players", (req, res) => {
  res.json(players);
});

app.post("/players", (req, res) => {
  const player = req.body;
  players.push(player);
  console.log("Nowy gracz:", player);

  // Symulowane powiadomienia
  subscribers.forEach((s) => {
    console.log(`🔔 Powiadomienie dla: ${s.contact}`);
  });

  res.status(201).json({ message: "Gracz dodany" });
});

app.post("/subscribe", (req, res) => {
  const sub = req.body;
  if (sub.contact && !subscribers.some(s => s.contact === sub.contact)) {
    subscribers.push(sub);
    console.log("Nowy subskrybent:", sub);
  }
  res.status(201).json({ message: "Zapisano do powiadomień" });
});
// Usuwanie graczy starszych niż 2 godziny (co 5 minut)
setInterval(() => {
  const teraz = Date.now();
  const przed = players.length;
  players = players.filter(player => {
    const czasZgloszenia = new Date(player.timestamp).getTime();
    return (teraz - czasZgloszenia) < 2 * 60 * 60 * 1000; // 2h
  });
  const po = players.length;
  if (po < przed) {
    console.log(`🧹 Usunięto ${przed - po} nieaktywnych graczy.`);
  }
}, 5 * 60 * 1000); // Co 5 minut

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
