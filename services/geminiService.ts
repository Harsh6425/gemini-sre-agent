import { GoogleGenAI, Type } from "@google/genai";
import { LogEntry, AgentResponseSchema } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SYSTEM_INSTRUCTION = `
You are the "Self-Healing SRE Agent", an expert System Reliability Engineer. 
Your job is to analyze logs, deduce the root cause of a failure, and propose a strict fix.
You must return your analysis in a structured JSON format.
Your reasoning must be deep and logical.
`;

export const analyzeLogsWithGemini = async (logs: LogEntry[]): Promise<AgentResponseSchema> => {
  
  // Convert logs to string context
  const logContext = logs.slice(-15).map(l => `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message}`).join('\n');

  const prompt = `
    Analyze the following production logs. There is a spike in errors.
    
    LOGS:
    ${logContext}

    TASK:
    1. Identify the Root Cause (e.g., Code Logic Error, Config Error, DB Connection).
    2. Identify the likely bad commit (hallucinate a realistic hash if not visible, for simulation).
    3. Determine the fix action: 'REVERT' if it's a code/logic error, 'HOTFIX' if it's a configuration drift.
    4. Write a short Python script that would reproduce this error.

    Return JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for complex reasoning
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 16000 }, // HIGH thinking level as requested
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                root_cause_analysis: { type: Type.STRING, description: "Detailed explanation of the failure." },
                bad_commit_hash: { type: Type.STRING, description: "The commit hash responsible." },
                recommended_action: { type: Type.STRING, enum: ["REVERT", "HOTFIX"], description: "The remediation strategy." },
                reproduction_code: { type: Type.STRING, description: "Python code to reproduce the issue." }
            },
            required: ["root_cause_analysis", "bad_commit_hash", "recommended_action", "reproduction_code"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AgentResponseSchema;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback for demo purposes if API fails or quota exceeded
    return {
      root_cause_analysis: "Simulation Fallback: Connection refused to DB due to bad connection pool config.",
      bad_commit_hash: "fb42a1",
      recommended_action: "HOTFIX",
      reproduction_code: "import requests; assert requests.get('http://api/health').status_code == 200"
    };
  }
};
