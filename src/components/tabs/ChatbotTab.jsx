import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Mic,
  Volume2
} from 'lucide-react';
import { translations } from '../../data/translations.js';
import { useAuth } from '../../context/AuthContext.jsx';

import { AiVoiceAssistant } from '../voice/AiVoiceAssistant.jsx';

export function ChatbotTab({ profile = {}, lang }) {
  const t = translations[lang] ?? translations.en;
  const { apiFetch, user } = useAuth();
  const chatbotCopy = typeof t.aiChatbot === 'object'
    ? t.aiChatbot
    : {
        title: typeof t.aiChatbot === 'string' ? t.aiChatbot : 'AI Career Counselor',
        subtitle: lang === 'ur' ? 'اپنے کیریئر کے بارے میں فوری رہنمائی حاصل کریں' : 'Get immediate guidance for your academic and career journey.',
        typing: lang === 'ur' ? 'جواب تیار کیا جا رہا ہے' : 'Preparing your answer',
        inputPlaceholder: lang === 'ur' ? 'اپنا سوال لکھیں...' : 'Ask about careers, universities, jobs, or scholarships...',
      };
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const displayName = profile?.name || 'Student';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: lang === 'ur'
        ? `السلام علیکم ${displayName}! میں آپ کا نیکسٹ سٹیپ (NexStep) AI کیریئر کونسلر ہوں۔ آپ اپنے کیریئر، یونیورسٹی فیس، انٹری ٹیسٹ (MDCAT/ECAT) یا سکالرشپ کے بارے میں کچھ بھی پوچھ سکتے ہیں۔`
        : `Assalam-o-Alaikum ${displayName}! I am your NexStep AI Career Counselor powered by Google Gemini. Ask me anything about MDCAT cutoffs, university fee structures, TEVTA trades, or scholarship options in Pakistan.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);

  // Load latest conversation history from DB on mount
  useEffect(() => {
    if (!user || !apiFetch) return;
    apiFetch('/api/conversations?limit=1').then(r => r.ok ? r.json() : null).then(data => {
      const convs = data?.data || data?.conversations || [];
      if (convs.length > 0) {
        const latest = convs[0];
        setConversationId(latest.id);
        // Load messages for this conversation
        apiFetch(`/api/conversations/${latest.id}/messages`).then(r => r.ok ? r.json() : null).then(msgData => {
          const dbMsgs = msgData?.data || msgData?.messages || [];
          if (dbMsgs.length > 0) {
            const formatted = dbMsgs.map((m, i) => ({
              id: i + 10,
              sender: m.role === 'user' ? 'user' : 'ai',
              text: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));
            setMessages(prev => {
              // Keep the welcome message, add history after
              const welcome = prev[0];
              return [welcome, ...formatted];
            });
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [user]);

  const suggestedPrompts = lang === 'ur' ? [
    "میٹرک میں 80٪ نمبروں کے بعد کون سا گروپ بہتر ہے؟",
    "MDCAT اور NUMS کے ٹیسٹ کا میرٹ فارمولا کیا ہے؟",
    "پاکستان میں الیکٹریکل انجینئرنگ بمقابلہ کمپیوٹر سائنس کا کیا سکوپ ہے؟",
    "ایچ ای سی اور ایحساس سکالرشپ کے لیے کون سے طلباء اہل ہیں؟",
    "ٹیوٹا (TEVTA) کے سولر اور روبوٹکس کے مفت کورسز کی تفصیل بتائیں۔"
  ] : [
    "What is the expected merit cutoff for MBBS in public medical colleges?",
    "Should I choose ICS Computer Science or Pre-Engineering after Matric?",
    "How do I apply for the Ehsaas & PEEF Undergraduate Scholarships?",
    "What are the top 5 HEC-ranked universities for Software Engineering in Islamabad?",
    "What free IT courses are available on DigiSkills.pk and Google Certifications?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: lang,
          profile: profile
        })
      });

      const data = await response.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply || 'I apologize, but I could not process your query. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      let fallbackText = "Assalamu Alaikum! Network or AI API rate limit detected. Here is offline guidance from NexStep Guidance Engine:\n\n1. F.Sc Streams: Pre-Medical requires 60%+ in Matric for MDCAT; ICS leads directly to Software Engineering.\n2. Scholarships: Check Ehsaas Undergraduate Scholarship or PEEF Punjab for 100% tuition coverage.\n3. TEVTA: 1-Year DIT & NAVTTC bootcamps offer monthly stipends and high job placement.";
      if (query.toLowerCase().includes('scholarship')) {
        fallbackText = "[Offline Rule Fallback] Top Scholarships in Pakistan:\n- Ehsaas Undergraduate: 100% tuition + PKR 4,000 stipend.\n- PEEF Punjab: Need-based & merit for Intermediate & Bachelor level.\n- HEC Need-Based: Covers public sector university tuition fees.";
      } else if (query.toLowerCase().includes('medical') || query.toLowerCase().includes('mdcat')) {
        fallbackText = "[Offline Rule Fallback] MDCAT Medical Eligibility:\n- F.Sc Pre-Medical aggregate 60%+ minimum.\n- Merit formula: 50% F.Sc + 50% MDCAT entrance test score.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 min-h-[calc(100vh-12rem)] flex flex-col">
      {/* Voice Assistant Overlay / Mode */}
      {showVoiceAssistant ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800 text-white">
            <span className="text-xs font-bold flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              NexStep AI Voice Assistant Mode Active
            </span>
            <button
              onClick={() => setShowVoiceAssistant(false)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              Switch to Text Chat
            </button>
          </div>
          <AiVoiceAssistant profile={profile} lang={lang} onClose={() => setShowVoiceAssistant(false)} />
        </div>
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">{chatbotCopy.title}</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Gemini 3.6 Flash
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{chatbotCopy.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVoiceAssistant(true)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Voice Assistant</span>
              </button>

              <button
                onClick={() => setMessages([messages[0]])}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                title="Clear Chat History"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 py-1">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-emerald-800 text-xs font-medium transition-all whitespace-nowrap shadow-xs shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-xs ${
                  isAi
                    ? 'bg-slate-50 border border-slate-200/80 text-slate-900 rounded-tl-none font-[Plus_Jakarta_Sans]'
                    : 'bg-emerald-600 text-white rounded-tr-none font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] text-right ${isAi ? 'text-slate-400' : 'text-emerald-200'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-slate-500 italic py-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>{chatbotCopy.typing}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="shrink-0 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex items-center gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={chatbotCopy.inputPlaceholder}
          className="flex-1 px-3 py-2 border-0 focus:ring-0 text-xs sm:text-sm text-slate-900 bg-transparent resize-none"
        />

        <button
          onClick={() => setShowVoiceAssistant(true)}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 flex items-center justify-center transition-colors shrink-0 border border-slate-200 cursor-pointer"
          title="Speak to AI Voice Assistant"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
        </>
      )}
    </div>
  );
}
