import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_TEXT_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GEMINI_TTS_MODEL =
  process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-tts";

app.use(express.json({ limit: "20mb" }));

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
  });
};

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "DARBS Diagnostic Assistant API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Offline Diagnostic Fallback Generator for Hardware & PC Repairs
function generateOfflineDiagnosticFallback(
  userQuery: string,
  persona: string = "hardware_laptop"
): string {
  const q = userQuery.toLowerCase();

  if (
    q.includes("bsod") ||
    q.includes("blue screen") ||
    q.includes("stop code") ||
    q.includes("crash") ||
    q.includes("minidump") ||
    persona === "windows_bsod"
  ) {
    return `### 🔍 DARBS Blue Screen (BSOD) Diagnostic & Recovery Guide

I analyzed your crash symptoms. Blue Screen errors typically stem from corrupt kernel files, faulty drivers (especially GPU/Wi-Fi), or bad RAM modules.

---

### 🛠️ Step-by-Step Fix Protocol:

#### 1. System File & Image Verification
Open **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click ➔ *Run as Administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 2. Test RAM for Bit Flips & Memory Leaks
1. Press **Win + R**, type: \`mdsched.exe\`
2. Select **"Restart now and check for problems"**.

#### 3. Analyze Minidump Logs
Locate crash dumps in: \`C:\\Windows\\Minidump\\\`
Use **BlueScreenView** or **WinDbg** to pinpoint the exact \`.sys\` driver causing the crash.

---
> 💡 **DARBS Advisory**: If the BSOD started after a recent update, boot into Safe Mode (**Shift + Restart**) and roll back the driver in Device Manager.`;
  }

  return `### 💻 DARBS Diagnostic Analysis & System Troubleshooting

I have analyzed your query regarding **"${userQuery.slice(0, 60)}"**. Here is the recommended diagnostic workflow:

---

### 🛠️ Universal First-Response Diagnostic Protocol:

#### 1. Run System Integrity Scan
Open **Command Prompt as Administrator** and execute:
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 2. Check Event Viewer for Critical Faults
Press **Win + X** ➔ select **Event Viewer** ➔ Windows Logs ➔ **System** to track down error IDs.

---
> 💬 **Next Step**: Share your laptop brand/model or specific error codes and DARBS will tailor the repair steps!`;
}

// Main Chat Endpoint returning standard JSON (compatible with your frontend)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, persona, temperature, enableWebSearch } = req.body ?? {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini is not configured. Add GEMINI_API_KEY to .env.local and restart the server.",
      });
    }

    // Technical Troubleshooting System Instructions
    let systemInstruction = `You are DARBS (Diagnostic Assistant for Repair, Bugs and Support), an expert AI Technical Support Engineer and Laptop/PC Repair Specialist.
Your mission is to provide precise, structured, step-by-step diagnostic workflows, troubleshooting trees, command-line fixes, hardware guidance, and bug resolution for laptops, desktop computers, Windows/Linux/macOS systems, drivers, network issues, and peripherals.

CORE DIAGNOSTIC METHODOLOGY:
1. 🔍 DIAGNOSE: Ask targeted clarifying questions or explain the root cause.
2. 🧪 TEST: Guide the user to safely check Event Viewer, Task Manager, or Device Manager.
3. 🛠️ FIX: Provide clear, numbered steps and exact commands in code blocks.
4. ✅ VERIFY: Explain how to confirm the issue is resolved.
5. ⚠️ HARDWARE SAFETY: Warn clearly about physical risks (e.g., swollen lithium-ion battery, unplug power before opening laptop chassis).`;

    if (persona === "windows_bsod") {
      systemInstruction += " Focus deeply on Windows Blue Screen of Death stop codes, minidump analysis, and corrupt system files.";
    } else if (persona === "performance_storage") {
      systemInstruction += " Focus on diagnosing 100% disk usage, high CPU/RAM bottlenecks, startup programs, and thermal throttling.";
    } else if (persona === "network_wifi") {
      systemInstruction += " Focus on Wi-Fi dropouts, driver power management, DNS flushes, and TCP/IP stack resets.";
    } else if (persona === "driver_software") {
      systemInstruction += " Focus on clean GPU driver installation, audio driver glitches, and peripheral USB errors.";
    } else {
      systemInstruction += " Focus on full-spectrum laptop hardware, thermals, fans, and battery health reports.";
    }

    type InputMessage = {
      role: "user" | "assistant";
      content?: unknown;
      imageUrl?: unknown;
      audioData?: unknown;
    };

    const inputMessages = (messages as unknown[]).filter(
      (message): message is InputMessage =>
        !!message &&
        typeof message === "object" &&
        "role" in message &&
        ((message as { role?: unknown }).role === "user" ||
          (message as { role?: unknown }).role === "assistant")
    );

    const contents = inputMessages
      .map((message) => {
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

        for (const dataUrl of [message.imageUrl, message.audioData]) {
          if (typeof dataUrl !== "string") continue;
          const matches = dataUrl.match(/^data:([\w.+-]+\/[\w.+-]+);base64,([\s\S]+)$/);
          if (matches && matches.length === 3) {
            parts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2],
              },
            });
          }
        }

        if (typeof message.content === "string" && message.content.trim()) {
          parts.push({ text: message.content });
        } else if (parts.length > 0) {
          parts.push({
            text: message.audioData
              ? "Please listen to this voice recording and diagnose the reported technical issue."
              : "Please inspect and diagnose this hardware component or screen error photo in detail.",
          });
        }

        return {
          role: message.role === "user" ? "user" : "model",
          parts,
        };
      })
      .filter((message) => message.parts.length > 0);

    while (contents[0]?.role === "model") {
      contents.shift();
    }
    if (!contents.length || contents[contents.length - 1].role !== "user") {
      return res.status(400).json({ error: "A user message is required." });
    }

    const lastUserMessage =
      [...inputMessages].reverse().find((message) => message.role === "user")
        ?.content;
    const fallbackQuery =
      typeof lastUserMessage === "string" ? lastUserMessage : "";
    const selectedPersona =
      typeof persona === "string" ? persona : "hardware_laptop";

    const ai = getGeminiClient();
    const interactionInput: import("@google/genai").Interactions.Step[] =
      contents.map((message) => ({
        type: message.role === "user" ? "user_input" : "model_output",
        content: message.parts.map((part) =>
          part.text
            ? { type: "text", text: part.text }
            : {
                type: part.inlineData?.mimeType.startsWith("audio/")
                  ? "audio"
                  : "image",
                mime_type: part.inlineData?.mimeType || "image/png",
                data: part.inlineData?.data || "",
              }
        ),
      }));

    try {
      const response = await ai.interactions.create({
        model: GEMINI_TEXT_MODEL,
        input: interactionInput,
        system_instruction: systemInstruction,
        generation_config: {
          temperature:
            typeof temperature === "number"
              ? Math.max(0, Math.min(2, temperature))
              : 0.3,
        },
        ...(enableWebSearch ? { tools: [{ type: "google_search" as const }] } : {}),
      });

      if (response.output_text) {
        const sources = response.steps.flatMap((step) =>
          step.type === "model_output"
            ? (step.content ?? []).flatMap((block) =>
                block.type === "text"
                  ? (block.annotations ?? []).flatMap((annotation) =>
                      annotation.type === "url_citation" && annotation.url
                        ? [{
                            title: annotation.title || annotation.url,
                            url: annotation.url,
                          }]
                        : []
                    )
                  : []
              )
            : []
        );
        return res.json({ reply: response.output_text, sources });
      }

      return res.status(502).json({
        error: "Gemini returned an empty response.",
      });
    } catch (err: any) {
      console.error(`Gemini request using ${GEMINI_TEXT_MODEL} failed:`, err);
      const errorMessage = err?.message || String(err);
      const isQuotaError = /quota|429|resource_exhausted/i.test(errorMessage);

      if (isQuotaError) {
        const fallback = generateOfflineDiagnosticFallback(
          fallbackQuery,
          selectedPersona
        );
        return res.json({
          reply: `> ⚡ *DARBS Offline Diagnostic Mode Active (API Quota Exceeded)*\n\n${fallback}`,
          sources: [],
        });
      }

      return res.status(502).json({
        error: `Gemini could not generate a response with ${GEMINI_TEXT_MODEL}: ${errorMessage}`,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Failed to process the Gemini chat request.",
    });
  }
});

// Image Generation Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini is not configured." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "imagen-3.0-generate-002",
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio } },
    });

    let imageUrl: string | null = null;
    let caption: string | null = null;

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
      } else if (part.text) {
        caption = part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image was generated by model." });
    }

    res.json({ imageUrl, caption });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
  }
});

// Text-To-Speech Endpoint
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini is not configured." });
    }

    const cleanText = text.slice(0, 1000);
    const ai = getGeminiClient();
    const response = await ai.interactions.create({
      model: GEMINI_TTS_MODEL,
      input: cleanText,
      response_format: { type: "audio" },
      generation_config: {
        speech_config: [{ voice: voiceName }],
      },
    });

    const audioPart = response.output_audio?.data;
    if (!audioPart) {
      return res.status(500).json({ error: "Failed to generate audio output." });
    }

    res.json({
      audioBase64: audioPart,
      mimeType: response.output_audio?.mime_type || "audio/wav",
    });
  } catch (error: any) {
    console.error("Error in /api/text-to-speech:", error);
    res.status(500).json({ error: error.message || "Failed to generate text-to-speech." });
  }
});

// Smart Analysis Tool Endpoint
app.post("/api/smart-tool", async (req, res) => {
  try {
    const { toolType, input } = req.body;
    if (typeof input !== "string" || !input.trim()) {
      return res.status(400).json({ error: "Input text required." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini is not configured." });
    }

    const ai = getGeminiClient();
    let prompt = "";
    if (toolType === "enhance_prompt") {
      prompt = `Enhance and optimize the following prompt for an AI model: "${input}"`;
    } else if (toolType === "summarize") {
      prompt = `Provide a concise executive summary and key action items for:\n\n${input}`;
    } else if (toolType === "code_explain") {
      prompt = `Analyze and explain this code in plain English:\n\n${input}`;
    } else {
      prompt = `Analyze the following content:\n\n${input}`;
    }

    const response = await ai.interactions.create({
      model: GEMINI_TEXT_MODEL,
      input: prompt,
    });

    if (!response.output_text) {
      return res.status(502).json({ error: "Gemini returned an empty result." });
    }
    res.json({ result: response.output_text });
  } catch (error: any) {
    console.error("Error in /api/smart-tool:", error);
    res.status(500).json({ error: error.message || "Smart tool execution failed." });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const listenPort = PORT;

  const startListening = (port: number) => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`DARBS AI Server running on http://0.0.0.0:${port}`);
    }).on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        const nextPort = port + 1;
        console.warn(`Port ${port} is busy, retrying on ${nextPort}`);
        startListening(nextPort);
        return;
      }

      console.error("Failed to start server:", error);
      process.exit(1);
    });
  };

  startListening(listenPort);
}

startServer();