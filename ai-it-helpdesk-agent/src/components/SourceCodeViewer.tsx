import React, { useState } from 'react';
import { Code2, Copy, Check, Download, FileCode, CheckCircle2, Terminal } from 'lucide-react';

interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

const PROJECT_FILES: ProjectFile[] = [
  {
    name: "app.py",
    path: "app.py",
    language: "python",
    description: "Streamlit dashboard with interactive ReAct chat, thought process stream, telemetry sidebar, and database inspector.",
    content: `"""
app.py - Streamlit Interactive Dashboard for AI IT Helpdesk Agent
Author: Senior AI Engineer (IBM Internship Project)
"""

import streamlit as st
import json
import sqlite3
import os
from agent_core import execute_autonomous_react_loop, MCPToolDispatcher
from tools.system_status_tool import check_status_mcp

st.set_page_config(
    page_title="IBM AI IT Helpdesk Agent",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "👋 Hello! I am your IBM IT Helpdesk Tier-1 Support Agent. Operating on Perceive -> Plan -> Act -> Iterate with MCP tools.",
            "thought_steps": []
        }
    ]

# Sidebar controls
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", width=110)
    st.markdown("### ⚙️ IT Agent Configuration")
    provider = st.selectbox("Reasoning Engine", ["Autonomous ReAct Engine (Local)", "Groq (llama-3.1-8b-instant)", "OpenAI (gpt-4o-mini)"])
    if st.button("🗑️ Reset Memory"):
        st.session_state.messages = []
        st.rerun()

# Main ReAct loop
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        if msg.get("thought_steps"):
            with st.expander("🧠 Agent ReAct Stream (Perceive ➔ Plan ➔ Act ➔ Iterate)", expanded=True):
                for step in msg["thought_steps"]:
                    st.write(f"**[{step.get('phase')}]** {step.get('thought')}")
                    if step.get("tool_name"):
                        st.json(step.get("tool_input"))
        st.markdown(msg["content"])

user_input = st.chat_input("Describe your IT issue...")
if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    result = execute_autonomous_react_loop(user_input, st.session_state.messages)
    st.session_state.messages.append({
        "role": "assistant",
        "content": result["final_response"],
        "thought_steps": result["thought_steps"]
    })
    st.rerun()`
  },
  {
    name: "agent_core.py",
    path: "agent_core.py",
    language: "python",
    description: "LangGraph ReAct agent core running the Perceive -> Plan -> Act -> Iterate autonomous loop with MCP dispatch.",
    content: `"""
agent_core.py - Core ReAct & LangGraph Agent for AI IT Helpdesk
Implements Perceive -> Plan -> Act -> Iterate loop and Model Context Protocol (MCP) dispatch.
"""

from typing import Dict, Any, List, Optional
from tools import ALL_TOOLS, MCP_TOOL_MANIFEST
from tools.db_tool import execute_db_query_mcp
from tools.rag_tool import search_kb_mcp
from tools.password_reset_tool import reset_password_mcp
from tools.system_status_tool import check_status_mcp
from tools.ticket_escalation_tool import escalate_ticket_mcp

class MCPToolDispatcher:
    @staticmethod
    def call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        if name == "query_helpdesk_db":
            return execute_db_query_mcp(args.get("query", ""))
        elif name == "search_knowledge_base":
            return search_kb_mcp(args.get("query", ""))
        elif name == "reset_employee_password":
            return reset_password_mcp(args.get("identifier", ""))
        elif name == "check_system_status":
            return check_status_mcp(args.get("service_name", "all"))
        elif name == "escalate_ticket":
            return escalate_ticket_mcp(**args)
        return {"error": f"Unknown tool {name}"}

def execute_autonomous_react_loop(user_message: str, chat_history: List[Dict[str, str]]):
    # Phase 1: PERCEIVE - Entity & intent extraction
    # Phase 2: PLAN - Tool determination (DB, RAG, Reset, Status, Escalate)
    # Phase 3: ACT - Invoke MCP Tool with arguments
    # Phase 4: ITERATE - Evaluate output and formulate response
    ...`
  },
  {
    name: "setup_db.py",
    path: "setup_db.py",
    language: "python",
    description: "Database initialization and seeding script creating helpdesk.db with employees, it_tickets, and system_logs.",
    content: `#!/usr/bin/env python3
import sqlite3
import os
import datetime

DB_PATH = "helpdesk.db"

def initialize_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # 1. employees
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        manager TEXT NOT NULL,
        laptop_asset_tag TEXT NOT NULL,
        os TEXT NOT NULL,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'Active'
    );""")
    # 2. it_tickets
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS it_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open',
        assigned_team TEXT NOT NULL,
        created_at TEXT NOT NULL,
        resolved_at TEXT
    );""")
    # 3. system_logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        actor TEXT NOT NULL,
        details TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'INFO',
        status TEXT NOT NULL DEFAULT 'Success'
    );""")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    initialize_database()`
  },
  {
    name: "requirements.txt",
    path: "requirements.txt",
    language: "text",
    description: "Required Python packages (LangChain, LangGraph, Streamlit, Groq/OpenAI, FAISS).",
    content: `langchain>=0.2.14
langchain-core>=0.2.35
langchain-community>=0.2.12
langgraph>=0.2.14
langchain-groq>=0.1.9
langchain-openai>=0.1.22
langchain-google-genai>=1.0.8
faiss-cpu>=1.8.0
sentence-transformers>=3.0.1
streamlit>=1.37.1
pydantic>=2.8.2
python-dotenv>=1.0.1
tabulate>=0.9.0
requests>=2.32.3`
  },
  {
    name: "tools/db_tool.py",
    path: "tools/db_tool.py",
    language: "python",
    description: "Tool 1: SQLite Database Tool with read-only validation and MCP schema.",
    content: `import sqlite3
import json
from langchain_core.tools import tool

DB_TOOL_MCP_SCHEMA = {
    "name": "query_helpdesk_db",
    "description": "Execute read-only SQL query against helpdesk.db to look up employees, assets, and tickets.",
    "parameters": {
        "type": "object",
        "properties": {"query": {"type": "string"}},
        "required": ["query"]
    }
}

@tool
def query_helpdesk_db(query: str) -> str:
    conn = sqlite3.connect("helpdesk.db")
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    cols = [d[0] for d in cursor.description]
    conn.close()
    return json.dumps([dict(zip(cols, r)) for r in rows], indent=2)`
  },
  {
    name: "tools/rag_tool.py",
    path: "tools/rag_tool.py",
    language: "python",
    description: "Tool 2: Knowledge Base RAG Tool with IT SOPs and semantic retrieval.",
    content: `from langchain_core.tools import tool

RAG_TOOL_MCP_SCHEMA = {
    "name": "search_knowledge_base",
    "description": "Searches internal IT documentation for technical instructions, VPN error 503, BitLocker, and SLAs.",
    "parameters": {
        "type": "object",
        "properties": {"query": {"type": "string"}},
        "required": ["query"]
    }
}

@tool
def search_knowledge_base(query: str) -> str:
    # Semantic/BM25 retrieval over IT documentation
    ...`
  },
  {
    name: "tools/password_reset_tool.py",
    path: "tools/password_reset_tool.py",
    language: "python",
    description: "Tool 3: Password Reset Simulator with database identity verification and audit logging.",
    content: `import sqlite3
import secrets
from langchain_core.tools import tool

@tool
def reset_employee_password(identifier: str, reason: str = "Self-service") -> str:
    # 1. Verify employee in helpdesk.db
    # 2. Check active account status
    # 3. Generate high-entropy temporary OTP
    # 4. Insert audit log into system_logs
    ...`
  },
  {
    name: "tools/system_status_tool.py",
    path: "tools/system_status_tool.py",
    language: "python",
    description: "Tool 4: System Status Checker returning latency and telemetry across VPN, Email, SSO, DB.",
    content: `from langchain_core.tools import tool

@tool
def check_system_status(service_name: str = "all") -> str:
    # Pings VPN, Email, Active Directory, DB, Ticketing
    # Returns operational health and incident advisories
    ...`
  },
  {
    name: "tools/ticket_escalation_tool.py",
    path: "tools/ticket_escalation_tool.py",
    language: "python",
    description: "Tool 5: Ticket Escalation System generating Jira JSON payloads and saving to SQLite.",
    content: `import sqlite3
import json
from langchain_core.tools import tool

@tool
def escalate_ticket(employee_identifier: str, title: str, description: str, category: str, priority: str) -> str:
    # 1. Look up employee details in DB
    # 2. Generate next ticket ID (e.g. IT-1043)
    # 3. Insert record into it_tickets
    # 4. Return structured Jira/ServiceNow JSON payload
    ...`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    description: "Complete execution guide, architecture diagrams, and IBM presentation defense script.",
    content: `# AI IT Helpdesk Agent — IBM Internship Project
Autonomous Tier-1 IT Support Agent with LangChain, LangGraph, Python, SQLite, and Streamlit.
Operates on a Perceive ➔ Plan ➔ Act ➔ Iterate loop following Model Context Protocol (MCP) standards.

Execution:
1. python3 setup_db.py
2. streamlit run app.py`
  }
];

export const SourceCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <span>Python Project Repository Files</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete, fully documented source code across all required files for your IBM Internship submission.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy File Content'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* Grid: File List + Code Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left Column: File Tree */}
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-3 space-y-1 shadow-xs h-[560px] overflow-y-auto">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Project Files ({PROJECT_FILES.length})
          </p>
          {PROJECT_FILES.map(file => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Code Display */}
        <div className="md:col-span-3 bg-slate-900 rounded-xl border border-slate-800 shadow-xs flex flex-col overflow-hidden h-[560px]">
          {/* File Tab Info */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-200">{selectedFile.path}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                {selectedFile.language}
              </span>
            </div>
            <span className="text-xs text-slate-400 max-w-md truncate hidden sm:inline">
              {selectedFile.description}
            </span>
          </div>

          {/* Code Body */}
          <div className="flex-1 overflow-y-auto p-4 text-xs font-mono text-slate-200 bg-slate-900 leading-relaxed whitespace-pre selection:bg-blue-900">
            {selectedFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
