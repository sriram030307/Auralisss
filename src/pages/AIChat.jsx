import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Send, Bot, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const quickPrompts = [
  "Is my area safe right now?",
  "What should I do if I'm being followed?",
  "Give me nighttime safety tips",
  "How to set up safe zones?",
];

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Auralis AI safety assistant. 🛡️ I can help you with safety tips, emergency guidance, area safety analysis, and more. How can I help keep you safe today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Auralis, an AI personal safety assistant. Be concise, helpful, and empathetic. Focus on safety advice, emergency guidance, and situational awareness. User message: ${userMsg}`,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen pt-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pb-4 flex items-center gap-3"
      >
        <button onClick={() => navigate("/")} className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold">Auralis AI</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-muted-foreground">Always online</span>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-sm"
                    : "glass rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-xs text-muted-foreground font-medium">Quick prompts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                className="glass text-xs px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 glass-strong">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about safety..."
            className="flex-1 h-12 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground/50"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}