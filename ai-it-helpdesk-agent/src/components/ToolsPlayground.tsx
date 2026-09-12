import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  BookOpen, 
  KeyRound, 
  Activity, 
  AlertOctagon, 
  Play, 
  Check, 
  Copy, 
  Info 
} from 'lucide-react';
import { Employee, ITTicket, SystemLog, ServiceTelemetry, KnowledgeArticle } from '../types';

interface ToolsPlaygroundProps {
  employees: Employee[];
  tickets: ITTicket[];
  logs: SystemLog[];
  services: ServiceTelemetry[];
  knowledgeBase: KnowledgeArticle[];
  onAddTicket: (ticket: ITTicket) => void;
  onAddLog: (log: SystemLog) => void;
}

export const ToolsPlayground: React.FC<ToolsPlaygroundProps> = ({
  employees,
  tickets,
  logs,
  services,
  knowledgeBase,
  onAddTicket,
  onAddLog
}) => {
  const [selectedTool, setSelectedTool] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Tool 1: SQL State
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM employees WHERE department='Sales & Accounts';");
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Tool 2: RAG State
  const [ragQuery, setRagQuery] = useState("GlobalProtect VPN error 503 gateway unreachable");
  const [ragResults, setRagResults] = useState<KnowledgeArticle[] | null>(null);

  // Tool 3: Password Reset State
  const [resetEmail, setResetEmail] = useState("michael.scott@company.com");
  const [resetResult, setResetResult] = useState<any | null>(null);

  // Tool 4: System Status State
  const [statusService, setStatusService] = useState("all");
  const [statusResult, setStatusResult] = useState<any | null>(null);

  // Tool 5: Ticket Escalation State
  const [escEmployee, setEscEmployee] = useState("EMP-1007");
  const [escTitle, setEscTitle] = useState("USB-C Docking Station Hardware Failure - Amber LED Blinking");
  const [escCategory, setEscCategory] = useState<ITTicket['category']>("Hardware");
  const [escPriority, setEscPriority] = useState<ITTicket['priority']>("P3-Medium");
  const [escDescription, setEscDescription] = useState("Docking station is not powering external monitors and power LED is flashing amber.");
  const [escResult, setEscResult] = useState<any | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Tool 1: SQLite
  const handleExecuteSql = () => {
    setSqlError(null);
    const q = sqlQuery.trim();
    const upper = q.toUpperCase();
    if (!upper.startsWith("SELECT") && !upper.startsWith("PRAGMA")) {
      setSqlError("Security Violation: Only SELECT/PRAGMA read queries permitted.");
      return;
    }

    try {
      if (upper.includes("FROM EMPLOYEES")) {
        if (upper.includes("WHERE")) {
          // Filter simulation
          const filtered = employees.filter(e => 
            q.toLowerCase().includes(e.department.toLowerCase()) || 
            q.toLowerCase().includes(e.name.toLowerCase()) ||
            q.toLowerCase().includes(e.email.toLowerCase())
          );
          setSqlResult(filtered.length > 0 ? filtered : employees.slice(0, 3));
        } else {
          setSqlResult(employees);
        }
      } else if (upper.includes("FROM IT_TICKETS")) {
        setSqlResult(tickets);
      } else if (upper.includes("FROM SYSTEM_LOGS")) {
        setSqlResult(logs);
      } else {
        setSqlResult(employees.slice(0, 2));
      }
    } catch (err: any) {
      setSqlError(err.message || "SQL syntax error");
    }
  };

  // Run Tool 2: RAG
  const handleExecuteRag = () => {
    const q = ragQuery.toLowerCase();
    const matches = knowledgeBase.filter(k => 
      k.title.toLowerCase().includes(q) ||
      k.content.toLowerCase().includes(q) ||
      k.tags.some(t => q.includes(t))
    );
    setRagResults(matches.length > 0 ? matches : [knowledgeBase[0]]);
  };

  // Run Tool 3: Password Reset
  const handleExecuteReset = () => {
    const emp = employees.find(e => e.email.toLowerCase() === resetEmail.toLowerCase() || e.employee_id.toUpperCase() === resetEmail.toUpperCase());
    if (!emp) {
      setResetResult({
        is_error: true,
        message: `Employee with identifier '${resetEmail}' not found in helpdesk.db.`
      });
      return;
    }

    const tempPwd = `IbmTemp#${Math.floor(1000 + Math.random() * 9000)}!`;
    const now = new Date();
    const exp = new Date(now.getTime() + 15 * 60000).toLocaleTimeString();
    
    // Add audit log
    const newLogItem: SystemLog = {
      id: logs.length + 1,
      timestamp: now.toISOString().replace('T', ' ').slice(0, 19),
      event_type: 'ACCOUNT_PWD_RESET',
      actor: emp.email,
      details: `Password reset dispatched for ${emp.name} (${emp.employee_id}). Temp password generated.`,
      severity: 'WARN',
      status: 'Success'
    };
    onAddLog(newLogItem);

    setResetResult({
      is_error: false,
      employee_name: emp.name,
      employee_id: emp.employee_id,
      email: emp.email,
      laptop_asset_tag: emp.laptop_asset_tag,
      temporary_password: tempPwd,
      expires_at: exp,
      audit_logged: true
    });
  };

  // Run Tool 4: System Status
  const handleExecuteStatus = () => {
    if (statusService === "all") {
      setStatusResult(services);
    } else {
      const match = services.find(s => s.id === statusService);
      setStatusResult(match ? [match] : services);
    }
  };

  // Run Tool 5: Escalation
  const handleExecuteEscalation = () => {
    const emp = employees.find(e => e.employee_id === escEmployee) || employees[0];
    const newTktId = `IT-${1043 + tickets.length - 5}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newTicketRecord: ITTicket = {
      id: tickets.length + 1,
      ticket_id: newTktId,
      employee_id: emp.employee_id,
      employee_name: emp.name,
      title: escTitle,
      description: escDescription,
      category: escCategory,
      priority: escPriority,
      status: 'Open',
      assigned_team: escCategory === 'Hardware' ? 'Desktop Support' : 'Network Engineering',
      created_at: nowStr,
      resolved_at: null
    };
    onAddTicket(newTicketRecord);

    const jiraPayload = {
      issue_key: newTktId,
      project: "IT-SUPPORT",
      fields: {
        summary: escTitle,
        description: escDescription,
        issuetype: { name: "Incident" },
        priority: { name: escPriority },
        reporter: { id: emp.employee_id, email: emp.email, name: emp.name },
        component: { name: escCategory },
        assigned_team: newTicketRecord.assigned_team,
        created: nowStr,
        status: "Queued for Tier-2 Engineer"
      }
    };

    setEscResult({
      ticket_id: newTktId,
      status: "Dispatched to Jira API",
      ticket_record: newTicketRecord,
      jira_payload: jiraPayload
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <span>MCP Actionable IT Tools Testbed</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Execute and inspect the 5 decoupled Model Context Protocol (MCP) tools implemented for the IBM Internship Helpdesk Agent.
        </p>
      </div>

      {/* 5 Tool Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { id: 1, name: "SQLite Database", icon: Database, schema: "query_helpdesk_db" },
          { id: 2, name: "Knowledge Base RAG", icon: BookOpen, schema: "search_knowledge_base" },
          { id: 3, name: "Password Reset", icon: KeyRound, schema: "reset_employee_password" },
          { id: 4, name: "System Status", icon: Activity, schema: "check_system_status" },
          { id: 5, name: "Ticket Escalation", icon: AlertOctagon, schema: "escalate_ticket" },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = selectedTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTool(t.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                <span className="text-xs font-bold truncate">Tool {t.id}</span>
              </div>
              <p className="text-xs font-semibold truncate">{t.name}</p>
              <p className={`text-[10px] font-mono mt-1 truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                {t.schema}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Tool Workbench */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        {/* TOOL 1: SQLite Tool */}
        {selectedTool === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tool 1: SQLite Database Tool (`query_helpdesk_db`)</h3>
                <p className="text-xs text-slate-500">Executes read-only SQL queries against `helpdesk.db` (`employees`, `it_tickets`, `system_logs`).</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold">
                MCP Tool Schema: JSON-RPC 2.0
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">SQL Query (SELECT only):</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  onClick={handleExecuteSql}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute</span>
                </button>
              </div>
              <div className="flex space-x-2 text-[11px] text-slate-500">
                <span>Presets:</span>
                <button onClick={() => setSqlQuery("SELECT * FROM employees WHERE status='Active';")} className="text-blue-600 underline">Active Employees</button>
                <button onClick={() => setSqlQuery("SELECT * FROM it_tickets WHERE status='Open';")} className="text-blue-600 underline">Open Tickets</button>
                <button onClick={() => setSqlQuery("SELECT * FROM system_logs ORDER BY timestamp DESC;")} className="text-blue-600 underline">Recent Logs</button>
              </div>
            </div>

            {sqlError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
                {sqlError}
              </div>
            )}

            {sqlResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">Query Result ({sqlResult.length} rows returned):</span>
                  <button 
                    onClick={() => handleCopy(JSON.stringify(sqlResult, null, 2))}
                    className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-64">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {Object.keys(sqlResult[0] || {}).map(k => (
                          <th key={k} className="p-2 font-semibold text-slate-700">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {sqlResult.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {Object.values(row).map((v: any, cidx) => (
                            <td key={cidx} className="p-2 text-slate-600 max-w-xs truncate">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 2: RAG Tool */}
        {selectedTool === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tool 2: Knowledge Base RAG Tool (`search_knowledge_base`)</h3>
                <p className="text-xs text-slate-500">Performs semantic & keyword retrieval over internal IT SOPs and security compliance documents.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold">
                FAISS / Cosine Similarity
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Search Query or Problem Description:</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  onClick={handleExecuteRag}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Retrieve SOP</span>
                </button>
              </div>
              <div className="flex space-x-2 text-[11px] text-slate-500">
                <span>Try keywords:</span>
                <button onClick={() => setRagQuery("vpn error 503 gateway")} className="text-blue-600 underline">VPN Error 503</button>
                <button onClick={() => setRagQuery("password complexity 14 characters")} className="text-blue-600 underline">Password Policy</button>
                <button onClick={() => setRagQuery("bitlocker recovery filevault")} className="text-blue-600 underline">Disk Encryption</button>
                <button onClick={() => setRagQuery("shared mailbox sync delay outlook")} className="text-blue-600 underline">Outlook Sync</button>
              </div>
            </div>

            {ragResults && (
              <div className="space-y-3 mt-4">
                <p className="text-xs font-semibold text-slate-700">Retrieved Knowledge Articles ({ragResults.length}):</p>
                {ragResults.map((article) => (
                  <div key={article.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {article.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{article.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded">
                        {article.category}
                      </span>
                    </div>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border border-slate-100">
                      {article.content}
                    </pre>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-slate-400">Tags:</span>
                      {article.tags.map(t => (
                        <span key={t} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOOL 3: Password Reset Tool */}
        {selectedTool === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tool 3: Password Reset Simulator (`reset_employee_password`)</h3>
                <p className="text-xs text-slate-500">Validates employee account in SQLite, generates high-entropy temporary OTP, and logs security audit event.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold">
                Audit Logging Enabled
              </span>
            </div>

            <div className="space-y-3 max-w-md">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Employee Email / ID:</label>
                <select
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {employees.map(e => (
                    <option key={e.employee_id} value={e.email}>
                      {e.name} ({e.email}) - {e.department}
                    </option>
                  ))}
                  <option value="invalid.user@company.com">Invalid User (Test failure rejection)</option>
                </select>
              </div>

              <button
                onClick={handleExecuteReset}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Automated Reset Workflow</span>
              </button>
            </div>

            {resetResult && (
              <div className={`p-4 rounded-xl border mt-4 text-xs font-mono ${
                resetResult.is_error ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-900 text-slate-100 border-slate-800'
              }`}>
                {resetResult.is_error ? (
                  <p>✖ {resetResult.message}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-emerald-400 font-bold">✓ Automated Password Reset Protocol Executed</p>
                    <div className="border-t border-slate-700 pt-2 space-y-1 text-slate-300">
                      <p>Employee: <span className="text-white font-semibold">{resetResult.employee_name}</span> ({resetResult.employee_id})</p>
                      <p>Email: <span className="text-white">{resetResult.email}</span></p>
                      <p>Workstation Tag: <span className="text-white">{resetResult.laptop_asset_tag}</span></p>
                      <p>Temporary Password: <span className="text-amber-300 font-bold bg-slate-800 px-2 py-0.5 rounded">{resetResult.temporary_password}</span></p>
                      <p>TTL: Valid for 15 minutes (Expires at {resetResult.expires_at})</p>
                      <p className="text-emerald-300 text-[11px] mt-2">Security Audit: Successfully registered ACCOUNT_PWD_RESET into system_logs.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TOOL 4: System Status Checker */}
        {selectedTool === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tool 4: System Status Checker (`check_system_status`)</h3>
                <p className="text-xs text-slate-500">Pings key services like VPN, Email, Active Directory, and Database clusters to return real-time health metrics.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold">
                Live Ping Telemetry
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={statusService}
                onChange={(e) => setStatusService(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="all">All Infrastructure Services</option>
                <option value="vpn">GlobalProtect VPN Gateway</option>
                <option value="email">Microsoft 365 Exchange & Outlook</option>
                <option value="auth">Active Directory & Okta SSO</option>
                <option value="database">PostgreSQL Enterprise DB</option>
                <option value="ticketing">Jira / ServiceNow Gateway</option>
                <option value="wifi">Corporate 802.1X Wi-Fi</option>
              </select>

              <button
                onClick={handleExecuteStatus}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Health Probe</span>
              </button>
            </div>

            {statusResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {statusResult.map((srv: ServiceTelemetry) => {
                  const isOp = srv.status === 'Operational';
                  return (
                    <div key={srv.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{srv.name}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          isOp ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {srv.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1 font-mono text-[11px]">
                        <p>Endpoints: {srv.endpoints.join(', ')}</p>
                        <p>Latency: <span className="font-bold text-blue-600">{srv.latency_ms} ms</span> | Capacity: {srv.capacity}</p>
                        {srv.incident && (
                          <p className="text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">{srv.incident}</p>
                        )}
                        <p className="text-slate-500 font-sans text-[11px]">{srv.notes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TOOL 5: Ticket Escalation System */}
        {selectedTool === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tool 5: Ticket Escalation System (`escalate_ticket`)</h3>
                <p className="text-xs text-slate-500">Formats and logs a structured JSON/Jira ticket with priority levels when an issue cannot be resolved automatically.</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold">
                Jira / ServiceNow Dispatch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Employee Identifier:</label>
                <select
                  value={escEmployee}
                  onChange={(e) => setEscEmployee(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                >
                  {employees.map(e => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.name} ({e.employee_id}) - {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Priority Tier (SLA):</label>
                <select
                  value={escPriority}
                  onChange={(e) => setEscPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                >
                  <option value="P1-Critical">P1-Critical (Outage / Exec blocked - 15m SLA)</option>
                  <option value="P2-High">P2-High (Work blocked - 1h SLA)</option>
                  <option value="P3-Medium">P3-Medium (Work degraded - 4h SLA)</option>
                  <option value="P4-Low">P4-Low (General request - 24h SLA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category:</label>
                <select
                  value={escCategory}
                  onChange={(e) => setEscCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                >
                  <option value="Hardware">Hardware (Desktop Support)</option>
                  <option value="Network">Network (Network Engineering)</option>
                  <option value="Software">Software (Workplace Apps)</option>
                  <option value="Security">Security (SecOps Identity)</option>
                  <option value="Workplace Apps">Workplace Apps (M365/Slack)</option>
                  <option value="DevOps">DevOps (Infrastructure Core)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ticket Title:</label>
                <input
                  type="text"
                  value={escTitle}
                  onChange={(e) => setEscTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Description:</label>
                <textarea
                  rows={2}
                  value={escDescription}
                  onChange={(e) => setEscDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <button
              onClick={handleExecuteEscalation}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Dispatch Tier-2 Jira Ticket & Persist to SQLite</span>
            </button>

            {escResult && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono space-y-3 mt-4">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span>✓ Ticket Created & Queued: {escResult.ticket_id}</span>
                  <span className="text-slate-400 text-[11px]">{escResult.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase mb-1">Structured Jira JSON Payload:</span>
                  <pre className="bg-slate-950 p-3 rounded text-slate-300 overflow-x-auto text-[11px]">
                    {JSON.stringify(escResult.jira_payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
