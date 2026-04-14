import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Loader2, Sparkles, Trash2 } from "lucide-react";
import { generateResponseStream } from "../services/gemini";
import { cn } from "../lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      let fullContent = "";
      const stream = generateResponseStream(input, "You are Aura AI, a sophisticated creative assistant. Your tone is professional, insightful, and slightly futuristic. Keep responses concise unless asked for detail.");
      
      for await (const chunk of stream) {
        if (chunk) {
          fullContent += chunk;
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMessageId 
            ? { ...msg, content: "I encountered an error processing your request. Please check your connection and try again." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aura-accent/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-aura-accent" />
          </div>
          <div>
            <h2 className="font-medium">Aura Assistant</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Powered by Gemini 3.0</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-white/20 hover:text-white/60 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Bot className="w-12 h-12 mb-2" />
            <p className="text-sm">How can I assist your creative process today?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Generate a concept", "Analyze data", "Write a story"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 glass rounded-full text-xs hover:bg-white/5 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.role === "user" ? "bg-white/10" : "bg-aura-accent/20"
              )}>
                {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-aura-accent" />}
              </div>
              <div className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === "user" ? "bg-white/5 text-white/90" : "glass text-white/80"
              )}>
                {message.content || (isLoading && message.role === "assistant" && <Loader2 className="w-4 h-4 animate-spin opacity-50" />)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Aura anything..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-aura-accent/50 transition-colors text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-aura-accent text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
