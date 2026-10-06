import { SUGGESTED_QUESTIONS } from '../data/qualificationQuestions';
import { MessageCircleQuestion } from 'lucide-react';

interface SuggestionChipsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs">
        <MessageCircleQuestion className="w-3.5 h-3.5" />
        Suggested questions
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(q)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-full bg-slate-800/60 hover:bg-indigo-600/30 border border-slate-700/50 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
