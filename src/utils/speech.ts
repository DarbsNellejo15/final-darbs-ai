// Speech Synthesis Helper for DARBS (Web Speech API + Voice Note Support)

class SpeechController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private onStateChangeListeners: ((isSpeaking: boolean, speakingId: string | null) => void)[] = [];
  private currentSpeakingId: string | null = null;
  private audioPlayer: HTMLAudioElement | null = null;

  public subscribe(listener: (isSpeaking: boolean, speakingId: string | null) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notify(speaking: boolean, id: string | null) {
    this.isSpeaking = speaking;
    this.currentSpeakingId = id;
    this.onStateChangeListeners.forEach((l) => l(speaking, id));
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.audioPlayer = null;
    }
    this.notify(false, null);
  }

  public isCurrentlySpeaking(messageId?: string): boolean {
    if (messageId) {
      return this.isSpeaking && this.currentSpeakingId === messageId;
    }
    return this.isSpeaking;
  }

  public getSpeakingId(): string | null {
    return this.currentSpeakingId;
  }

  public async speak(text: string, messageId: string, voiceRate = 1.0, voiceName = "Kore") {
    // If currently speaking this message, toggle off / stop
    if (this.isSpeaking && this.currentSpeakingId === messageId) {
      this.stop();
      return;
    }

    // Stop any other active speech
    this.stop();

    // Clean text: strip markdown characters for natural speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.") // skip long raw code blocks
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    if (!cleanText) return;

    // First try Web Speech API
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = voiceRate || 1.0;
        utterance.pitch = 1.0;

        // Try to pick a high quality natural English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Samantha") ||
              v.name.includes("Daniel") ||
              v.name.includes("Alex") ||
              v.lang.startsWith("en")) &&
            v.lang.includes("en")
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          this.notify(true, messageId);
        };

        utterance.onend = () => {
          this.notify(false, null);
        };

        utterance.onerror = (e) => {
          console.warn("Web Speech API error, trying server fallback:", e);
          this.fallbackServerTTS(cleanText, messageId, voiceName);
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn("Failed to invoke Web Speech API:", err);
      }
    }

    // Fallback to server TTS
    await this.fallbackServerTTS(cleanText, messageId, voiceName);
  }

  private async fallbackServerTTS(text: string, messageId: string, voiceName: string) {
    try {
      this.notify(true, messageId);
      const res = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 800), voiceName }),
      });
      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || "TTS failed");
      }

      const audio = new Audio(
        `data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`
      );
      this.audioPlayer = audio;
      audio.onended = () => {
        this.notify(false, null);
      };
      audio.onerror = () => {
        this.notify(false, null);
      };
      await audio.play();
    } catch (e) {
      console.error("Server TTS playback failed:", e);
      this.notify(false, null);
    }
  }
}

export const speechController = new SpeechController();
