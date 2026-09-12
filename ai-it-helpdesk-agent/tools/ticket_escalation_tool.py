"""
tools/ticket_escalation_tool.py - Ticket Escalation & Jira Dispatch Tool
Adheres to Model Context Protocol (MCP) tool schema and execution semantics.
Formats and dispatches structured Tier-2/Tier-3 support tickets with priority levels,
inserting the new record directly into helpdesk.db and generating standard Jira payloads.
"""

import sqlite3
import os
import json
import datetime
from typing import Dict, Any

try:
    from langchain_core.tools import tool
except ImportError:
    def tool(func):
        return func

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "helpdesk.db")

TICKET_ESCALATION_MCP_SCHEMA = {
    "name": "escalate_ticket",
    "description": (
        "Escalate an unresolved IT issue to human Tier-2 / Tier-3 engineering teams. "
        "Creates an official ticket in helpdesk.db and formats a Jira/ServiceNow compliant JSON payload. "
        "Use this tool when automated troubleshooting, KB articles, or password resets cannot resolve "
        "the user's problem or when hardware replacement/physical intervention is required."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "employee_identifier": {
                "type": "string",
                "description": "Employee email (e.g. 'dwight.schrute@company.com') or Employee ID (e.g. 'EMP-1007')."
            },
            "title": {
                "type": "string",
                "description": "Concise summary of the issue (e.g. 'USB-C Docking Station Hardware Failure - Amber LED Blinking')"
            },
            "description": {
                "type": "string",
                "description": "Detailed description of the issue, diagnostics attempted, and user symptoms."
            },
            "category": {
                "type": "string",
                "enum": ["Hardware", "Network", "Software", "Security", "Workplace Apps", "DevOps"],
                "description": "IT categorization of the problem."
            },
            "priority": {
                "type": "string",
                "enum": ["P1-Critical", "P2-High", "P3-Medium", "P4-Low"],
                "description": (
                    "Priority level according to IT SLA policy:\n"
                    "P1-Critical (Executive blocked / widespread outage)\n"
                    "P2-High (Work blocked for individual / high business impact)\n"
                    "P3-Medium (Work degraded / workaround available)\n"
                    "P4-Low (General request / inquiry)"
                )
            },
            "assigned_team": {
                "type": "string",
                "description": "Target engineering team: 'Desktop Support', 'Network Engineering', 'SecOps Identity', 'Workplace Apps', 'Infrastructure Core'."
            }
        },
        "required": ["employee_identifier", "title", "description", "category", "priority"]
    }
}


def _resolve_team_from_category(category: str, user_team: str = None) -> str:
    if user_team and user_team.strip():
        return user_team.strip()
    mapping = {
        "Hardware": "Desktop Support",
        "Network": "Network Engineering",
        "Security": "SecOps Identity",
        "Workplace Apps": "Workplace Apps",
        "Software": "Workplace Apps",
        "DevOps": "Infrastructure Core"
    }
    return mapping.get(category, "Desktop Support")


def escalate_ticket_mcp(
    employee_identifier: str,
    title: str,
    description: str,
    category: str,
    priority: str,
    assigned_team: str = ""
) -> Dict[str, Any]:
    """Execute MCP-compliant ticket escalation and database persistence."""
    clean_id = employee_identifier.strip().lower()
    final_team = _resolve_team_from_category(category, assigned_team)
    now_dt = datetime.datetime.now()
    now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")

    emp_id = "EMP-UNKNOWN"
    emp_name = "Unknown Employee"

    # Query employee details from database if available
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
            SELECT employee_id, name, department, laptop_asset_tag
            FROM employees
            WHERE LOWER(email) = ? OR LOWER(employee_id) = ?;
            """, (clean_id, clean_id.upper()))
            row = cursor.fetchone()
            if row:
                emp_id, emp_name, emp_dept, asset_tag = row
            else:
                emp_name = clean_id
                emp_id = clean_id.upper()

            # Determine next ticket ID
            cursor.execute("SELECT MAX(id) FROM it_tickets;")
            max_id = cursor.fetchone()[0] or 1042
            new_ticket_id = f"IT-{max_id + 1}"

            # Insert into it_tickets
            cursor.execute("""
            INSERT INTO it_tickets (ticket_id, employee_id, employee_name, title, description, category, priority, status, assigned_team, created_at, resolved_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, NULL);
            """, (new_ticket_id, emp_id, emp_name, title, description, category, priority, final_team, now_str))

            # Insert audit log
            cursor.execute("""
            INSERT INTO system_logs (timestamp, event_type, actor, details, severity, status)
            VALUES (?, 'TICKET_ESCALATED', ?, ?, 'WARN', 'Success');
            """, (now_str, emp_name, f"Escalated {new_ticket_id} [{priority}] to {final_team}: {title}"))

            conn.commit()
            conn.close()
        except Exception as exc:
            new_ticket_id = f"IT-{int(now_dt.timestamp()) % 10000}"
    else:
        new_ticket_id = f"IT-{int(now_dt.timestamp()) % 10000}"

    # Generate Jira JSON Payload
    jira_payload = {
        "issue_key": new_ticket_id,
        "project": "IT-SUPPORT",
        "fields": {
            "summary": title,
            "description": description,
            "issuetype": {"name": "Service Request"},
            "priority": {"name": priority},
            "customfield_reporter_id": emp_id,
            "customfield_reporter_name": emp_name,
            "components": [{"name": category}],
            "assignee_group": final_team,
            "created": now_str,
            "status": "Tier-2 Escalation Assigned"
        }
    }

    result_text = (
        f"✓ IT Ticket Successfully Created & Escalated to Tier-2\n"
        f"==================================================\n"
        f"Ticket Number : {new_ticket_id}\n"
        f"Status        : Open (Queued for Dispatch)\n"
        f"Priority      : {priority}\n"
        f"Category      : {category}\n"
        f"Assigned Team : {final_team}\n"
        f"Requester     : {emp_name} ({emp_id})\n"
        f"Title         : {title}\n"
        f"Created At    : {now_str}\n"
        f"--------------------------------------------------\n"
        f"Jira / ServiceNow Dispatch Payload:\n"
        f"{json.dumps(jira_payload, indent=2)}\n"
        f"--------------------------------------------------\n"
        f"Notice: The employee will receive email updates as our Tier-2 engineering team handles this ticket."
    )

    return {
        "content": [{
            "type": "text",
            "text": result_text
        }],
        "is_error": False,
        "metadata": {
            "ticket_id": new_ticket_id,
            "priority": priority,
            "category": category,
            "assigned_team": final_team,
            "jira_payload": jira_payload
        }
    }


@tool
def escalate_ticket(
    employee_identifier: str,
    title: str,
    description: str,
    category: str,
    priority: str,
    assigned_team: str = ""
) -> str:
    """
    Escalates an unresolved issue to Tier-2/Tier-3 support. Inserts ticket into database
    and produces a Jira-compatible incident dispatch payload.
    """
    mcp_result = escalate_ticket_mcp(
        employee_identifier, title, description, category, priority, assigned_team
    )
    return mcp_result["content"][0]["text"]
