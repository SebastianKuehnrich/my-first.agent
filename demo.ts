import { runAgent } from "./agent";

// ANSI Colors
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
};

function clearScreen() {
    console.clear();
}

function printWelcome() {
    clearScreen();
    console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║                                                                ║${colors.reset}
${colors.bright}${colors.blue}║            🤖 INTERACTIVE AI AGENT DEMO 🤖                   ║${colors.reset}
${colors.bright}${colors.blue}║                                                                ║${colors.reset}
${colors.bright}${colors.blue}║  Powered by OpenAI GPT-4o-mini & Zod Schema Validation       ║${colors.reset}
${colors.bright}${colors.blue}║                                                                ║${colors.reset}
${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}Verfügbare Tools:${colors.reset}
  ${colors.green}✓ calculator${colors.reset}     - Mathematische Ausdrücke berechnen
  ${colors.green}✓ current_time${colors.reset}   - Aktuelle Uhrzeit und Datum
  ${colors.green}✓ roll_dice${colors.reset}      - Würfel werfen

${colors.yellow}Beispiele:${colors.reset}
  • "Was ist 123 mal 456?"
  • "Wie spät ist es?"
  • "Würfel 5 Würfel mit 6 Seiten"
  • "Würfel einen Würfel und multipliziere mit 10"

${colors.dim}Drücke Ctrl+C zum Beenden${colors.reset}
    `);
}

async function demo() {
    printWelcome();

    const demoQueries = [
        "Berechne 999 + 1",
        "Wie viel Uhr ist es gerade?",
        "Würfel 2 Würfel mit 6 Seiten",
        "Würfel einen 20er Würfel und verdopple das Ergebnis"
    ];

    for (let i = 0; i < demoQueries.length; i++) {
        const query = demoQueries[i];

        console.log(`\n${colors.bright}${colors.yellow}[Demo ${i + 1}/${demoQueries.length}]${colors.reset}`);
        console.log(`${colors.cyan}Anfrage:${colors.reset} ${colors.bright}"${query}"${colors.reset}\n`);

        await runAgent(query, true);

        if (i < demoQueries.length - 1) {
            console.log(`\n${colors.dim}Warte 2 Sekunden vor nächster Demo...${colors.reset}`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}║                  ✅ DEMO ABGESCHLOSSEN                           ║${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    console.log(`${colors.green}Alle Demo-Anfragen wurden erfolgreich bearbeitet!${colors.reset}\n`);
}

demo().catch((error) => {
    console.error(`${colors.red}❌ Fehler:${colors.reset}`, error);
    process.exit(1);
});

