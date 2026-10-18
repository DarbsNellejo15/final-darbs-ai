import React, { useState } from "react";
import {
  Sparkles,
  Download,
  Send,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  Check,
  Zap,
} from "lucide-react";

interface ImageStudioProps {
  onSendImageToChat: (imageUrl: string, prompt: string) => void;
}

const STYLE_PRESETS = [
  { id: "photo", label: "Photorealistic", prefix: "Photorealistic high-definition photography of " },
  { id: "cyberpunk", label: "Cyberpunk", prefix: "Vibrant neon cyberpunk style, futuristic lighting, " },
  { id: "anime", label: "Anime / Digital", prefix: "Detailed anime digital art illustration of " },
  { id: "minimal", label: "3D Render", prefix: "Clean 3D minimalist octane render of " },
  { id: "vector", label: "Vector Logo", prefix: "Flat clean vector icon graphic design, isolated, " },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "9:16", label: "Portrait (9:16)" },
];

export const ImageStudio: React.FC<ImageStudioProps> = ({
  onSendImageToChat,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photo");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<
    { url: string; prompt: string; timestamp: string }[]
  >([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setError(null);
    setIsGenerating(true);

    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    const fullPrompt = styleObj ? `${styleObj.prefix}${prompt}` : prompt;

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, aspectRatio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      const newImg = {
        url: data.imageUrl,
        prompt: fullPrompt,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setGeneratedImages([newImg, ...generatedImages]);
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Darbs AI Image Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate stunning high-quality artwork, logos, 3D renders, and illustrations.
          </p>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        {/* Style Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Art Style Preset:
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                  selectedStyle === style.id
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Aspect Ratio:
          </label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setAspectRatio(ratio.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                  aspectRatio === ratio.value
                    ? "border-amber-500 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Image Description Prompt:
          </label>
          <textarea
            id="image-studio-prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Futuristic glass skyscraper with vertical gardens at sunset, cinematic lighting..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            id="btn-generate-image-studio"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Creating Visual...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Gallery */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Generated Creations ({generatedImages.length})
        </h2>

        {generatedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No images created yet in this session.
            </p>
            <p className="text-xs text-slate-400">
              Type a prompt above and click "Generate Image" to create artwork.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full object-cover max-h-80"
                />
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                    "{img.prompt}"
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      {img.timestamp}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={img.url}
                        download={`darbs-ai-${idx + 1}.png`}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                      <button
                        onClick={() => onSendImageToChat(img.url, img.prompt)}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send to Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
