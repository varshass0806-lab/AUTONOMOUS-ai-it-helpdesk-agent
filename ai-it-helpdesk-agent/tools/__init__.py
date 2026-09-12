"""
tools package - MCP-compliant tools for the AI IT Helpdesk Agent.
Exposes tools for Database lookup, Knowledge Base RAG, Password Reset,
System Status Monitoring, and Ticket Escalation.
"""

from .db_tool import query_helpdesk_db, execute_db_query_mcp, DB_TOOL_MCP_SCHEMA
from .rag_tool import search_knowledge_base, search_kb_mcp, RAG_TOOL_MCP_SCHEMA
from .password_reset_tool import reset_employee_password, reset_password_mcp, PASSWORD_RESET_MCP_SCHEMA
from .system_status_tool import check_system_status, check_status_mcp, STATUS_CHECK_MCP_SCHEMA
from .ticket_escalation_tool import escalate_ticket, escalate_ticket_mcp, TICKET_ESCALATION_MCP_SCHEMA

ALL_TOOLS = [
    query_helpdesk_db,
    search_knowledge_base,
    reset_employee_password,
    check_system_status,
    escalate_ticket
]

MCP_TOOL_MANIFEST = [
    DB_TOOL_MCP_SCHEMA,
    RAG_TOOL_MCP_SCHEMA,
    PASSWORD_RESET_MCP_SCHEMA,
    STATUS_CHECK_MCP_SCHEMA,
    TICKET_ESCALATION_MCP_SCHEMA
]
