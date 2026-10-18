import React, { useState } from "react";
import {
  Wand2,
  FileText,
  Code2,
  BookOpen,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface SmartToolsPanelProps {
  onSendResultToChat: (text: string) => void;
}

export const SmartToolsPanel: React.FC<SmartToolsPanelProps> = ({
  onSendResultToChat,
}) => {
  const [activeTool, setActiveTool] = useState<
    "enhance_prompt" | "summarize" | "code_explain" | "flashcards"
  >("enhance_prompt");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tools = [
    {
      id: "enhance_prompt",
      title: "Prompt Enhancer",
      desc: "Polishes simple thoughts into detailed AI prompts.",
      icon: Wand2,
      color: "text-purple-500 bg-purple-500/10",
      placeholder: "Enter a simple prompt idea (e.g. 'Build a task manager app')...",
    },
    {
      id: "summarize",
      title: "Executive Summarizer",
      desc: "Distills lengthy articles or docs into key takeaways.",
      icon: FileText,
      color: "text-blue-500 bg-blue-500/10",
      placeholder: "Paste article, email, or meeting notes here...",
    },
    {
      id: "code_explain",
      title: "Code Explainer",
      desc: "Analyzes code for logic, edge cases & optimizations.",
      icon: Code2,
      color: "text-emerald-500 bg-emerald-500/10",
      placeholder: "Paste code snippet here...",
    },
    {
      id: "flashcards",
      title: "Flashcard Creator",
      desc: "Turns study text into high-yield Q&A cards.",
      icon: BookOpen,
      color: "text-amber-500 bg-amber-500/10",
      placeholder: "Paste study material or concept notes here...",
    },
  ];

  const handleExecute = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/smart-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolType: activeTool, input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Smart tool execution failed.");
      }

      setOutput(data.result);
    } catch (err: any) {
      console.error("Smart tool error:", err);
      setError(err.message || "Failed to process tool request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <Wand2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Darbs Smart Productivity Tools
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant AI tools for prompt polishing, text summarization, code analysis, and learning.
          </p>
        </div>
      </div>

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id as any);
                setOutput("");
              }}
              className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                isActive
                  ? "border-purple-500 bg-purple-50/50 shadow-md dark:border-purple-500 dark:bg-purple-950/30"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${t.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                {t.title}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {t.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tool Workbench */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            {tools.find((t) => t.id === activeTool)?.title}
          </h2>
          <span className="text-xs text-slate-400">
            Powered by Gemini 3.6 Flash
          </span>
        </div>

        <textarea
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tools.find((t) => t.id === activeTool)?.placeholder}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleExecute}
            disabled={!input.trim() || isLoading}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Execute Tool</span>
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50/40 p-4 dark:border-purple-900/50 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Generated Tool Output:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => onSendResultToChat(output)}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send to Chat</span>
                </button>
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-white/80 p-4 rounded-lg border border-purple-100 dark:bg-slate-900/80 dark:border-purple-900/30">
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
