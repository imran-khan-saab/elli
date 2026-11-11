import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Activity, Play } from 'lucide-react';
import { voiceService } from '../utils/voiceService';

interface VoiceHUDProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({ isOpen, onClose, onExecuteCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [autoExecute, setAutoExecute] = useState(true);

  useEffect(() => {
    if (isOpen) {
      startVoiceListening();
    } else {
      stopVoiceListening();
    }

    return () => {
      stopVoiceListening();
    };
  }, [isOpen]);

  const startVoiceListening = () => {
    setIsListening(true);
    setTranscript('');
    setInterimText('');

    const started = voiceService.startListening((text, isFinal) => {
      if (isFinal) {
        const normalized = voiceService.normalizeSpokenCommand(text);
        setTranscript(normalized);
        setIsListening(false);

        if (autoExecute && normalized.trim()) {
          setTimeout(() => {
            onExecuteCommand(normalized);
            onClose();
          }, 600);
        }
      } else {
        setInterimText(text);
      }
    });

    if (!started) {
      // Fallback message if SpeechRecognition is not available
      setInterimText('Microphone active. Speak your command or select a voice prompt below...');
    }
  };

  const stopVoiceListening = () => {
    setIsListening(false);
    voiceService.stopListening();
  };

  const handleSimulateSpeech = (phrase: string) => {
    const normalized = voiceService.normalizeSpokenCommand(phrase);
    setTranscript(normalized);
    voiceService.speak(`Executing command: ${normalized}`);
    setTimeout(() => {
      onExecuteCommand(normalized);
      onClose();
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-blue-500/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-white space-y-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Ellie Voice Whisper Listener</h3>
              <p className="text-[11px] text-slate-400">Speak naturally to command your desktop</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close voice listener"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Waveform & Listening Orb */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <button
            onClick={() => (isListening ? stopVoiceListening() : startVoiceListening())}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
              isListening
                ? 'bg-gradient-to-tr from-blue-600 to-sky-400 ring-8 ring-blue-500/30 animate-pulse'
                : 'bg-slate-800 border-2 border-slate-700 text-slate-400'
            }`}
            title={isListening ? 'Click to pause' : 'Click to start listening'}
          >
            {isListening ? (
              <Mic className="w-10 h-10 text-white" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </button>

          {/* Sound wave bars */}
          <div className="flex items-center gap-1.5 h-6">
            {[40, 75, 95, 60, 85, 100, 70, 50, 80, 45].map((h, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-full bg-blue-500 transition-all duration-150 ${
                  isListening ? 'animate-pulse' : 'opacity-30'
                }`}
                style={{
                  height: isListening ? `${Math.max(8, h * 0.25)}px` : '4px',
                  animationDelay: `${idx * 80}ms`,
                }}
              />
            ))}
          </div>

          <p className="text-xs font-mono text-blue-400 font-semibold tracking-wider uppercase">
            {isListening ? 'Listening for speech...' : 'Microphone Paused'}
          </p>
        </div>

        {/* Live Transcript Display */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 min-h-[72px]">
          <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider block">
            Recognized Command:
          </span>
          <p className="text-sm text-slate-100 font-medium">
            {transcript || interimText || (
              <span className="text-slate-500 italic">
                Speak now e.g. "create a file index.html" or "summarize recent reports"...
              </span>
            )}
          </p>
        </div>

        {/* Quick Voice Prompt Shortcuts */}
        <div>
          <span className="text-[11px] text-slate-400 font-medium block mb-2">
            Or tap to speak sample command:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              'create a file auth_middleware.ts',
              'summarize /agent_workspace/notes.txt',
              'fetching server telemetry metrics',
              'delete file .cache/temp_build.log',
            ].map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleSimulateSpeech(phrase)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700/80 hover:border-blue-500/40 text-left text-slate-200 hover:text-white transition-all flex items-center justify-between group"
              >
                <span className="truncate">🗣️ "{phrase}"</span>
                <Play className="w-3 h-3 text-slate-400 group-hover:text-blue-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-400">
            <input
              type="checkbox"
              checked={autoExecute}
              onChange={(e) => setAutoExecute(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Execute automatically on silence</span>
          </label>

          {transcript && (
            <button
              onClick={() => {
                onExecuteCommand(transcript);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Execute Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
