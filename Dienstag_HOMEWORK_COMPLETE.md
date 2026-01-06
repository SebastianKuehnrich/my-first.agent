# 🏠 HAUSAUFGABE — Dienstag, Woche 1

## Dein erster Deep Agent — Komplett von Null

---

## ⏰ Abgabe

**Deadline:** Mittwoch, 09:00 Uhr

**Was ihr abgebt:**
- GitHub Repo Link
- Screenshot vom erfolgreichen Test-Run

---

## 🎯 Was ihr baut

Ein kompletter AI Agent der:
- Tools mit Zod Schemas hat
- Das LLM aufruft (OpenAI API)
- Tool Calls erkennt und ausführt
- Multi-Step Anfragen handelt
- Sauber loggt was passiert

**Ihr baut das KOMPLETT NEU** — nicht das Klassenprojekt kopieren. Ihr sollt es selbst tippen und verstehen.

---

# 🚀 TEIL 1: SETUP

---

## Schritt 1.1: Neues Projekt erstellen

Öffnet euer Terminal. Wir starten komplett fresh.

```bash
mkdir mein-erster-agent
```

```bash
cd mein-erster-agent
```

```bash
bun init -y
```

Ihr solltet diese Ausgabe sehen:

```
Done! A package.json file was saved in the current directory.
```

---

## Schritt 1.2: Dependencies installieren

Wir brauchen zwei Packages:

```bash
bun add openai zod
```

**Was sind die?**
- `openai` — Die offizielle OpenAI Library für API Calls
- `zod` — Schema Validation für unsere Tool Parameter

---

## Schritt 1.3: Dateien erstellen

```bash
touch tools.ts agent.ts main.ts .env
```

Ihr habt jetzt:

```
mein-erster-agent/
├── package.json
├── tools.ts      ← Tool Definitionen
├── agent.ts      ← Der Agent Loop
├── main.ts       ← Tests
└── .env          ← API Key (GEHEIM!)
```

---

## Schritt 1.4: API Key einrichten

Öffnet `.env` und fügt euren Key ein:

```
OPENAI_API_KEY=sk-proj-euer-key-hier
```

⚠️ **WICHTIG:** Diese Datei NIEMALS committen! Fügt sie zu `.gitignore` hinzu:

```bash
echo ".env" >> .gitignore
```

---

## ✅ Checkpoint 1

Führt aus:

```bash
ls -la
```

Ihr solltet sehen:
- `.env`
- `.gitignore`
- `package.json`
- `tools.ts`
- `agent.ts`
- `main.ts`

**Alles da? Weiter!**

---

# 📦 TEIL 2: TOOLS

---

Öffnet `tools.ts` in eurem Editor.

---

## Schritt 2.1: Imports und Interface

```typescript
import { z } from "zod";

export interface Tool {
    name: string;
    description: string;
    schema: z.ZodObject<any>;
    execute: (params: any) => Promise<any>;
}
```

**Was bedeutet das?**

Jedes Tool hat 4 Eigenschaften:
- `name` — Wie das LLM das Tool aufruft
- `description` — Was das LLM sieht (WICHTIG: Gute Descriptions = bessere Tool Calls)
- `schema` — Zod Schema für die Parameter
- `execute` — Die Funktion die wirklich was macht

---

## Schritt 2.2: Calculator Tool

```typescript
export const calculatorTool: Tool = {
    name: "calculator",
    description: "Berechnet mathematische Ausdrücke. Nutze dieses Tool für jede Art von Rechnung wie Addition, Subtraktion, Multiplikation, Division.",
    schema: z.object({
        expression: z.string().describe("Der mathematische Ausdruck, z.B. '15 * 4' oder '(10 + 5) / 3'")
    }),
    execute: async (params) => {
        const validated = calculatorTool.schema.parse(params);
        try {
            const result = Function(`"use strict"; return (${validated.expression})`)();
            return { success: true, result: result };
        } catch (error) {
            return { success: false, error: "Konnte Ausdruck nicht berechnen" };
        }
    }
};
```

**Wichtige Details:**

1. `schema.parse(params)` — Validiert die Parameter mit Zod. Wenn falsch, fliegt ein Error.
2. `Function(...)` — Führt den mathematischen Ausdruck aus. Sicherer als `eval`.
3. Return Format `{ success: true/false, ... }` — Einheitlich für alle Tools.

---

## Schritt 2.3: Time Tool

```typescript
export const timeTool: Tool = {
    name: "current_time",
    description: "Gibt die aktuelle Uhrzeit und das Datum zurück. Nutze dieses Tool wenn jemand nach der Zeit oder dem Datum fragt.",
    schema: z.object({}),
    execute: async () => {
        const now = new Date();
        return {
            success: true,
            time: now.toLocaleTimeString("de-DE"),
            date: now.toLocaleDateString("de-DE"),
            timestamp: now.toISOString()
        };
    }
};
```

**Beachte:** Leeres Schema `z.object({})` — dieses Tool braucht keine Parameter.

---

## Schritt 2.4: Dice Tool

```typescript
export const diceTool: Tool = {
    name: "roll_dice",
    description: "Würfelt einen oder mehrere Würfel. Standardmäßig ein 6-seitiger Würfel.",
    schema: z.object({
        sides: z.number().min(2).max(100).default(6).describe("Anzahl der Seiten pro Würfel"),
        count: z.number().min(1).max(10).default(1).describe("Anzahl der Würfel")
    }),
    execute: async (params) => {
        const validated = diceTool.schema.parse(params);
        const rolls: number[] = [];

        for (let i = 0; i < validated.count; i++) {
            rolls.push(Math.floor(Math.random() * validated.sides) + 1);
        }

        return {
            success: true,
            rolls: rolls,
            total: rolls.reduce((a, b) => a + b, 0)
        };
    }
};
```

**Neu hier:**
- `.default(6)` — Wenn das LLM keinen Wert schickt, nehmen wir 6
- `.min(2).max(100)` — Validation: Mindestens 2 Seiten, maximal 100

---

## Schritt 2.5: Exports

```typescript
export const allTools: Tool[] = [calculatorTool, timeTool, diceTool];

export function getToolByName(name: string): Tool | undefined {
    return allTools.find(tool => tool.name === name);
}

export function getToolDescriptions(): string {
    return allTools.map(tool => `- ${tool.name}: ${tool.description}`).join("\n");
}
```

**Diese Helper brauchen wir im Agent:**
- `allTools` — Array mit allen Tools
- `getToolByName` — Findet ein Tool nach Namen
- `getToolDescriptions` — Generiert die Liste für den System Prompt

---

## ✅ Checkpoint 2

Testet ob tools.ts funktioniert:

```bash
bun -e "import { getToolDescriptions } from './tools.ts'; console.log(getToolDescriptions())"
```

Ihr solltet sehen:

```
- calculator: Berechnet mathematische Ausdrücke...
- current_time: Gibt die aktuelle Uhrzeit...
- roll_dice: Würfelt einen oder mehrere Würfel...
```

**Funktioniert? Weiter!**

---

# 🤖 TEIL 3: AGENT

---

Öffnet `agent.ts` in eurem Editor.

---

## Schritt 3.1: Imports und Setup

```typescript
import OpenAI from "openai";
import { allTools, getToolByName, getToolDescriptions } from "./tools";

const openai = new OpenAI();
```

Der OpenAI Client liest automatisch `OPENAI_API_KEY` aus der `.env` Datei.

---

## Schritt 3.2: System Prompt

```typescript
const SYSTEM_PROMPT = `Du bist ein hilfreicher Assistent mit Zugriff auf Tools.

VERFÜGBARE TOOLS:
${getToolDescriptions()}

WICHTIGE REGELN:
1. Wenn du ein Tool nutzen willst, antworte NUR mit einem JSON-Objekt:
   {"tool": "tool_name", "params": {...}}
2. Antworte mit EINEM Tool-Aufruf pro Nachricht
3. Wenn du alle Informationen hast, antworte normal OHNE JSON
4. Antworte immer auf Deutsch

BEISPIEL:
User: "Was ist 5 mal 5?"
Du: {"tool": "calculator", "params": {"expression": "5 * 5"}}`;
```

**Das ist Faktor #2: Own Your Prompts.**

Ihr kontrolliert exakt was das LLM sieht. Keine Framework-Magie.

---

## Schritt 3.3: Tool Call Parser

```typescript
function parseToolCall(content: string): { tool: string; params: any } | null {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
        const parsed = JSON.parse(match[0]);
        if (parsed.tool && typeof parsed.tool === "string") {
            return { tool: parsed.tool, params: parsed.params || {} };
        }
        return null;
    } catch {
        return null;
    }
}
```

**Was macht das?**

1. `content.match(/\{[\s\S]*\}/)` — Sucht nach JSON im Text (alles zwischen `{` und `}`)
2. `JSON.parse()` — Parsed das JSON
3. Prüft ob `tool` vorhanden ist
4. Returned das Tool Call Object oder `null`

---

## Schritt 3.4: Tool Executor

```typescript
async function executeTool(toolName: string, params: any): Promise<any> {
    const tool = getToolByName(toolName);

    if (!tool) {
        return { success: false, error: `Tool "${toolName}" existiert nicht` };
    }

    try {
        const result = await tool.execute(params);
        return result;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unbekannter Fehler"
        };
    }
}
```

**Error Handling ist wichtig:**
- Tool nicht gefunden? Kein Crash, sondern Fehlermeldung.
- Tool wirft Error? Fangen und weitermachen.

---

## Schritt 3.5: Der Agent Loop

```typescript
export async function runAgent(userInput: string): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 10;

    console.log("\n" + "=".repeat(50));
    console.log(`🚀 AGENT STARTET`);
    console.log(`📝 Input: "${userInput}"`);
    console.log("=".repeat(50));

    while (iterations < MAX_ITERATIONS) {
        iterations++;
        console.log(`\n--- Iteration ${iterations} ---`);

        // LLM aufrufen
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.7
        });

        const content = response.choices[0].message.content || "";
        console.log(`🤖 LLM: ${content.substring(0, 80)}${content.length > 80 ? "..." : ""}`);

        // Tool Call prüfen
        const toolCall = parseToolCall(content);

        if (toolCall) {
            console.log(`🔧 Tool Call: ${toolCall.tool}`);
            console.log(`   Params: ${JSON.stringify(toolCall.params)}`);

            // Tool ausführen
            const result = await executeTool(toolCall.tool, toolCall.params);
            console.log(`📤 Result: ${JSON.stringify(result)}`);

            // Messages updaten
            messages.push({ role: "assistant", content: content });
            messages.push({ role: "user", content: `Tool Result: ${JSON.stringify(result)}` });

        } else {
            // Kein Tool Call = Finale Antwort
            console.log("\n" + "=".repeat(50));
            console.log(`✅ FINALE ANTWORT`);
            console.log("=".repeat(50));
            console.log(content);
            console.log("=".repeat(50));
            console.log(`📊 Iterationen: ${iterations}`);

            return content;
        }
    }

    console.log("⚠️ MAX_ITERATIONS erreicht!");
    return "Konnte Anfrage nicht beantworten.";
}
```

**Der Kern des Agents:**

1. Initialisiere Messages mit System Prompt + User Input
2. Loop: LLM aufrufen → Output prüfen
3. Wenn Tool Call: Tool ausführen, Result zu Messages, weiter loopen
4. Wenn kein Tool Call: Das ist die finale Antwort, fertig
5. Safety: MAX_ITERATIONS verhindert Endlos-Loops

---

## ✅ Checkpoint 3

Testet ob agent.ts kompiliert:

```bash
bun -e "import { runAgent } from './agent.ts'; console.log('Agent loaded!')"
```

Ihr solltet sehen:

```
Agent loaded!
```

**Keine Errors? Weiter!**

---

# 🧪 TEIL 4: TESTS

---

Öffnet `main.ts` in eurem Editor.

---

## Schritt 4.1: Test Suite

```typescript
import { runAgent } from "./agent";

async function runTests() {
    console.log("\n\n" + "█".repeat(60));
    console.log("█  TEST SUITE — MEIN ERSTER AGENT");
    console.log("█".repeat(60));

    // Test 1: Calculator
    console.log("\n\n📋 TEST 1: Einfache Rechnung");
    console.log("-".repeat(40));
    await runAgent("Was ist 25 mal 17?");

    // Test 2: Time
    console.log("\n\n📋 TEST 2: Aktuelle Zeit");
    console.log("-".repeat(40));
    await runAgent("Wie spät ist es gerade?");

    // Test 3: Dice
    console.log("\n\n📋 TEST 3: Würfeln");
    console.log("-".repeat(40));
    await runAgent("Würfel 3 Würfel mit 20 Seiten");

    // Test 4: Multi-Step
    console.log("\n\n📋 TEST 4: Multi-Step (2 Tool Calls)");
    console.log("-".repeat(40));
    await runAgent("Würfel einen Würfel und multipliziere das Ergebnis mit 7");

    console.log("\n\n" + "█".repeat(60));
    console.log("█  ALLE TESTS ABGESCHLOSSEN");
    console.log("█".repeat(60) + "\n");
}

runTests().catch(console.error);
```

---

# ▶️ TEIL 5: RUN & DEBUG

---

## Schritt 5.1: Ausführen

```bash
bun run main.ts
```

---

## Schritt 5.2: Expected Output

Ihr solltet sowas sehen:

```
██████████████████████████████████████████████████████████████
█  TEST SUITE — MEIN ERSTER AGENT
██████████████████████████████████████████████████████████████


📋 TEST 1: Einfache Rechnung
----------------------------------------

==================================================
🚀 AGENT STARTET
📝 Input: "Was ist 25 mal 17?"
==================================================

--- Iteration 1 ---
🤖 LLM: {"tool": "calculator", "params": {"expression": "25 * 17"}}
🔧 Tool Call: calculator
   Params: {"expression":"25 * 17"}
📤 Result: {"success":true,"result":425}

--- Iteration 2 ---
🤖 LLM: 25 mal 17 ergibt 425.

==================================================
✅ FINALE ANTWORT
==================================================
25 mal 17 ergibt 425.
==================================================
📊 Iterationen: 2
```

---

## Schritt 5.3: Häufige Fehler

<details>
<summary>❌ Error: "OpenAI API key not found"</summary>

**Problem:** Die `.env` Datei wird nicht gelesen.

**Lösung:**
```bash
# Prüfe ob .env existiert
cat .env

# Muss enthalten:
OPENAI_API_KEY=sk-proj-...
```

</details>

<details>
<summary>❌ Error: "Cannot find module './tools'"</summary>

**Problem:** Import-Pfad falsch.

**Lösung:** Prüft dass alle Dateien im gleichen Ordner sind:
```bash
ls *.ts
# Sollte zeigen: agent.ts  main.ts  tools.ts
```

</details>

<details>
<summary>❌ Error: "429 Too Many Requests"</summary>

**Problem:** Rate Limit erreicht.

**Lösung:** Wartet 1 Minute und versucht nochmal. Oder: Fügt ein delay zwischen Tests ein:
```typescript
await new Promise(r => setTimeout(r, 1000)); // 1 Sekunde warten
```

</details>

<details>
<summary>❌ Agent antwortet ohne Tool zu nutzen</summary>

**Problem:** System Prompt nicht klar genug.

**Lösung:** Prüft dass der SYSTEM_PROMPT die Regeln klar definiert. Das LLM muss verstehen WANN es Tools nutzen soll.

</details>

<details>
<summary>❌ JSON Parse Error</summary>

**Problem:** LLM gibt kein valides JSON zurück.

**Lösung:** Das ist normal — manchmal schreibt das LLM Text um das JSON. Unser `parseToolCall` handled das mit der Regex. Wenn es trotzdem nicht funktioniert, macht den System Prompt strenger.

</details>

---

## ✅ Checkpoint 4

Alle 4 Tests laufen durch?

- [ ] Test 1: Calculator gibt richtiges Ergebnis
- [ ] Test 2: Time zeigt aktuelle Zeit
- [ ] Test 3: Dice würfelt 3 Würfel mit 20 Seiten
- [ ] Test 4: Multi-Step macht 2 Iterationen (Würfeln + Rechnen)

**Alles grün? Weiter zu den Side Missions!**

---

# 🔍 SIDE MISSIONS

**Diese sind optional aber geben Bonus-Punkte.**

Wählt mindestens eine. Jede gibt 10 Punkte.

---

## 🔍 Mission A: Token Counter (10 Punkte)

**Aufgabe:** Logge nach jedem API Call wie viele Tokens verwendet wurden.

**Hint:** Die OpenAI Response hat ein `usage` Objekt:

```typescript
const response = await openai.chat.completions.create({...});

console.log(`📈 Tokens: ${response.usage?.prompt_tokens} input, ${response.usage?.completion_tokens} output`);
```

**Bonus:** Zeige am Ende die TOTALEN Tokens für alle Iterationen.

---

## 🔍 Mission B: Conversation Logger (10 Punkte)

**Aufgabe:** Speichere alle Messages in eine JSON Datei nach jedem Run.

**Hint:** Bun hat eingebaute File-Funktionen:

```typescript
import { write } from "bun";

// Am Ende von runAgent:
await write("conversation.json", JSON.stringify(messages, null, 2));
```

**Bonus:** Speichere mit Timestamp im Dateinamen: `conversation_2025-01-06_14-30.json`

---

## 🔍 Mission C: Eigenes Tool (10 Punkte)

**Aufgabe:** Baut ein viertes Tool das etwas Nützliches macht.

**Ideen:**
- `random_fact` — Gibt einen zufälligen Fakt zurück (aus einer Liste)
- `coin_flip` — Münzwurf (Kopf oder Zahl)
- `word_count` — Zählt Wörter in einem Text
- `reverse_text` — Dreht einen Text um

**Anforderungen:**
- Muss `name`, `description`, `schema`, `execute` haben
- Muss in `allTools` Array sein
- Muss einen Test in main.ts haben

---

## 🔍 Mission D: Error Recovery (10 Punkte)

**Aufgabe:** Wenn ein Tool crasht, soll der Agent es nochmal versuchen.

**Hint:** Wrapped den Tool Call in einen Retry-Loop:

```typescript
let attempts = 0;
const MAX_ATTEMPTS = 3;

while (attempts < MAX_ATTEMPTS) {
    attempts++;
    const result = await executeTool(toolCall.tool, toolCall.params);

    if (result.success) {
        return result;
    }

    console.log(`⚠️ Attempt ${attempts} failed, retrying...`);
}
```

---

## 🔍 Mission E: Model Comparison (10 Punkte)

**Aufgabe:** Testet verschiedene Models und vergleicht die Ergebnisse.

**Macht eine Tabelle:**

| Model | Speed | Quality | Tokens | Cost |
|-------|-------|---------|--------|------|
| gpt-4o-mini | ? | ? | ? | ? |
| gpt-4o | ? | ? | ? | ? |

**Hint:** Ändert das Model in `runAgent`:

```typescript
model: "gpt-4o" // statt "gpt-4o-mini"
```

---

# 📊 BEWERTUNG

| Teil | Punkte | Beschreibung |
|------|--------|--------------|
| Setup + Tools | 25 | Projekt aufgesetzt, 3 Tools funktionieren |
| Agent Loop | 35 | runAgent funktioniert, Tool Calls werden erkannt |
| Tests laufen | 20 | Alle 4 Tests erfolgreich |
| Side Missions | 20 | Mindestens 2 Side Missions erledigt |
| **Total** | **100** | |

**Bestanden:** 60+ Punkte

---

# ✅ ABGABE CHECKLISTE

- [ ] Neues Projekt erstellt (NICHT das Klassenprojekt kopiert)
- [ ] `tools.ts` mit 3 Tools (calculator, time, dice)
- [ ] `agent.ts` mit funktionierendem Loop
- [ ] `main.ts` mit 4 Tests
- [ ] Alle Tests laufen durch
- [ ] Mindestens 1 Side Mission erledigt
- [ ] Screenshot vom erfolgreichen Test-Run
- [ ] GitHub Repo erstellt
- [ ] `.env` ist in `.gitignore` (NICHT committen!)
- [ ] Link in Discord gepostet

---

# 🤖 AI HILFE ERLAUBT

Wenn ihr steckt, nutzt diese Prompts:

**Für Debugging:**
```
Ich baue einen AI Agent in TypeScript mit Bun und OpenAI.
Ich bekomme diesen Fehler: [ERROR]
Mein Code: [CODE]
Was ist das Problem und wie fixe ich es?
```

**Für Verständnis:**
```
Erkläre mir Schritt für Schritt was in diesem Agent Loop passiert:
[CODE]
```

**Für Side Missions:**
```
Ich will meinem Agent Token Counting hinzufügen.
Der Agent nutzt die OpenAI API.
Wie logge ich die Tokens nach jedem Call?
```

---

# 🚀 MORGEN

Wir schauen uns eure Agents an (2 min pro Person):
- Zeigt euren Terminal Output
- Zeigt eine Side Mission

Dann: **Faktor #3 — Context Window Management**

Ihr lernt warum euer Agent nach vielen Tool Calls aufhört zu funktionieren — und wie ihr das fixt.

---

*Hausaufgabe — Woche 1, Dienstag*
*Komplett-Walkthrough*
*Erstellt: Ahmad Othman Adi*
