import type { Message } from '../types/lead';
import { FEATURES } from '../data/qualificationQuestions';
import { Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onOptionClick?: (option: string) => void;
}

export function MessageBubble({ message, onOptionClick }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${
          isAssistant
            ? 'bg-slate-800/80 border border-slate-700/60 text-slate-100'
            : 'bg-indigo-600 text-white'
        } rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm`}
      >
        {isAssistant && (
          <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            LeadFlow AI
          </div>
        )}

        {/* Text content */}
        {message.content && message.type !== 'recommendation' && message.type !== 'features' && (
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* Option chips */}
        {message.type === 'options' && message.options && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onOptionClick?.(opt)}
                className="px-3.5 py-2 text-sm rounded-xl bg-slate-700/70 hover:bg-indigo-600/80 border border-slate-600/50 hover:border-indigo-500/60 text-slate-200 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Recommendation card */}
        {message.type === 'recommendation' && message.recommendation && (
          <div className="space-y-4">
            <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
            <div className="bg-gradient-to-br from-slate-900/90 to-indigo-950/50 border border-indigo-500/30 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <TrendingUp className="w-4 h-4" />
                Lead Summary
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">Name:</span>{' '}
                  <span className="text-white font-medium">
                    {message.recommendation.leadSummary.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Industry:</span>{' '}
                  <span className="text-white font-medium">
                    {message.recommendation.leadSummary.industry}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Company Size:</span>{' '}
                  <span className="text-white font-medium">
                    {message.recommendation.leadSummary.companySize}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Challenge:</span>{' '}
                  <span className="text-white font-medium">
                    {message.recommendation.leadSummary.challenge}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                  Recommendation
                </p>
                <p className="text-indigo-300 font-semibold text-base">
                  {message.recommendation.recommendation}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                  Expected Benefits
                </p>
                <ul className="space-y-1.5">
                  {message.recommendation.expectedBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span className="text-slate-400 text-xs uppercase tracking-wider">
                  Lead Quality
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    message.recommendation.leadQuality === 'High Potential'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : message.recommendation.leadQuality === 'Medium Potential'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                  }`}
                >
                  {message.recommendation.leadQuality}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Features grid */}
        {message.type === 'features' && (
          <div className="space-y-3">
            <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/40"
                >
                  <span className="text-base">{f.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
