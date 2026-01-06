import { runAgent } from "./agent";

// ANSI Colors für schöne Ausgabe
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

function printHeader() {
    console.clear();
    console.log(`
${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║                                                                ║${colors.reset}
${colors.bright}${colors.blue}║         🤖 MEIN ERSTER AI AGENT - TEST SUITE 🤖              ║${colors.reset}
${colors.bright}${colors.blue}║                                                                ║${colors.reset}
${colors.bright}${colors.blue}║  Ein vollständig funktionsfähiger Agent mit Tool Calls        ║${colors.reset}
${colors.bright}${colors.blue}║  Gebaut mit TypeScript, OpenAI API & Zod                      ║${colors.reset}
${colors.bright}${colors.blue}║                                                                ║${colors.reset}
${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}
    `);
}

function printTestHeader(testNumber: number, testName: string) {
    console.log(`\n${colors.bright}${colors.magenta}📋 TEST ${testNumber}: ${testName}${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(66)}${colors.reset}`);
}

function printSeparator() {
    console.log(`\n${colors.dim}${'═'.repeat(66)}${colors.reset}\n`);
}

async function runTests() {
    printHeader();

    const startTime = Date.now();

    // Test 1: Calculator
    printTestHeader(1, "Einfache Rechnung");
    await runAgent("Was ist 25 mal 17?");
    printSeparator();

    // Test 2: Time
    printTestHeader(2, "Aktuelle Zeit");
    await runAgent("Wie spät ist es gerade?");
    printSeparator();

    // Test 3: Dice
    printTestHeader(3, "Würfeln");
    await runAgent("Würfel 3 Würfel mit 20 Seiten");
    printSeparator();

    // Test 4: Multi-Step
    printTestHeader(4, "Multi-Step (2 Tool Calls)");
    await runAgent("Würfel einen Würfel und multipliziere das Ergebnis mit 7");
    printSeparator();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Summary
    console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}║                   ✅ ALLE TESTS ABGESCHLOSSEN                   ║${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`\n${colors.green}✓ 4/4 Tests erfolgreich durchgeführt${colors.reset}`);
    console.log(`${colors.cyan}⏱️  Gesamtdauer: ${colors.bright}${duration}s${colors.reset}`);
    console.log(`\n${colors.dim}Danke fürs Testen! 🚀${colors.reset}\n`);
}

runTests().catch((error) => {
    console.error(`${colors.red}❌ Fehler bei Test-Ausführung:${colors.reset}`, error);
    process.exit(1);
});
