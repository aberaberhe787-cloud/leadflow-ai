import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { useLeadQualification } from './hooks/useLeadQualification';
import { Bot, Menu, X } from 'lucide-react';
import { useState } from 'react';

function App() {
  const {
    messages,
    stage,
    isTyping,
    processUserInput,
    handleOptionClick,
    handleSuggestedQuestion,
    resetConversation,
  } = useLeadQualification();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-dvh w-full bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar onReset={resetConversation} />

      {/* Mobile header + main */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">LeadFlow AI</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile slide-over menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-slate-950 border-l border-slate-800 p-6 flex flex-col animate-slide-in">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-1">LEADFLOW AI</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Qualify visitors automatically. Generate more leads while you
                  focus on closing deals.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-slate-300 flex-1">
                {[
                  'AI Qualification',
                  'Lead Capture',
                  'CRM Integration',
                  'Customer Discovery',
                  'Automated Recommendations',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  resetConversation();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Main chat */}
        <main className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onSend={processUserInput}
            onOptionClick={handleOptionClick}
            onSuggestedQuestion={handleSuggestedQuestion}
            stage={stage}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
