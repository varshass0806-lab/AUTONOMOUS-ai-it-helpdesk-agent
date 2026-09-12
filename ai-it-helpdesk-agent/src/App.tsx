import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { ToolsPlayground } from './components/ToolsPlayground';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { KnowledgeBaseViewer } from './components/KnowledgeBaseViewer';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_TICKETS, 
  INITIAL_LOGS, 
  INITIAL_SERVICES, 
  INITIAL_KNOWLEDGE_BASE 
} from './data';
import { ChatMessage, Employee, ITTicket, SystemLog } from './types';
import { executeReActAgent } from './agentEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  // Enterprise Live Data States
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [tickets, setTickets] = useState<ITTicket[]>(INITIAL_TICKETS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [services] = useState(INITIAL_SERVICES);
  const [knowledgeBase] = useState(INITIAL_KNOWLEDGE_BASE);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      content: 
        "👋 Welcome to the **IBM AI IT Helpdesk Tier-1 Support Agent**!\n\n" +
        "I operate on an autonomous **Perceive ➔ Plan ➔ Act ➔ Iterate** loop with Model Context Protocol (MCP) tools.\n\n" +
        "**How I can assist you:**\n" +
        "• Troubleshoot **GlobalProtect VPN Error 503**\n" +
        "• Execute automated **Password / MFA Token Resets**\n" +
        "• Inspect real-time **System Health & Outages**\n" +
        "• Query employee profile & laptop asset tags from `helpdesk.db`\n" +
        "• Escalate unresolved hardware/critical incidents to Tier-2 Desktop Support\n\n" +
        "Try typing a question or click one of the quick test scenarios on the left!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thought_steps: []
    }
  ]);

  const handleSendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: timeStr
    };

    const newChatHistory = [...messages, userMsg];
    setMessages(newChatHistory);

    // Execute Autonomous ReAct Loop
    const result = executeReActAgent(
      text,
      employees,
      tickets,
      logs,
      services,
      knowledgeBase
    );

    // If a new ticket was created by escalation tool, add to state
    if (result.newTicket) {
      setTickets(prev => [result.newTicket!, ...prev]);
    }

    // If an audit log was generated, add to state
    if (result.newLog) {
      setLogs(prev => [result.newLog!, ...prev]);
    }

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      content: result.finalResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thought_steps: result.thoughtSteps,
      employee_context: result.matchedEmployee
    };

    setMessages([...newChatHistory, agentMsg]);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'agent',
        content: "Conversation memory has been cleared. What IT incident or inquiry can I assist you with?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thought_steps: []
      }
    ]);
  };

  const handleFullReset = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setTickets(INITIAL_TICKETS);
    setLogs(INITIAL_LOGS);
    handleResetChat();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onReset={handleFullReset}
        systemHealth="Nominal (5/6 Services Operational)"
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatView 
            messages={messages}
            onSendMessage={handleSendMessage}
            onResetChat={handleResetChat}
            services={services}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsPlayground 
            employees={employees}
            tickets={tickets}
            logs={logs}
            services={services}
            knowledgeBase={knowledgeBase}
            onAddTicket={(t) => setTickets(prev => [t, ...prev])}
            onAddLog={(l) => setLogs(prev => [l, ...prev])}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseExplorer 
            employees={employees}
            tickets={tickets}
            logs={logs}
          />
        )}

        {activeTab === 'rag' && (
          <KnowledgeBaseViewer 
            knowledgeBase={knowledgeBase}
          />
        )}

        {activeTab === 'code' && (
          <SourceCodeViewer />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDocs />
        )}
      </main>
    </div>
  );
}
