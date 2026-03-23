import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type LeadFormData = {
  name: string;
  email: string;
  phone: string;
};

// ─── Engagement: Teaser messages rotate every few seconds ────────
const TEASER_MESSAGES_EN = [
  "👋 Hi! Looking for homes in San Francisco?",
  "💬 Ask me anything about the Bay Area market",
  "🏠 I can help you find your dream home",
  "📊 Get instant market insights — try me!",
];

const TEASER_MESSAGES_ZH = [
  "👋 你好！在找旧金山的房子吗？",
  "💬 有任何房产问题都可以问我",
  "🏠 我可以帮你找到理想的家",
  "📊 获取实时市场分析 — 试试看！",
];

const SUGGESTED_PROMPTS_EN = [
  "What's the market like in San Francisco?",
  "How do I schedule a showing?",
  "Tell me about Noe Valley",
  "What should first-time buyers know?",
];

const SUGGESTED_PROMPTS_ZH = [
  "旧金山的房价行情怎么样？",
  "我想预约看房",
  "介绍一下 Noe Valley 社区",
  "首次买房需要注意什么？",
];

export default function FloatingChat({
  agentSlug = "jane",
  agentName = "Jane",
}: {
  agentSlug?: string;
  agentName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("kevv-chat-session");
    } catch {
      return null;
    }
  });
  const [messageCount, setMessageCount] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [detectedLang, setDetectedLang] = useState<"en" | "zh">("en");

  // ─── Engagement State ───────────────────────────────────────────
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [hasScrolledPast, setHasScrolledPast] = useState(false);
  const [wasEverOpened, setWasEverOpened] = useState(false);

  // Simple CJK detection for UI language adaptation
  const detectLang = (text: string): "en" | "zh" => {
    const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;
    const matches = text.match(cjkRegex);
    return matches && matches.length / text.length > 0.15 ? "zh" : "en";
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatMutation = trpc.chat.sendMessage.useMutation();
  const leadMutation = trpc.lead.capture.useMutation();

  // ─── Teaser Bubble: appears after 6 seconds, rotates messages ──
  useEffect(() => {
    if (isOpen || teaserDismissed || wasEverOpened) return;

    const showTimer = setTimeout(() => {
      setShowTeaser(true);
    }, 6000);

    return () => clearTimeout(showTimer);
  }, [isOpen, teaserDismissed, wasEverOpened]);

  // Rotate teaser messages every 4 seconds
  useEffect(() => {
    if (!showTeaser) return;
    const interval = setInterval(() => {
      setTeaserIndex((prev) => {
        const msgs = detectedLang === "zh" ? TEASER_MESSAGES_ZH : TEASER_MESSAGES_EN;
        return (prev + 1) % msgs.length;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showTeaser, detectedLang]);

  // ─── Scroll Trigger: show teaser when user scrolls past hero ──
  useEffect(() => {
    if (wasEverOpened || isOpen) return;

    const handleScroll = () => {
      // Trigger when user scrolls 40% down the page
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.4 && !hasScrolledPast) {
        setHasScrolledPast(true);
        if (!teaserDismissed) {
          setShowTeaser(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [wasEverOpened, isOpen, hasScrolledPast, teaserDismissed]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        });
      }
    }
  }, [messages, isLoading]);

  // Show lead form after 3 messages (if not already captured)
  useEffect(() => {
    if (messageCount >= 3 && !leadCaptured && !showLeadForm) {
      setShowLeadForm(true);
    }
  }, [messageCount, leadCaptured, showLeadForm]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setWasEverOpened(true);
    setShowTeaser(false);
    setTeaserDismissed(true);
  }, []);

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Detect language from user input
    const lang = detectLang(content);
    if (lang !== detectedLang) setDetectedLang(lang);

    try {
      const result = await chatMutation.mutateAsync({
        sessionId: sessionId || undefined,
        message: content.trim(),
        agentSlug,
      });

      // Persist session
      if (result.sessionId && result.sessionId !== sessionId) {
        setSessionId(result.sessionId);
        try {
          sessionStorage.setItem("kevv-chat-session", result.sessionId);
        } catch {}
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response },
      ]);
      setMessageCount(result.messageCount);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again or contact us directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email || !sessionId) return;

    setLeadSubmitting(true);
    try {
      await leadMutation.mutateAsync({
        sessionId,
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone || undefined,
        agentSlug,
      });
      setLeadCaptured(true);
      setShowLeadForm(false);
    } catch (error) {
      console.error("Failed to submit lead:", error);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const teaserMessages = detectedLang === "zh" ? TEASER_MESSAGES_ZH : TEASER_MESSAGES_EN;
  const currentTeaser = teaserMessages[teaserIndex % teaserMessages.length];

  return (
    <>
      {/* ─── Floating Button + Teaser Bubble ─── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Teaser Bubble - appears above the button */}
          {showTeaser && !teaserDismissed && (
            <div
              className="animate-in slide-in-from-bottom-2 fade-in duration-500 relative max-w-[280px] cursor-pointer"
              onClick={openChat}
            >
              <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-br-sm shadow-xl border border-border px-4 py-3 text-sm text-foreground">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTeaserDismissed(true);
                    setShowTeaser(false);
                  }}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted hover:bg-destructive hover:text-white flex items-center justify-center text-[10px] transition-colors shadow-sm"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
                <p className="leading-relaxed transition-opacity duration-300">
                  {currentTeaser}
                </p>
                <p className="text-[10px] text-primary font-medium mt-1.5 uppercase tracking-wider">
                  {detectedLang === "zh" ? "点击开始对话 →" : "Click to chat →"}
                </p>
              </div>
              {/* Triangle pointer */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-zinc-800 border-r border-b border-border rotate-45" />
            </div>
          )}

          {/* Chat Button */}
          <button
            onClick={openChat}
            className="group relative"
            aria-label="Chat with AI Assistant"
          >
            {/* Persistent gentle pulse */}
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "3s" }} />

            <div className="relative flex items-center gap-3 bg-primary text-primary-foreground pl-5 pr-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-bold tracking-wide">
                Chat with {agentName}
              </span>
              {/* Online indicator dot */}
              <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-primary animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center relative">
                <Sparkles className="h-4 w-4" />
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-primary" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">
                  {agentName}'s AI Assistant
                </p>
                <p className="text-[11px] opacity-80 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                  {detectedLang === "zh" ? "在线 · 由 Kevv AI 驱动" : "Online · Powered by Kevv AI"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col p-4">
                <div className="flex flex-1 flex-col items-center justify-center gap-5 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">
                        {detectedLang === "zh"
                          ? `你好！我是 ${agentName} 的 AI 助手`
                          : `Hi! I'm ${agentName}'s AI assistant`}
                      </p>
                      <p className="text-xs mt-1">
                        {detectedLang === "zh"
                          ? "可以问我任何关于房产、社区和买房流程的问题"
                          : "Ask me about properties, neighborhoods, or the home buying process"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {(detectedLang === "zh" ? SUGGESTED_PROMPTS_ZH : SUGGESTED_PROMPTS_EN).map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        disabled={isLoading}
                        className="text-left rounded-lg border border-border bg-card px-3 py-2 text-xs transition-all hover:bg-accent hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                    {/* Language toggle hint */}
                    <button
                      onClick={() => setDetectedLang(detectedLang === "en" ? "zh" : "en")}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors text-center mt-1"
                    >
                      {detectedLang === "en" ? "🇨🇳 切换中文" : "🇺🇸 Switch to English"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-3 p-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2.5",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="h-7 w-7 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-1.5 [&_p:last-child]:mb-0">
                            <Streamdown>{message.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="h-7 w-7 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="rounded-xl bg-muted px-3.5 py-2.5 rounded-bl-sm">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lead Capture Form - appears inline after 3 messages */}
                  {showLeadForm && !leadCaptured && (
                    <div className="my-2 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">
                          {detectedLang === "zh"
                            ? `希望 ${agentName} 亲自跟进？`
                            : `Want ${agentName} to follow up personally?`}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {detectedLang === "zh"
                          ? "留下联系方式，我会把对话摘要发给她，她会第一时间回复你"
                          : "Leave your info and I'll send her a summary of our chat — she'll reach out ASAP"}
                      </p>
                      <form
                        onSubmit={handleLeadSubmit}
                        className="flex flex-col gap-2"
                      >
                        <Input
                          placeholder={detectedLang === "zh" ? "您的姓名 *" : "Your name *"}
                          value={leadForm.name}
                          onChange={(e) =>
                            setLeadForm((f) => ({ ...f, name: e.target.value }))
                          }
                          className="h-9 text-sm bg-background"
                          required
                        />
                        <Input
                          type="email"
                          placeholder={detectedLang === "zh" ? "电子邮箱 *" : "Email address *"}
                          value={leadForm.email}
                          onChange={(e) =>
                            setLeadForm((f) => ({
                              ...f,
                              email: e.target.value,
                            }))
                          }
                          className="h-9 text-sm bg-background"
                          required
                        />
                        <Input
                          type="tel"
                          placeholder={detectedLang === "zh" ? "电话（选填）" : "Phone (optional)"}
                          value={leadForm.phone}
                          onChange={(e) =>
                            setLeadForm((f) => ({
                              ...f,
                              phone: e.target.value,
                            }))
                          }
                          className="h-9 text-sm bg-background"
                        />
                        <div className="flex gap-2 mt-1">
                          <Button
                            type="submit"
                            size="sm"
                            className="flex-1 h-9 text-xs font-bold uppercase tracking-wider"
                            disabled={leadSubmitting}
                          >
                            {leadSubmitting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              detectedLang === "zh" ? "联系我" : "Connect Me"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs"
                            onClick={() => setShowLeadForm(false)}
                          >
                            {detectedLang === "zh" ? "稍后" : "Later"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Lead captured confirmation */}
                  {leadCaptured && (
                    <div className="my-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center animate-in fade-in duration-300">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {detectedLang === "zh"
                          ? `✅ ${agentName} 会尽快联系您！`
                          : `✅ ${agentName} will reach out to you soon!`}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2 p-3 border-t bg-background/80 items-end"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={detectedLang === "zh" ? "输入房产相关问题..." : "Ask anything about real estate..."}
              className="flex-1 max-h-24 resize-none min-h-9 text-sm rounded-xl"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-9 w-9 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
