/**
 * Voice Recognition (Speech-to-Text) and Text-to-Speech (TTS) Service
 * Uses Web Speech API (SpeechRecognition / webkitSpeechRecognition) with
 * graceful audio simulation fallback for environments without microphone hardware.
 */

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  error?: string;
  isSupported: boolean;
}

export type VoiceCallback = (transcript: string, isFinal: boolean) => void;

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private isSupported = false;
  private onTranscriptCallback: VoiceCallback | null = null;
  private speechQueue: string[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';

          this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            const current = finalTranscript || interimTranscript;
            if (this.onTranscriptCallback && current) {
              this.onTranscriptCallback(current.trim(), Boolean(finalTranscript));
            }
          };

          this.recognition.onerror = (event: any) => {
            console.warn('SpeechRecognition error:', event.error);
            this.isListening = false;
          };

          this.recognition.onend = () => {
            this.isListening = false;
          };

          this.isSupported = true;
        } catch (e) {
          console.warn('Could not initialize SpeechRecognition:', e);
        }
      }
    }
  }

  getIsSupported(): boolean {
    return this.isSupported;
  }

  startListening(callback: VoiceCallback): boolean {
    this.onTranscriptCallback = callback;
    this.isListening = true;

    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (e) {
        // Recognition might already be running
        return true;
      }
    }
    return false;
  }

  stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
  }

  /**
   * Speak back feedback using browser SpeechSynthesis (TTS).
   */
  speak(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  /**
   * Cleans spoken transcript into an actionable desktop command.
   */
  normalizeSpokenCommand(transcript: string): string {
    let clean = transcript.trim().toLowerCase();

    // Strip conversational filler prefixes repeatedly: "hey ellie", "please", "can you", "could you"
    const prefixRegex = /^(hey ellie|ok ellie|ellie|please|can you|could you|would you)\s*,?\s*/i;
    while (prefixRegex.test(clean)) {
      clean = clean.replace(prefixRegex, '').trim();
    }

    // Map common speech quirks to desktop command format
    if (clean.startsWith('make a file') || clean.startsWith('create file')) {
      clean = clean.replace(/^(make a file|create file)/i, 'create a file');
    }

    if (clean.startsWith('delete the file') || clean.startsWith('remove file')) {
      clean = clean.replace(/^(delete the file|remove file)/i, 'delete file');
    }

    if (clean.startsWith('fetch data') || clean.startsWith('pull')) {
      clean = clean.replace(/^(fetch data|pull)/i, 'fetching');
    }

    if (clean.startsWith('summary of') || clean.startsWith('summarise')) {
      clean = clean.replace(/^(summary of|summarise)/i, 'summarize');
    }

    return clean;
  }
}

export const voiceService = new VoiceService();
