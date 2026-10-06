import {
  Bot,
  Target,
  Users,
  Database,
  Lightbulb,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  onReset?: () => void;
}

const SIDEBAR_FEATURES = [
  { icon: Target, label: 'AI Qualification' },
  { icon: Users, label: 'Lead Capture' },
  { icon: Database, label: 'CRM Integration' },
  { icon: Lightbulb, label: 'Customer Discovery' },
  { icon: Zap, label: 'Automated Recommendations' },
];

export function Sidebar({ onReset }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 h-full bg-slate-950/80 border-r border-slate-800/80 p-6">
      {/* Brand */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              LEADFLOW AI
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Qualify visitors automatically.
          <br />
          Generate more leads while you focus on closing deals.
        </p>
      </div>

      {/* Features list */}
      <div className="flex-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Features
        </h2>
        <ul className="space-y-3">
          {SIDEBAR_FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-sm text-slate-300 group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-colors">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Reset */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <p className="text-xs text-slate-600 text-center">
          Powered by Gemini · Built for conversion
        </p>
      </div>
    </aside>
  );
}
