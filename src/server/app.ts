import express from "express";
import { generateOfflineDiagnosticFallback } from "./diagnosticFallback";

const app = express();

app.use(express.json({ limit: "20mb" }));

// Grok AI (xAI) Configuration
const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = process.env.GROK_MODEL || "grok-2-latest";
const GROK_VISION_MODEL = process.env.GROK_VISION_MODEL || "grok-2-vision-1212";

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "DARBS Diagnostic Assistant API",
    aiEngine: "Grok AI (xAI)",
    grokConfigured: Boolean(process.env.XAI_API_KEY),
    model: GROK_MODEL,
  });
});

// Main Chat Endpoint powered by Grok AI
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, persona, temperature, enableWebSearch } = req.body ?? {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
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

    const lastUserMessage =
      [...inputMessages].reverse().find((message) => message.role === "user")
        ?.content;
    const fallbackQuery =
      typeof lastUserMessage === "string" ? lastUserMessage : "";
    const selectedPersona =
      typeof persona === "string" ? persona : "hardware_laptop";

    // Build Grok system instructions for PC & hardware repair
    let systemInstruction = `You are DARBS (Diagnostic Assistant for Repair, Bugs and Support), an elite AI Technical Support Engineer and Laptop/PC Repair Specialist powered by Grok AI.
Your mission is to provide precise, structured, step-by-step diagnostic workflows, troubleshooting trees, command-line fixes, hardware guidance, and bug resolution for laptops, desktop computers, Windows/Linux/macOS systems, drivers, network issues, and peripherals.

CORE DIAGNOSTIC METHODOLOGY:
1. 🔍 DIAGNOSE: Ask targeted clarifying questions or explain the root cause.
2. 🧪 TEST: Guide the user to safely check Event Viewer, Task Manager, or Device Manager.
3. 🛠️ FIX: Provide clear, numbered steps and exact commands in code blocks.
4. ✅ VERIFY: Explain how to confirm the issue is resolved.
5. ⚠️ HARDWARE SAFETY: Warn clearly about physical risks (e.g., swollen lithium-ion battery, unplug power before opening laptop chassis).`;

    if (persona === "windows_bsod") {
      systemInstruction +=
        " Focus deeply on Windows Blue Screen of Death stop codes, minidump analysis, and corrupt system files.";
    } else if (persona === "performance_storage") {
      systemInstruction +=
        " Focus on diagnosing 100% disk usage, high CPU/RAM bottlenecks, startup programs, and thermal throttling.";
    } else if (persona === "network_wifi") {
      systemInstruction +=
        " Focus on Wi-Fi dropouts, driver power management, DNS flushes, and TCP/IP stack resets.";
    } else if (persona === "driver_software") {
      systemInstruction +=
        " Focus on clean GPU driver installation, audio driver glitches, and peripheral USB errors.";
    } else {
      systemInstruction +=
        " Focus on full-spectrum laptop hardware, thermals, fans, and battery health reports.";
    }

    if (enableWebSearch) {
      systemInstruction +=
        " Provide the most up-to-date driver references, current Windows update known bugs, and manufacturer service advisories.";
    }

    const apiKey = process.env.XAI_API_KEY;

    // If XAI_API_KEY is not configured, supply high-yield offline diagnosis + setup reminder
    if (!apiKey) {
      const offlineDiagnostic = generateOfflineDiagnosticFallback(
        fallbackQuery,
        selectedPersona
      );
      return res.json({
        reply: `> ⚠️ **DARBS Setup Note**: \`XAI_API_KEY\` is not detected yet. DARBS is operating in **Offline Diagnostic Mode**.\n> To connect live Grok AI, add your \`XAI_API_KEY\` in your \`.env\` file or Vercel Environment Variables.\n\n${offlineDiagnostic}`,
        sources: [],
      });
    }

    // Determine whether image analysis is requested
    let hasImage = false;

    // Convert messages to Grok / OpenAI Chat Completion format
    const grokMessages: Array<{
      role: "system" | "user" | "assistant";
      content:
        | string
        | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>;
    }> = [
      {
        role: "system",
        content: systemInstruction,
      },
    ];

    for (const msg of inputMessages) {
      const textContent =
        typeof msg.content === "string" && msg.content.trim()
          ? msg.content
          : msg.imageUrl
          ? "Please inspect and diagnose this hardware component or error screen photo."
          : "";

      if (msg.imageUrl && typeof msg.imageUrl === "string") {
        hasImage = true;
        grokMessages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: [
            { type: "text", text: textContent },
            { type: "image_url", image_url: { url: msg.imageUrl } },
          ],
        });
      } else if (textContent) {
        grokMessages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: textContent,
        });
      }
    }

    // Use Grok Vision model if images are present, otherwise standard text model
    const activeModel = hasImage ? GROK_VISION_MODEL : GROK_MODEL;

    // Call xAI Grok API
    const grokResponse = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: grokMessages,
        temperature:
          typeof temperature === "number"
            ? Math.max(0, Math.min(2, temperature))
            : 0.4,
      }),
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error(`xAI Grok API error (status ${grokResponse.status}):`, errorText);

      let parsedErrorMessage = `xAI API returned status ${grokResponse.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (typeof errorJson?.error === "string") {
          parsedErrorMessage = errorJson.error;
        } else if (errorJson?.error?.message) {
          parsedErrorMessage = errorJson.error.message;
        } else if (errorJson?.message) {
          parsedErrorMessage = errorJson.message;
        }
      } catch {
        // use raw message
      }

      // If quota or unauthorized, provide offline diagnostic guide as safety net
      const fallback = generateOfflineDiagnosticFallback(
        fallbackQuery,
        selectedPersona
      );
      return res.json({
        reply: `> ⚡ **DARBS Diagnostic Fallback Active** (Grok API Notice: ${parsedErrorMessage})\n\n${fallback}`,
        sources: [],
      });
    }

    const data = await grokResponse.json();
    const assistantReply = data.choices?.[0]?.message?.content;

    if (!assistantReply) {
      const fallback = generateOfflineDiagnosticFallback(
        fallbackQuery,
        selectedPersona
      );
      return res.json({
        reply: fallback,
        sources: [],
      });
    }

    return res.json({
      reply: assistantReply,
      sources: [],
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Failed to process the Grok chat request.",
    });
  }
});

// Smart Analysis Tool Endpoint powered by Grok AI
app.post("/api/smart-tool", async (req, res) => {
  try {
    const { toolType, input } = req.body;
    if (typeof input !== "string" || !input.trim()) {
      return res.status(400).json({ error: "Input text required." });
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "Grok is not configured. Add XAI_API_KEY to your environment variables.",
      });
    }

    let prompt = "";
    if (toolType === "enhance_prompt") {
      prompt = `You are an expert prompt engineer. Polish and optimize the following prompt for an AI model to get maximum technical accuracy:\n\n"${input}"`;
    } else if (toolType === "summarize") {
      prompt = `Provide a concise, executive summary and key action items for the following technical content:\n\n${input}`;
    } else if (toolType === "code_explain") {
      prompt = `Analyze and explain this code or command script in plain English, highlighting potential bugs or improvements:\n\n${input}`;
    } else if (toolType === "flashcards") {
      prompt = `Create a concise set of study flashcards from the following material. Format each card as a numbered question followed by its answer:\n\n${input}`;
    } else {
      prompt = `Analyze the following content:\n\n${input}`;
    }

    const grokResponse = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: "system", content: "You are a helpful and precise technical assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!grokResponse.ok) {
      const errText = await grokResponse.text();
      return res.status(502).json({
        error: `Grok API error: ${errText.slice(0, 150)}`,
      });
    }

    const data = await grokResponse.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(502).json({ error: "Grok returned an empty result." });
    }

    res.json({ result });
  } catch (error: any) {
    console.error("Error in /api/smart-tool:", error);
    res.status(500).json({
      error: error.message || "Smart tool execution failed.",
    });
  }
});

// Image Generation Endpoint (Grok compatibility handler)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body ?? {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    // SVG Diagnostic Blueprint Generator for hardware diagrams
    const cleanPrompt = prompt.replace(/"/g, "'").slice(0, 60);
    const svgDiagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b1429" />
          <stop offset="100%" stop-color="#040812" />
        </linearGradient>
        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#bg)" rx="16" />
      <rect x="20" y="20" width="560" height="360" fill="none" stroke="#1e293b" stroke-width="2" rx="12" stroke-dasharray="6,6" />
      <circle cx="300" cy="150" r="48" fill="#0f172a" stroke="url(#cyanGrad)" stroke-width="3" />
      <path d="M285 150 L295 160 L315 140" fill="none" stroke="#22d3ee" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <text x="300" y="240" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">DARBS Diagnostic Diagram</text>
      <text x="300" y="270" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">${cleanPrompt}</text>
      <rect x="220" y="300" width="160" height="32" rx="16" fill="#0891b2" fill-opacity="0.2" stroke="#0891b2" stroke-width="1" />
      <text x="300" y="321" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">HARDWARE BLUEPRINT</text>
    </svg>`;

    const base64Svg = Buffer.from(svgDiagram).toString("base64");
    res.json({
      imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
      caption: `Diagnostic Schematic: ${cleanPrompt}`,
    });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
  }
});

// Text-To-Speech Endpoint (Browser Web Speech API is primary)
app.post("/api/text-to-speech", async (_req, res) => {
  // Frontend speech controller uses the browser's Web Speech API natively
  res.status(501).json({
    message: "Client-side Web Speech API active.",
  });
});

export default app;
