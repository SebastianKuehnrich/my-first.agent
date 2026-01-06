# 🤖 Mein Erster AI Agent

Ein vollständig funktionsfähiger AI Agent mit Tool Calls, gebaut mit **TypeScript**, **OpenAI API** und **Zod Schema Validation**.

## ✨ Features

- ✅ **3 vordefinierte Tools**: Calculator, Current Time, Dice
- ✅ **OpenAI Integration**: Nutzt GPT-4o-mini für intelligente Antworten
- ✅ **Tool Call Detection**: Erkennt automatisch wenn Tools genutzt werden sollen
- ✅ **Multi-Step Reasoning**: Agent kann mehrere Tools hintereinander nutzen
- ✅ **Token Tracking**: Zeigt Verbrauch von Tokens an
- ✅ **Sauberer Code**: TypeScript mit vollständiger Type-Safety
- ✅ **Schöne Ausgabe**: ANSI-farbige, professionelle Konsolen-Ausgabe

## 🚀 Quick Start

### 1. Installation

```bash
# Clone das Projekt
git clone https://github.com/SebastianKuehnrich/my-first.agent.git
cd my-first.agent

# Dependencies installieren
bun install
```

### 2. API Key einrichten

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
OPENAI_API_KEY=sk-proj-dein-api-key-hier
```

⚠️ **WICHTIG**: Diese Datei wird durch `.gitignore` geschützt und NICHT ins Repository committed!

### 3. Tests ausführen

```bash
bun run main.ts
```

## 📊 Test Suite

Die Test Suite enthält 4 verschiedene Tests:

| Test | Beschreibung | Tools | Iterationen |
|------|--------------|-------|------------|
| **Test 1** | Mathematische Rechnung (25 × 17) | `calculator` | 2 |
| **Test 2** | Aktuelle Zeit & Datum | `current_time` | 2 |
| **Test 3** | Würfeln (3 Würfel, 20 Seiten) | `roll_dice` | 2 |
| **Test 4** | Multi-Step: Würfeln + Rechnen | `roll_dice` + `calculator` | 3 |

### Beispiel Output

```
🤖 AGENT WIRD INITIALISIERT
📝 Anfrage: Was ist 25 mal 17?

⚡ Iteration 1
🤖 LLM Antwort: {"tool": "calculator", "params": {"expression": "25 * 17"}}
✓ Tool Call erkannt
  Tool: calculator
  Parameter: {"expression":"25 * 17"}
✓ Tool ausgeführt
  Ergebnis: {"success":true,"result":425}

⚡ Iteration 2
🤖 LLM Antwort: 25 mal 17 ist 425.

✅ FINALE ANTWORT
25 mal 17 ist 425.

📊 Statistik:
   Iterationen: 2
   Tokens (Input): 522
   Tokens (Output): 26
   Total Tokens: 548
```

## 🛠️ Architektur

Das Projekt besteht aus 3 Hauptdateien:

### `tools.ts` - Tool Definitionen

Definiert alle verfügbaren Tools mit Zod Schemas für Parameter-Validierung:

```typescript
export interface Tool {
    name: string;
    description: string;
    schema: z.ZodObject<any>;
    execute: (params: any) => Promise<any>;
}
```

**Verfügbare Tools:**

1. **calculator** - Mathematische Ausdrücke
   - Parameter: `expression` (string)
   - Beispiel: `"25 * 17"`, `"(10 + 5) / 3"`

2. **current_time** - Aktuelle Uhrzeit und Datum
   - Parameter: keine
   - Return: `{time, date, timestamp}`

3. **roll_dice** - Würfel-Simulation
   - Parameter: `sides` (2-100), `count` (1-10)
   - Beispiel: `{sides: 20, count: 3}`

### `agent.ts` - Der Agent Loop

Implementiert den kompletten Agent Loop:

1. Initialisierung mit System Prompt
2. LLM aufrufen (OpenAI API)
3. Tool Call erkennen (JSON Parsing)
4. Tool ausführen
5. Ergebnis zurück an LLM
6. Wiederholen bis finale Antwort

```typescript
export async function runAgent(userInput: string): Promise<string>
```

**Features:**
- Automatisches Token Tracking
- Farbige Konsolen-Ausgabe
- Error Handling für alle Fehlerszenarien
- Max 10 Iterationen Sicherheitslimit

### `main.ts` - Test Suite

Führt 4 verschiedene Tests durch um alle Features zu demonstrieren.

## 📈 Optionen für visuelles Deployment

### 1. **Web UI** (HTML/CSS/JS)
Erstelle ein einfaches Web Interface um den Agent über eine Chat-Seite zu nutzen:
```
POST /api/chat
{
  "message": "Was ist 5 mal 5?"
}
```

### 2. **CLI Spinner & Progress Bars**
Nutze `ora` oder `chalk` für noch schönere Terminal-Ausgabe:
```bash
npm install ora chalk
```

### 3. **Dashboard mit Charts**
Nutze `chart.js` oder `plotly` um Token-Verbrauch zu visualisieren

### 4. **Docker Container**
Deploye den Agent als Docker Container:
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
CMD ["bun", "run", "main.ts"]
```

### 5. **Telegram Bot Integration**
Nutze das Telegram Bot API um den Agent als Bot bereitzustellen

## 🔧 Anpassungen & Erweiterungen

### Neues Tool hinzufügen

1. **Tool erstellen in `tools.ts`:**

```typescript
export const myTool: Tool = {
    name: "my_tool",
    description: "Was macht dieses Tool?",
    schema: z.object({
        param1: z.string().describe("Parameter 1")
    }),
    execute: async (params) => {
        // Implementierung
        return { success: true, result: "..." };
    }
};
```

2. **In `allTools` Array hinzufügen:**

```typescript
export const allTools: Tool[] = [
    calculatorTool, 
    timeTool, 
    diceTool,
    myTool  // ← Neu
];
```

### Model wechseln

In `agent.ts` die Model-Zeile ändern:

```typescript
model: "gpt-4" // statt "gpt-4o-mini"
```

## 📦 Dependencies

```json
{
  "openai": "^4.52.0",     // OpenAI API Library
  "zod": "^3.22.4",        // Schema Validation
  "typescript": "^5.5.3"   // Type Safety
}
```

## ⚙️ System Requirements

- **Node.js/Bun**: v18.0+
- **TypeScript**: v5.0+
- **OpenAI API Key**: Erforderlich

## 📝 Environment Variables

```env
OPENAI_API_KEY=sk-proj-...  # Dein OpenAI API Key
```

## 🐛 Debugging

### Verbose Mode ist Standard
Der Agent gibt detaillierte Logs aus:
- Jede Iteration
- Jeden Tool Call
- Token-Verbrauch
- Finale Antwort

### Fehlerbehandlung

Alle Fehler werden elegant behandelt:
- Tool nicht vorhanden → Fehlermeldung
- Ungültige Parameter → Zod Validation Error
- API Fehler → Automatischer Retry (optional)

## 📊 Performance

**Durchschnittliche Metriken:**

| Szenario | Iterationen | Tokens | Zeit |
|----------|------------|--------|------|
| Einfache Rechnung | 2 | ~550 | ~2-3s |
| Time Abfrage | 2 | ~570 | ~2-3s |
| Würfeln | 2 | ~600 | ~2-3s |
| Multi-Step | 3 | ~1000 | ~5-6s |

## 🎯 Use Cases

✅ Intelligente Rechner  
✅ Zeitbasierte Systeme  
✅ Game-basierte Agents  
✅ Multi-Tool Workflows  
✅ Educational Projects  

## 📚 Weitere Ressourcen

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📄 Lizenz

MIT

## 👨‍💻 Autor

**Sebastian Kühnrich**

## 🚀 Versionsverlauf

- **v1.0.0** - Initial Release
  - 3 Tools (Calculator, Time, Dice)
  - Vollständiger Agent Loop
  - Test Suite mit 4 Tests
  - Token Tracking
