import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bot, 
  User, 
  Globe, 
  RefreshCw, 
  Radio, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Square,
  Languages,
  Sliders,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { translations } from '../../data/translations.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function AiVoiceAssistant({ profile = { name: 'Student' }, lang = 'en', onClose }) {
  const t = translations[lang] || translations.en;
  const { user } = useAuth();

  // Voice & Language state
  const [voiceLang, setVoiceLang] = useState(lang === 'ur' ? 'ur-PK' : 'en-US'); // 'en-US' or 'ur-PK'
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoListen, setAutoListen] = useState(true); // Hands-free continuous mode
  const [speechMuted, setSpeechMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); // Real-time volume 0-100 for waveform

  const displayName = (
    profile?.name?.trim() ||
    user?.name?.trim() ||
    (user?.firstName && `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim()) ||
    (voiceLang === 'ur-PK' ? 'طالب علم' : 'Student')
  );

  const makeWelcome = useCallback(() => ({
    id: 1,
    sender: 'ai',
    text: voiceLang === 'ur-PK'
      ? `السلام علیکم ${displayName}! میں آپ کا نکسٹ سٹیپ AI وائس اسسٹنٹ ہوں۔ بولیں، میں سن رہا ہوں۔`
      : `Assalam-o-Alaikum ${displayName}! I am your NexStep AI Voice Assistant. Speak now, I am listening!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }), [displayName, voiceLang]);

  // Live transcript & history
  const [liveTranscript, setLiveTranscript] = useState('');
  const [conversation, setConversation] = useState(() => [makeWelcome()]);

  // When the user updates their profile name or switches language,
  // regenerate the welcome message (id === 1) so it never shows a stale name.
  useEffect(() => {
    setConversation(prev => {
      if (!prev.length) return [makeWelcome()];
      return prev.map(m => m.id === 1 ? makeWelcome() : m);
    });
  }, [makeWelcome]);

  // Audio & Web Speech Refs
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const messagesEndRef = useRef(null);

  // Suggested Prompts
  const samplePrompts = voiceLang === 'ur-PK' ? [
    "میٹرک کے بعد کون سا گروپ بہتر ہے؟",
    "MDCAT کی تیاری کے لیے کیا مشورہ ہے؟",
    "احساس سکالرشپ کا فارم کیسے بھریں؟",
    "پاکستان میں AI انجینئرنگ کا کیا سکوپ ہے؟"
  ] : [
    "What are the best IT career options after FSc?",
    "How to prepare for NUST entry test (NET)?",
    "Tell me about Ehsaas Undergraduate Scholarship.",
    "Which university is best for Software Engineering?"
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsListening(true);
        setLiveTranscript('');
        startAudioVisualizer();
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setLiveTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        stopAudioVisualizer();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioVisualizer();
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      stopAudioVisualizer();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [voiceLang]);

  // Handle auto-submit transcript when user stops speaking
  useEffect(() => {
    if (!isListening && liveTranscript.trim().length > 2) {
      const query = liveTranscript;
      setLiveTranscript('');
      handleUserVoiceInput(query);
    }
  }, [isListening]);

  // Web Audio API Microphone Real-Time Amplitude Analyzer
  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      // Audio stream blocked or unsupported, fallback to simulated waveform
      simulateVolumeWave();
    }
  };

  const simulateVolumeWave = () => {
    let step = 0;
    const interval = setInterval(() => {
      if (!isListening && !isSpeaking) {
        setAudioVolume(0);
        clearInterval(interval);
        return;
      }
      step += 0.2;
      const simVal = Math.floor(Math.abs(Math.sin(step)) * 75) + 15;
      setAudioVolume(simVal);
    }, 100);
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    setAudioVolume(0);
  };

  // Toggle Mic Listening
  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      stopAudioVisualizer();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = voiceLang;
          recognitionRef.current.start();
        } catch (e) {
          console.error("Mic start failed", e);
        }
      } else {
        alert("Web Speech API is not supported in this browser. Please try Chrome, Edge, or Safari.");
      }
    }
  };

  // Send query to Gemini AI API and speak response out loud
  const handleUserVoiceInput = async (textQuery) => {
    if (!textQuery || isProcessing) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversation(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textQuery,
          language: voiceLang.startsWith('ur') ? 'ur' : 'en',
          profile: profile
        })
      });

      const data = await response.json();
      const aiReply = data.reply || "I am here to guide your career path. Please ask your question!";

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversation(prev => [...prev, aiMsg]);

      // Speak response out loud
      if (!speechMuted) {
        speakText(aiReply);
      }
    } catch (err) {
      console.error("Voice AI fetch error:", err);
      const errorReply = voiceLang.startsWith('ur')
        ? "معذرت، انٹرنیٹ کنکشن کا مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔"
        : "I'm having trouble connecting to NexStep AI. Please try again.";
      
      setConversation(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: errorReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (!speechMuted) speakText(errorReply);
    } finally {
      setIsProcessing(false);
    }
  };

  // Speak AI Text using SpeechSynthesis
  const speakText = (textToSpeak) => {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Stop ongoing speech

    // Clean text from markdown asterisks for smoother TTS
    const cleanText = textToSpeak.replace(/[*#_~`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLang;
    utterance.rate = voiceLang.startsWith('ur') ? 0.95 : 1.0; // Slightly calmer for Urdu
    utterance.pitch = 1.0;

    // Try finding best voice match
    const voices = synthRef.current.getVoices();
    const targetLangCode = voiceLang.startsWith('ur') ? 'ur' : 'en';
    const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(targetLangCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      simulateVolumeWave();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setAudioVolume(0);

      // If continuous hands-free mode is on, restart listening automatically!
      if (autoListen && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.lang = voiceLang;
            recognitionRef.current.start();
          } catch (e) {}
        }, 600);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setAudioVolume(0);
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setAudioVolume(0);
  };

  // Switch voice language (English / Urdu)
  const handleLangSwitch = (newLang) => {
    stopSpeaking();
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    setVoiceLang(newLang);
    const welcomeText = newLang === 'ur-PK'
      ? `اردو وائس موڈ آن ہو گیا ہے۔ آپ کیریئر کے بارے میں کوئی بھی سوال پوچھ سکتے ہیں۔`
      : `Switched to English Voice Assistant mode. How can NexStep AI help your career today?`;

    setConversation(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (!speechMuted) {
      setTimeout(() => speakText(welcomeText), 200);
    }
  };

  // Scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, liveTranscript, isProcessing]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 overflow-hidden relative flex flex-col min-h-[580px] justify-between">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">NexStep AI Voice Assistant</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                Bilingual Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conversational Career Counselor in English &amp; اردو
            </p>
          </div>
        </div>

        {/* Controls: Language & Close */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Pills */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleLangSwitch('en-US')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                voiceLang === 'en-US'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN 🇬🇧
            </button>
            <button
              onClick={() => handleLangSwitch('ur-PK')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                voiceLang === 'ur-PK'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              اردو 🇵🇰
            </button>
          </div>

          {/* Mute AI Speech Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setSpeechMuted(!speechMuted);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              speechMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={speechMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {speechMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="relative z-10 my-6 py-6 bg-slate-950/60 rounded-3xl border border-slate-800/80 p-6 flex flex-col items-center justify-center space-y-5">
        {/* Central Orb & Waveform Display */}
        <div className="relative flex items-center justify-center">
          {/* Animated Radial Waves during Active Voice */}
          {(isListening || isSpeaking) && (
            <>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="absolute w-44 h-44 rounded-full bg-emerald-500/20 blur-xl pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1.2, 1.7, 1.2], opacity: [0.4, 0.05, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.3 }}
                className="absolute w-52 h-52 rounded-full bg-teal-400/15 blur-2xl pointer-events-none"
              />
            </>
          )}

          {/* Center Mic / Orb Controller */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all ${
              isListening
                ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 ring-8 ring-emerald-500/30 text-slate-950'
                : isSpeaking
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 ring-8 ring-emerald-500/30 text-white'
                : isProcessing
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 ring-8 ring-amber-500/30 text-slate-950 animate-pulse'
                : 'bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white'
            }`}
          >
            {isListening ? (
              <Mic className="w-12 h-12 text-slate-950 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-12 h-12 text-white animate-pulse" />
            ) : isProcessing ? (
              <Sparkles className="w-12 h-12 text-slate-950 animate-spin" />
            ) : (
              <Mic className="w-12 h-12 text-emerald-400" />
            )}
          </motion.button>
        </div>

        {/* Dynamic 24-Bar Equalizer Audio Spectrum Waveform */}
        <div className="w-full max-w-md h-16 flex items-center justify-center gap-1 sm:gap-1.5 px-4">
          {Array.from({ length: 24 }).map((_, i) => {
            // Calculate height based on real/simulated audio volume and bar index
            const offset = Math.sin((i / 24) * Math.PI);
            const dynamicHeight = (isListening || isSpeaking)
              ? Math.max(8, Math.min(60, (audioVolume * offset) + Math.random() * 20))
              : isProcessing
              ? Math.max(8, Math.sin(Date.now() / 150 + i) * 25 + 28)
              : 6;

            return (
              <motion.div
                key={i}
                animate={{ height: `${dynamicHeight}px` }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className={`w-1.5 sm:w-2 rounded-full transition-colors ${
                  isListening
                    ? 'bg-gradient-to-t from-emerald-600 via-teal-400 to-emerald-300 shadow-xs shadow-emerald-500/50'
                    : isSpeaking
                    ? 'bg-gradient-to-t from-emerald-500 via-teal-400 to-emerald-300 shadow-xs shadow-emerald-500/50'
                    : isProcessing
                    ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide">
          {isListening ? (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LISTENING TO YOUR VOICE ({voiceLang === 'ur-PK' ? 'اردو' : 'ENGLISH'})...
            </span>
          ) : isSpeaking ? (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NEXSTEP AI IS SPEAKING OUT LOUD...
            </span>
          ) : isProcessing ? (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              THINKING &amp; GENERATING COUNSELING RESPONSE...
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              Tap the central microphone to speak or choose a sample question below.
            </span>
          )}
        </div>

        {/* Live Intermediary Speech Transcript */}
        {liveTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold text-center shadow-lg"
          >
            &ldquo;{liveTranscript}&rdquo;
          </motion.div>
        )}
      </div>

      {/* Preset Quick Voice Questions */}
      <div className="relative z-10 space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
          <span>{voiceLang === 'ur-PK' ? 'نمونہ سوالات (کلک کریں):' : 'Sample Voice Questions:'}</span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={autoListen}
                onChange={(e) => setAutoListen(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              Continuous Hands-Free Mode
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                handleUserVoiceInput(prompt);
              }}
              disabled={isProcessing || isListening}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 text-slate-200 hover:text-white text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer group disabled:opacity-50"
            >
              <span className="line-clamp-1">{prompt}</span>
              <Mic className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Voice Conversation Transcript Feed */}
      <div className="relative z-10 flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 max-h-56 overflow-y-auto space-y-3 shadow-inner">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-800 flex items-center justify-between">
          <span>Voice Transcript History</span>
          <button
            onClick={() => setConversation([conversation[0]])}
            className="text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Clear Log
          </button>
        </div>

        {conversation.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  isAi
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    : 'bg-emerald-600 text-white rounded-tr-none font-medium'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className={`text-[9px] ${isAi ? 'text-slate-500' : 'text-emerald-200'}`}>
                    {msg.timestamp}
                  </span>
                  {isAi && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" /> Replay Voice
                    </button>
                  )}
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default AiVoiceAssistant;
