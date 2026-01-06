import OpenAI from "openai";
import { allTools, getToolByName, getToolDescriptions } from "./tools";

const openai = new OpenAI();

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

// ANSI Color Codes für schönere Ausgabe
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
};

function formatBox(title: string, content: string, color: string = colors.cyan): string {
    const width = Math.max(title.length + 4, 50);
    const line = "─".repeat(width);
    return `
${color}┌${line}┐${colors.reset}
${color}│ ${title.padEnd(width - 2)} │${colors.reset}
${color}├${line}┤${colors.reset}
${content.split('\n').map(l => `${color}│${colors.reset} ${l.padEnd(width - 2)} ${color}│${colors.reset}`).join('\n')}
${color}└${line}┘${colors.reset}
`;
}

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

export async function runAgent(userInput: string, verbose: boolean = true): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
    ];

    let iterations = 0;
    let totalTokens = { prompt: 0, completion: 0 };
    const MAX_ITERATIONS = 10;

    if (verbose) {
        console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.blue}║        🤖 AGENT WIRD INITIALISIERT${colors.reset}`);
        console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
        console.log(`${colors.cyan}📝 Anfrage:${colors.reset} ${colors.bright}${userInput}${colors.reset}\n`);
    }

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        if (verbose) {
            console.log(`${colors.dim}${'─'.repeat(58)}${colors.reset}`);
            console.log(`${colors.yellow}⚡ Iteration ${iterations}${colors.reset}`);
            console.log(`${colors.dim}${'─'.repeat(58)}${colors.reset}`);
        }

        // LLM aufrufen
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.7
        });

        const content = response.choices[0].message.content || "";

        // Token tracking
        if (response.usage) {
            totalTokens.prompt += response.usage.prompt_tokens;
            totalTokens.completion += response.usage.completion_tokens;
        }

        if (verbose) {
            const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;
            console.log(`${colors.magenta}🤖 LLM Antwort:${colors.reset}`);
            console.log(`   ${colors.dim}${preview}${colors.reset}\n`);
        }

        // Tool Call prüfen
        const toolCall = parseToolCall(content);

        if (toolCall) {
            if (verbose) {
                console.log(`${colors.green}✓ Tool Call erkannt${colors.reset}`);
                console.log(`  ${colors.cyan}Tool:${colors.reset} ${colors.bright}${toolCall.tool}${colors.reset}`);
                console.log(`  ${colors.cyan}Parameter:${colors.reset} ${JSON.stringify(toolCall.params)}\n`);
            }

            // Tool ausführen
            const result = await executeTool(toolCall.tool, toolCall.params);

            if (verbose) {
                console.log(`${colors.green}✓ Tool ausgeführt${colors.reset}`);
                console.log(`  ${colors.cyan}Ergebnis:${colors.reset} ${JSON.stringify(result)}\n`);
            }

            // Messages updaten
            messages.push({ role: "assistant", content: content });
            messages.push({ role: "user", content: `Tool Result: ${JSON.stringify(result)}` });

        } else {
            // Kein Tool Call = Finale Antwort
            if (verbose) {
                console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
                console.log(`${colors.bright}${colors.blue}║          ✅ FINALE ANTWORT${colors.reset}`);
                console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
                console.log(`${colors.green}${content}${colors.reset}\n`);

                console.log(`${colors.dim}${'─'.repeat(58)}${colors.reset}`);
                console.log(`${colors.cyan}📊 Statistik:${colors.reset}`);
                console.log(`   Iterationen: ${colors.bright}${iterations}${colors.reset}`);
                console.log(`   Tokens (Input): ${colors.bright}${totalTokens.prompt}${colors.reset}`);
                console.log(`   Tokens (Output): ${colors.bright}${totalTokens.completion}${colors.reset}`);
                console.log(`   Total Tokens: ${colors.bright}${totalTokens.prompt + totalTokens.completion}${colors.reset}`);
                console.log(`${colors.dim}${'─'.repeat(58)}${colors.reset}\n`);
            }

            return content;
        }
    }

    if (verbose) {
        console.log(`${colors.red}⚠️ MAX_ITERATIONS erreicht!${colors.reset}\n`);
    }
    return "Konnte Anfrage nicht beantworten.";
}
