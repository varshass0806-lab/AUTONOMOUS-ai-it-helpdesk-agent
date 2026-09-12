import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  Terminal, 
  Layers, 
  Cpu, 
  Zap, 
  Shield, 
  HelpCircle,
  Activity,
  Server
} from 'lucide-react';
import { ChatMessage, ReActStep, ServiceTelemetry, Employee } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onResetChat: () => void;
  services: ServiceTelemetry[];
  activeEmployee?: Employee;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onResetChat,
  services,
  activeEmployee
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      title: "VPN Error 503",
      text: "My name is Michael Scott and I cannot connect to GlobalProtect VPN. It gives Error 503."
    },
    {
      title: "Password Reset",
      text: "Reset password for pam.beesly@company.com - account locked after failed attempts."
    },
    {
      title: "System Outages",
      text: "Check system status and active outages across all IT services."
    },
    {
      title: "Dock Hardware Failure",
      text: "Dwight Schrute here. My USB-C dock is flashing amber and monitors won't power on."
    },
    {
      title: "Ticket Status",
      text: "What is the status of IT ticket IT-1042?"
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleThought = (msgId: string) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const getPhaseBadge = (phase: ReActStep['phase']) => {
    switch (phase) {
      case 'PERCEIVE':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PLAN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ACT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ITERATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-5rem)]">
      {/* Sidebar: System Telemetry & Quick Scenarios */}
      <div className="hidden lg:flex lg:col-span-1 flex-col space-y-4 overflow-y-auto pr-1">
        {/* Model Architecture Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold mb-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Agent Engine Spec</span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Framework</span>
              <span className="font-semibold text-slate-800">LangGraph 0.2</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Loop Model</span>
              <span className="font-semibold text-blue-600">Perceive ➔ Plan ➔ Act</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Protocol</span>
              <span className="font-semibold text-slate-800">Model Context (MCP)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Local DB</span>
              <span className="font-mono text-slate-800">SQLite (helpdesk.db)</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Telemetry Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">Live Service Health</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
              MCP Monitored
            </span>
          </div>
          <div className="space-y-2">
            {services.slice(0, 4).map(srv => {
              const isOperational = srv.status === 'Operational';
              return (
                <div 
                  key={srv.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-slate-800 truncate">{srv.name}</p>
                    <p className="text-[11px] text-slate-500">{srv.latency_ms}ms latency</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${
                    isOperational ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {srv.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Test Scenarios */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm">Quick Test Scenarios</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Click to trigger autonomous ReAct resolution:</p>
          <div className="space-y-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                id={`btn-quick-prompt-${idx}`}
                onClick={() => onSendMessage(qp.text)}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 text-xs transition-colors group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 flex items-center justify-between">
                  <span>{qp.title}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-blue-500">➔</span>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{qp.text}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-sidebar-reset-chat"
          onClick={onResetChat}
          className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Conversation Memory</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden h-full">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Autonomous ReAct Dialogue Engine</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </h2>
              <p className="text-xs text-slate-500">Observing &bull; Planning &bull; Acting with 5 MCP Tools &bull; Iterating</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onResetChat}
              className="lg:hidden text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded-md hover:bg-slate-100"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            const hasThoughts = msg.thought_steps && msg.thought_steps.length > 0;
            const isExpanded = expandedThoughts[msg.id] ?? true; // expanded by default to demonstrate ReAct steps!

            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-xs font-semibold text-slate-600">
                    {isAgent ? 'AI Helpdesk Agent' : 'You'}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                {/* Agent Thought Process Stream (Perceive -> Plan -> Act -> Iterate) */}
                {isAgent && hasThoughts && (
                  <div className="w-full max-w-3xl mb-3 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 flex items-center justify-between text-left transition-colors font-medium text-slate-700"
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>ReAct Reasoning Stream ({msg.thought_steps?.length} steps)</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-3.5 border-t border-slate-200 bg-slate-50/50">
                        {msg.thought_steps?.map((step, idx) => (
                          <div key={idx} className="space-y-1.5 border-l-2 border-blue-500/40 pl-3">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getPhaseBadge(step.phase)}`}>
                                {step.phase}
                              </span>
                              <span className="text-slate-800 font-medium">{step.thought}</span>
                            </div>

                            {step.tool_name && (
                              <div className="mt-2 bg-white rounded-lg border border-slate-200 p-2.5 space-y-2 font-mono text-[11px]">
                                <div className="flex items-center justify-between text-slate-600 font-bold border-b border-slate-100 pb-1">
                                  <span>MCP Tool Invoked: <span className="text-blue-600">{step.tool_name}</span></span>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">JSON-RPC</span>
                                </div>
                                
                                {step.tool_input && (
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Tool Arguments:</span>
                                    <pre className="bg-slate-900 text-slate-200 p-2 rounded overflow-x-auto text-[11px] mt-0.5">
                                      {JSON.stringify(step.tool_input, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {step.tool_output && (
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">MCP Content Response:</span>
                                    <pre className="bg-slate-100 text-slate-800 p-2 rounded overflow-x-auto text-[11px] mt-0.5 border border-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
                                      {step.tool_output}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div 
                  className={`max-w-3xl rounded-2xl px-5 py-3.5 text-sm shadow-2xs leading-relaxed whitespace-pre-wrap ${
                    isAgent
                      ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                      : 'bg-blue-600 text-white rounded-tr-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              id="input-chat-message"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your IT issue (e.g., 'Reset password for Sarah', 'GlobalProtect Error 503', 'Check status')..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              id="btn-submit-chat"
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 transition-colors shadow-xs"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Powered by Model Context Protocol (MCP) &bull; LangGraph ReAct Cycle</span>
            <span>Local SQLite Database Persistence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
