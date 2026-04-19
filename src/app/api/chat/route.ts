import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Keine Nachrichten" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDDmjoqAajlzQat20O0QHgm7hiT-nN02aY";

    // System instruction embedded in the prompt to ensure behavior across all versions
    const systemPrompt = `Du bist ein PRÄZISER Sales-Profi für die Firma 'Zusammen Umzüge'. 
DEINE MISSIONSREGELN:
1. SPRACHE: Immer Deutsch.
2. STIL: Extrem kurz (max 1-2 Sätze), knackig und verkaufsorientiert. Schreibgeschwindigkeit ist wichtig, also keine langen Texte!
3. USP (VERKAUFSARGUMENT): Wenn der Kunde nach Kartons, Verpackung oder Organisation fragt, erwähne smart in EINEM Satz: "Wir bieten Kartons (Kauf/Miete) und nutzen unser intelligentes Farbsystem mit speziellen Zimmer-Icons. So garantieren wir einen perfekt organisierten Umzug ohne Kopfschmerzen für Sie." (Nicht aufdringlich, nur bei passender Gelegenheit).
4. DATEN-SAMMLUNG: Der deutsche Markt schätzt Effizienz und Höflichkeit. Frage charmant, aber GANZHEITLICH nach den benötigten Daten. Wenn Daten (Name, Telefon, Von, Nach) fehlen, frage nach allen fehlenden Infos auf einmal. WICHTIG: Verlange KEINE genauen Straßen! Stadt oder Bezirk reicht völlig. Z.B.: "Um Ihnen ein maßgeschneidertes Angebot zu erstellen, darf ich Sie kurz um Ihren Namen, Ihre Handynummer sowie die Start- und Zielstadt (oder Stadtteil) bitten?"
5. ABSCHLUSS: Sobald du alle Daten gesammelt hast, schließe das Gespräch hochprofessionell ab. Sage sinngemäß: "Vielen Dank! Ich habe Ihre Daten an unser Planungsteam weitergeleitet. Wir rufen Sie schnellstmöglich mit einem ersten Angebot an. Wenn es besonders dringend ist, können Sie uns auch sofort über den WhatsApp-Button kontaktieren." (Stelle danach KEINE weiteren Fragen mehr).
6. LEAD-EXTRAKTION: Sobald der User Daten nennt (Name, Telefon, Von, Nach), füge AM ENDE deiner Antwort diesen Tag ein: [LEAD_DATA: Name=..., Phone=..., From=..., To=...]
   (Fülle nur aus, was du sicher weißt, sonst benutze '...')

User-Nachricht: `;

    const lastUserMessage = messages[messages.length - 1].content;

    // Formatting history for Gemini
    const history = messages.slice(0, -1)
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }))
      .filter((m: any, index: number, array: any[]) => {
        const firstUserIndex = array.findIndex(msg => msg.role === 'user');
        return firstUserIndex !== -1 && index >= firstUserIndex;
      });

    // Updated to Gemini 2.5 Flash with separate system_instruction
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          ...history,
          {
            role: "user",
            parts: [{ text: lastUserMessage }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Unknown API Error");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Keine Antwort von der KI erhalten");
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("REST API ERROR:", error.message);
    return NextResponse.json({
      error: "Verbindung fehlgeschlagen",
      details: error.message
    }, { status: 500 });
  }
}
