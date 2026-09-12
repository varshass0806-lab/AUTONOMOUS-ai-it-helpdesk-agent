import React from 'react';
import { 
  Bot, 
  Terminal, 
  Database, 
  BookOpen, 
  Code2, 
  Layers, 
  RefreshCw, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';

export type ActiveTab = 'chat' | 'tools' | 'database' | 'rag' | 'code' | 'architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onReset: () => void;
  systemHealth: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  systemHealth
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Project Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black tracking-tighter text-white text-lg shadow-md">
              IBM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">AI IT Helpdesk Agent</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  LangGraph &bull; MCP Tier-1
                </span>
              </div>
              <p className="text-xs text-slate-400">IBM Internship Project &bull; Perceive ➔ Plan ➔ Act ➔ Iterate</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Agent Chat</span>
            </button>

            <button
              id="nav-tab-tools"
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>5 MCP Tools</span>
            </button>

            <button
              id="nav-tab-database"
              onClick={() => setActiveTab('database')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'database'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>helpdesk.db</span>
            </button>

            <button
              id="nav-tab-rag"
              onClick={() => setActiveTab('rag')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'rag'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Base</span>
            </button>

            <button
              id="nav-tab-code"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Project Files</span>
            </button>

            <button
              id="nav-tab-arch"
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Quick Actions & Telemetry Indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-800/80 px-2.5 py-1.5 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-mono">Infra: {systemHealth}</span>
            </div>

            <button
              id="btn-nav-reset"
              onClick={onReset}
              title="Reset conversation state & re-seed test records"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-800">
          {(['chat', 'tools', 'database', 'rag', 'code', 'architecture'] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-800'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
