"""
tools/db_tool.py - SQLite Database Tool for AI IT Helpdesk Agent
Adheres to Model Context Protocol (MCP) tool schema and execution semantics.
Allows the agent to query employees, IT assets, and ticket histories.
"""

import sqlite3
import os
import json
from typing import Dict, Any, List

try:
    from langchain_core.tools import tool
except ImportError:
    # Fallback decorator if langchain is not yet installed
    def tool(func):
        return func

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "helpdesk.db")

DB_TOOL_MCP_SCHEMA = {
    "name": "query_helpdesk_db",
    "description": (
        "Execute a read-only SQL query against the internal IT helpdesk database (helpdesk.db). "
        "Use this tool to look up employee account status, laptop asset tags, department info, "
        "or existing IT ticket histories. Accessible tables: 'employees', 'it_tickets', 'system_logs'."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "SQL SELECT query to execute against helpdesk.db. "
                    "Example: SELECT * FROM employees WHERE email='michael.scott@company.com' OR "
                    "SELECT * FROM it_tickets WHERE employee_name LIKE '%Michael%' ORDER BY created_at DESC"
                )
            }
        },
        "required": ["query"]
    }
}


def execute_db_query_mcp(query: str) -> Dict[str, Any]:
    """MCP execution handler for SQLite querying with security bounds."""
    clean_query = query.strip()
    # Guard against destructive queries in read-only tool
    forbidden = ["DROP", "DELETE", "ALTER", "TRUNCATE", "VACUUM"]
    first_token = clean_query.split()[0].upper() if clean_query else ""
    
    if any(token in clean_query.upper() for token in forbidden) or first_token not in ["SELECT", "PRAGMA", "EXPLAIN"]:
        return {
            "content": [{
                "type": "text",
                "text": f"Error: Only SELECT and PRAGMA read queries are permitted via this tool. Attempted: {query}"
            }],
            "is_error": True,
            "metadata": {"database": "helpdesk.db", "rows_returned": 0}
        }

    if not os.path.exists(DB_PATH):
        return {
            "content": [{
                "type": "text",
                "text": "Database error: 'helpdesk.db' does not exist. Please run setup_db.py first."
            }],
            "is_error": True,
            "metadata": {"database": "helpdesk.db", "rows_returned": 0}
        }

    try:
        conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
        cursor = conn.cursor()
        cursor.execute(clean_query)
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description] if cursor.description else []
        conn.close()

        records = [dict(zip(columns, row)) for row in rows]
        
        if not records:
            result_text = "Query returned 0 records."
        else:
            result_text = json.dumps(records, indent=2, default=str)

        return {
            "content": [{
                "type": "text",
                "text": f"SQL Query: {clean_query}\nRows: {len(records)}\nResults:\n{result_text}"
            }],
            "is_error": False,
            "metadata": {
                "database": "helpdesk.db",
                "columns": columns,
                "rows_returned": len(records),
                "raw_records": records
            }
        }
    except Exception as exc:
        return {
            "content": [{
                "type": "text",
                "text": f"SQLite execution failed: {str(exc)}"
            }],
            "is_error": True,
            "metadata": {"error": str(exc), "query": clean_query}
        }


@tool
def query_helpdesk_db(query: str) -> str:
    """
    Executes a read-only SQL query against the local helpdesk.db database.
    Query tables: 'employees' (id, employee_id, name, email, department, laptop_asset_tag, os, status),
    'it_tickets' (ticket_id, employee_id, employee_name, title, category, priority, status, created_at),
    or 'system_logs' (timestamp, event_type, actor, details, severity).
    """
    mcp_result = execute_db_query_mcp(query)
    return mcp_result["content"][0]["text"]
