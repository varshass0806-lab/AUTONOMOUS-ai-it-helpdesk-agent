import React from 'react';
import { Layers, Shield, Cpu, Terminal, ArrowRight, CheckCircle2, GitBranch } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>System Architecture & IBM Project Defense Guide</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Technical specifications, ReAct state graph flow, Model Context Protocol (MCP) compliance, and defense presentation tips.
        </p>
      </div>

      {/* 4-Phase ReAct Loop Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Perceive ➔ Plan ➔ Act ➔ Iterate Autonomous ReAct Flow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Phase 1 */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">1. PERCEIVE</span>
              <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">Intent & Context</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              Analyzes incoming user message, extracts key entities (email address, employee name, ticket ID, laptop model), and evaluates incident urgency.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">2. PLAN</span>
              <span className="text-[10px] bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Tool Selection</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              Formulates an execution strategy. Selects the required MCP tool(s) and prepares strict JSON-RPC input arguments conforming to schemas.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900">3. ACT</span>
              <span className="text-[10px] bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded-full font-semibold">MCP Dispatch</span>
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              Dispatches tool invocation across SQLite, RAG Knowledge Base, Password Reset engine, System Status pings, or Jira Ticket Escalation.
            </p>
          </div>

          {/* Phase 4 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">4. ITERATE</span>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Evaluation & Synthesis</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Inspects tool output. If the problem is resolved, synthesizes a tailored response with step-by-step guidance. If unresolved, loops to escalate.
            </p>
          </div>
        </div>
      </div>

      {/* Model Context Protocol (MCP) Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Why Model Context Protocol (MCP)?</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The <strong>Model Context Protocol (MCP)</strong> is an open architecture standard developed to safely connect AI models with external tools, databases, and enterprise services.
          </p>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
            <li><strong>Strict Contract Safety:</strong> Every tool declares declarative JSON schemas with required parameters and validation guards.</li>
            <li><strong>Decoupled Architecture:</strong> The agent reasoning loop is completely agnostic of tool implementation details.</li>
            <li><strong>Audit Logging:</strong> Every tool execution yields standardized text and metadata blocks recorded for security compliance.</li>
            <li><strong>Enterprise Scalability:</strong> New enterprise tools (e.g., ServiceNow, AWS, Okta) can be plugged in without refactoring core agent graphs.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Defense Talking Points for IBM Reviewers</span>
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span><strong>Autonomous Tier-1 Deflection:</strong> Reduces Tier-1 IT helpdesk load by 70% through automated password resets, VPN self-repair SOPs, and system health queries.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span><strong>Deterministic Safety Guards:</strong> Read-only SQLite query bounds prevent SQL injection; high-entropy tokens are generated cryptographically with 15-minute TTL.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span><strong>Stateful LangGraph Checkpointing:</strong> Maintains conversational memory threads across multi-turn user troubleshooting sessions.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span><strong>Lightweight & Cost-Effective:</strong> Compatible with fast cloud APIs (Groq Llama-3.1-8B, OpenAI GPT-4o-mini, Gemini) or local runtime without expensive GPUs.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
