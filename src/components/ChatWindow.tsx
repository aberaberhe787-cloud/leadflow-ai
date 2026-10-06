import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { MessageBubble } from './MessageBubble';
import { SuggestionChips } from './SuggestionChips';
import type { Message } from '../types/lead';
import { Send, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onOptionClick: (option: string) => void;
  onSuggestedQuestion: (q: string) => void;
  stage: string;
}

export function ChatWindow({
  messages,
  isTyping,
  onSend,
  onOptionClick,
  onSuggestedQuestion,
  stage,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [stage, isTyping]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scroll-smooth">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onOptionClick={onOptionClick}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4 animate-fade-in">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-sm text-slate-400">LeadFlow AI is thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only on welcome and after full qualification */}
      {(stage === 'welcome' || stage === 'complete') && !isTyping && (
        <SuggestionChips
          onSelect={onSuggestedQuestion}
          disabled={isTyping}
        />
      )}

      {/* Input */}
      <div className="border-t border-slate-800/80 bg-slate-950/50 px-4 sm:px-6 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer…"
            disabled={isTyping}
            className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
