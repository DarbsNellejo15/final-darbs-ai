import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Laptop,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Terminal,
  Play,
  Pause,
  Mic,
  Maximize2,
  X,
  FileImage,
} from "lucide-react";
import { ChatMessage as ChatMessageType, AppSettings } from "../types";
import { PERSONA_CONFIGS } from "../data/prompts";

interface ChatMessageProps {
  message: ChatMessageType;
  settings: AppSettings;
  isSpeaking: boolean;
  onToggleMessageSpeech: (text: string, messageId: string) => void;
}

// Inline Voice Message Player Component
const VoiceMessagePlayer: React.FC<{
  audioUrl: string;
  duration?: number;
  isUser: boolean;
}> = ({ audioUrl, duration = 0, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="my-2 max-w-sm rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-[#0d1c3a] to-slate-900 p-3 shadow-md">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30 hover:scale-105 transition-all"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-cyan-300">
              <Mic className="h-3 w-3 text-cyan-400" />
              <span>Voice Diagnostic Recording</span>
            </span>
            <span className="font-mono text-slate-400">
              {formatTime(currentTime)} / {formatTime(totalDuration || 0)}
            </span>
          </div>

          {/* Interactive Progress Bar */}
          <div
            className="relative h-2 w-full cursor-pointer rounded-full bg-slate-800 overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              if (audioRef.current && totalDuration) {
                audioRef.current.currentTime = clickPos * totalDuration;
                setCurrentTime(clickPos * totalDuration);
              }
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Waveform Graphic Animation */}
          <div className="flex items-center gap-0.5 pt-0.5 h-3">
            {[35, 75, 45, 90, 60, 100, 50, 85, 40, 70, 95, 30, 80, 60, 90, 40, 70, 50].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-cyan-400/50 transition-all ${
                  isPlaying ? "animate-pulse" : ""
                }`}
                style={{
                  height: `${isPlaying ? Math.max(20, (h * (i % 2 === 0 ? 1 : 0.7))) : 30}%`,
                  opacity: i / 18 < (progressPercent / 100) ? 1 : 0.35,
                  backgroundColor: i / 18 < (progressPercent / 100) ? "#38bdf8" : "#64748b",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChatMessageItem: React.FC<ChatMessageProps> = ({
  message,
  settings,
  isSpeaking,
  onToggleMessageSpeech,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const isUser = message.role === "user";
  const personaConfig = PERSONA_CONFIGS[settings.persona] || PERSONA_CONFIGS.hardware_laptop;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <>
      <div
        className={`group flex w-full gap-3 p-4 md:px-6 transition-colors ${
          isUser
            ? "bg-[#0b1329]/70 text-slate-100"
            : "bg-[#070e1b] text-slate-200 border-y border-slate-800/40"
        }`}
      >
        {/* Avatar Icon */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm">
              <User className="h-5 w-5" />
            </div>
          ) : (
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-cyan-400/40 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <img
                src="/src/assets/images/darbs_logo_1791717510434.jpg"
                alt="DARBS Assistant"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Message Content Body */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {/* Header with name, persona badge, timestamp, speech toggle, copy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-white">
                {isUser ? "You (Technician)" : "DARBS"}
              </span>

              {!isUser && (
                <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  {personaConfig.badge || "Laptop Troubleshooter"}
                </span>
              )}

              {message.imageUrl && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-500/20">
                  <FileImage className="h-2.5 w-2.5" />
                  <span>Hardware Photo</span>
                </span>
              )}

              {message.audioUrl && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/20">
                  <Mic className="h-2.5 w-2.5" />
                  <span>Voice Note</span>
                </span>
              )}

              <span className="text-[11px] text-slate-400">
                {message.timestamp}
              </span>
            </div>

            {!isUser && (
              <div className="flex items-center gap-1">
                {/* Speaking Read Button */}
                <button
                  onClick={() => onToggleMessageSpeech(message.content, message.id)}
                  className={`flex items-center gap-1 rounded-md p-1.5 text-xs transition-colors ${
                    isSpeaking
                      ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  title={isSpeaking ? "Stop Speaking" : "Read Aloud (Text to Speech)"}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                      <span className="text-[10px] font-semibold text-cyan-300 hidden sm:inline">
                        Stop
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                        Speak
                      </span>
                    </>
                  )}
                </button>

                {/* Copy Message */}
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 rounded-md p-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  title="Copy Response"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Uploaded Photo Display */}
          {message.imageUrl && (
            <div className="my-2.5 max-w-sm rounded-2xl border border-slate-700 bg-slate-950/70 p-1.5 shadow-lg">
              <div className="relative group/img overflow-hidden rounded-xl cursor-pointer" onClick={() => setShowImageLightbox(true)}>
                <img
                  src={message.imageUrl}
                  alt="Uploaded hardware or diagnostic screenshot"
                  className="max-h-64 w-full object-cover rounded-lg group-hover/img:scale-[1.02] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-xs transition-opacity">
                  <Maximize2 className="h-4 w-4" />
                  <span>Click to Expand</span>
                </div>
              </div>
              <p className="mt-1.5 px-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Diagnostic Image Attached</span>
                <span className="text-cyan-400 cursor-pointer" onClick={() => setShowImageLightbox(true)}>View full size</span>
              </p>
            </div>
          )}

          {/* Voice Message Audio Player */}
          {message.audioUrl && (
            <VoiceMessagePlayer
              audioUrl={message.audioUrl}
              duration={message.audioDuration}
              isUser={isUser}
            />
          )}

          {/* Message Error Warning */}
          {message.isError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{message.content}</span>
            </div>
          )}

          {/* Markdown Rendered Content */}
          {!message.isError && (
            <div className="prose prose-invert prose-sm max-w-none text-xs md:text-sm text-slate-200 leading-relaxed space-y-2">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="mb-2 list-disc pl-4 space-y-1 text-slate-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2 list-decimal pl-4 space-y-1 text-slate-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-snug">{children}</li>,
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold text-white mt-3 mb-1.5 pb-1 border-b border-slate-800">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold text-cyan-300 mt-2.5 mb-1 flex items-center gap-1.5">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-semibold text-slate-200 mt-2 mb-1">
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-cyan-500/60 bg-cyan-950/20 pl-3 py-1.5 rounded-r-lg text-xs italic text-cyan-200 my-2">
                      {children}
                    </blockquote>
                  ),
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeContent = String(children).replace(/\n$/, "");

                    if (!inline) {
                      const codeIndex = Math.random();
                      return (
                        <div className="relative my-2.5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs shadow-inner">
                          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-400">
                            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                              <Terminal className="h-3.5 w-3.5" />
                              <span>{match ? match[1] : "Command / Script"}</span>
                            </div>
                            <button
                              onClick={() => handleCopyCode(codeContent, codeIndex as any)}
                              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                              {copiedCodeIndex === (codeIndex as any) ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="overflow-x-auto p-3 text-cyan-300 font-mono">
                            <code>{codeContent}</code>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code
                        className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 border border-slate-700"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Web Search Sources list if available */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Technical Documentation & Grounding Sources ({message.sources.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-cyan-300 hover:border-cyan-500 hover:bg-slate-700 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{src.title}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {showImageLightbox && message.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageLightbox(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800 transition-colors"
              title="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={message.imageUrl}
              alt="Hardware diagnostic photo"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
