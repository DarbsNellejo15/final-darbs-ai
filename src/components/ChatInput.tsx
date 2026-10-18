import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Globe,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Mic,
  MicOff,
  X,
  Square,
  AlertCircle,
  FileImage,
  Radio,
} from "lucide-react";
import { AppSettings } from "../types";
import { STARTER_PROMPTS } from "../data/prompts";

interface ChatInputProps {
  onSendMessage: (
    text: string,
    imageUrl?: string,
    audioData?: {
      url: string;
      duration: number;
      dataUrl: string;
    }
  ) => void;
  isLoading: boolean;
  settings: AppSettings;
  onToggleWebSearch: () => void;
  onSelectPrompt: (promptText: string) => void;
  showStarterChips: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  settings,
  onToggleWebSearch,
  onSelectPrompt,
  showStarterChips,
}) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Handle image upload from file picker
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG, JPG, WebP).");
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be re-selected if deleted
    e.target.value = "";
  };

  // Handle clipboard paste of images
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          setImageName(file.name || "pasted-diagnostic-screenshot.png");
          const reader = new FileReader();
          reader.onload = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  // Start voice message recording
  const startRecording = async () => {
    setRecordingError(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Optional live speech recognition for real-time transcription
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let transcriptText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcriptText += event.results[i][0].transcript;
            }
            if (transcriptText.trim()) {
              setInput((prev) =>
                prev ? `${prev} ${transcriptText.trim()}` : transcriptText.trim()
              );
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Speech recognition notice:", e.error);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (err) {
          console.warn("SpeechRecognition init error:", err);
        }
      }
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setRecordingError(
        "Microphone access denied or unavailable. Please enable microphone permissions in your browser."
      );
      setIsRecording(false);
    }
  };

  // Stop recording and send voice message
  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    const recordedDuration = recordingSeconds || 1;

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop all audio stream tracks
      mediaRecorderRef.current?.stream
        .getTracks()
        .forEach((track) => track.stop());

      if (audioBlob.size > 12 * 1024 * 1024) {
        URL.revokeObjectURL(audioUrl);
        setRecordingError("This recording is too large to send. Please record a shorter voice note.");
        setIsRecording(false);
        setRecordingSeconds(0);
        return;
      }

      // Prepare text: if user spoke something, use input or a default voice message note
      const messageContent =
        input.trim() ||
        "🎙️ [Voice Diagnostic Note: Technician recorded audio message describing symptoms]";

      const reader = new FileReader();
      reader.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setRecordingError("The voice recording could not be prepared. Please try again.");
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          URL.revokeObjectURL(audioUrl);
          setRecordingError("The voice recording could not be prepared. Please try again.");
          setIsRecording(false);
          setRecordingSeconds(0);
          return;
        }

        onSendMessage(messageContent, selectedImage || undefined, {
          url: audioUrl,
          duration: recordedDuration,
          dataUrl: reader.result,
        });

        setInput("");
        setSelectedImage(null);
        setImageName(null);
        setIsRecording(false);
        setRecordingSeconds(0);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorderRef.current.stop();
  };

  // Cancel recording without sending
  const cancelRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const messageContent =
      input.trim() ||
      (selectedImage
        ? "Please analyze this hardware component / error screen photo."
        : "");

    onSendMessage(messageContent, selectedImage || undefined);
    setInput("");
    setSelectedImage(null);
    setImageName(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-slate-800/80 bg-[#070e1b]/95 p-3 md:p-4 backdrop-blur-md text-slate-100">
      <div className="mx-auto max-w-4xl space-y-3">
        {/* Starter Prompt Chips */}
        {showStarterChips && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Common Diagnostic & Repair Workflows:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => onSelectPrompt(starter.prompt)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0f1a36]/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500/60 hover:bg-cyan-950/40 hover:text-cyan-300 transition-all text-left shadow-sm"
                >
                  <span>{starter.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar Card */}
        <div className="relative rounded-2xl border border-slate-700 bg-[#0b1429] shadow-xl focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
          {/* Selected Image Thumbnail Preview */}
          {selectedImage && (
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 p-2.5 px-3">
              <div className="flex items-center gap-2.5 truncate">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-cyan-500/40 bg-slate-950">
                  <img
                    src={selectedImage}
                    alt="Diagnostic preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                    <FileImage className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="truncate">{imageName || "hardware-photo.jpg"}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Attached for DARBS AI Visual Hardware Diagnosis
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImageName(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
                title="Remove Attached Image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Active Voice Recording UI */}
          {isRecording ? (
            <div className="flex flex-col gap-2 p-3.5 bg-cyan-950/20 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="text-xs font-bold text-red-400">
                    Recording Voice Message
                  </span>
                  <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/30">
                    {formatSeconds(recordingSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopAndSendRecording}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-md hover:from-red-500 hover:to-rose-500 transition-all"
                  >
                    <Square className="h-3 w-3 fill-white" />
                    <span>Send Voice Message</span>
                  </button>
                </div>
              </div>

              {/* Sound Wave Animation Visualizer */}
              <div className="flex items-center gap-1 h-5 pt-1">
                {[40, 70, 95, 45, 80, 100, 60, 85, 30, 90, 75, 40, 90, 65, 85, 50, 95, 35, 70, 45].map(
                  (val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-full bg-cyan-400 animate-pulse"
                      style={{
                        height: `${Math.max(25, (val * ((idx % 3) + 1)) % 100)}%`,
                        animationDuration: `${0.4 + (idx % 4) * 0.15}s`,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          ) : (
            /* Standard Textarea Input */
            <textarea
              ref={textareaRef}
              id="chat-textarea-input"
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Describe your laptop issue, attach hardware photo, or record a voice note..."
              className="w-full resize-none border-0 bg-transparent px-4 py-3.5 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none max-h-48"
            />
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between border-t border-slate-800/80 px-3 py-2">
            <div className="flex items-center gap-1.5">
              {/* Hidden File Input for Photos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Upload Photo Button */}
              <button
                type="button"
                id="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  selectedImage
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:bg-slate-800 hover:text-cyan-400"
                }`}
                title="Upload Photo (Hardware, Motherboard, Cracked Screen, BSOD Stop Code)"
              >
                <ImageIcon className="h-4 w-4 text-cyan-400" />
                <span className="hidden sm:inline">
                  {selectedImage ? "Photo Attached" : "Upload Photo"}
                </span>
              </button>

              {/* Record Voice Message Button */}
              <button
                type="button"
                id="btn-voice-message"
                onClick={isRecording ? stopAndSendRecording : startRecording}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isRecording
                    ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                    : "text-slate-400 hover:bg-slate-800 hover:text-cyan-400"
                }`}
                title={isRecording ? "Stop & Send Voice Note" : "Record Voice Message"}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-400" />
                ) : (
                  <Mic className="h-4 w-4 text-cyan-400" />
                )}
                <span className="hidden sm:inline">
                  {isRecording ? "Recording..." : "Voice Message"}
                </span>
              </button>

              {/* Web Search Grounding Toggle */}
              <button
                id="btn-toggle-web-search"
                onClick={onToggleWebSearch}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  settings.enableWebSearch
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
                title="Toggle Live Web Search Grounding for latest drivers"
              >
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden md:inline">
                  {settings.enableWebSearch ? "Search ON" : "Search OFF"}
                </span>
              </button>
            </div>

            {/* Diagnose Issue Send Button */}
            <button
              id="btn-send-message"
              onClick={handleSubmit}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Diagnose Issue</span>
            </button>
          </div>
        </div>

        {/* Recording Error Notice if mic is blocked */}
        {recordingError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 p-2.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{recordingError}</span>
          </div>
        )}

        {/* Footer Disclaimer */}
        <p className="text-center text-[10px] md:text-[11px] text-slate-400">
          DARBS AI Multimodal Support: Attach hardware photos or voice notes for interactive <span className="font-semibold text-slate-300">DIAGNOSE → TEST → FIX → VERIFY</span> repair.
        </p>
      </div>
    </div>
  );
};
