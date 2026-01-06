import { z } from "zod";

export interface Tool {
    name: string;
    description: string;
    schema: z.ZodObject<any>;
    execute: (params: any) => Promise<any>;
}

// Calculator Tool
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

// Time Tool
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

// Dice Tool
export const diceTool: Tool = {
    name: "roll_dice",
    description: "Würfelt einen oder mehrere Würfel. Standardmäßig ein 6-seitiger Würfel.",
    schema: z.object({
        sides: z.number().min(2).max(100).default(6).describe("Anzahl der Seiten pro Würfel"),
        count: z.number().min(1).max(10).default(1).describe("Anzahl der Würfel")
    }),
    execute: async (params: any) => {
        // Handle verschiedene Parameter-Namen die das LLM senden könnte
        const normalizedParams = {
            sides: params.sides || params.num_sides || 6,
            count: params.count || params.num_dice || params.number_of_dice || 1
        };

        const validated = diceTool.schema.parse(normalizedParams);
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

// Exports
export const allTools: Tool[] = [calculatorTool, timeTool, diceTool];

export function getToolByName(name: string): Tool | undefined {
    return allTools.find(tool => tool.name === name);
}

export function getToolDescriptions(): string {
    return allTools.map(tool => `- ${tool.name}: ${tool.description}`).join("\n");
}

