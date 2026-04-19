const mongoose = require('mongoose');

const url = "mongodb+srv://zusammen:zusammen123@kartenlegendb.vg5sa6r.mongodb.net/zusammen-umzuege?appName=KartenlegenDB";

async function test() {
  console.log("🔍 Starte die finale Datenbank-Prüfung...\n");
  try {
    await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ ERFOLG! Verbindung hergestellt!`);
    await mongoose.disconnect();
  } catch (err) {
    console.log(`❌ FEHLGESCHLAGEN: ${err.message}`);
  }
}
test();
