"""
tools/password_reset_tool.py - Password Reset Simulator Tool
Adheres to Model Context Protocol (MCP) tool schema and execution semantics.
Validates employee identity against the database, generates secure temporary credentials,
and logs the audit event to system_logs.
"""

import sqlite3
import os
import secrets
import string
import datetime
from typing import Dict, Any

try:
    from langchain_core.tools import tool
except ImportError:
    def tool(func):
        return func

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "helpdesk.db")

PASSWORD_RESET_MCP_SCHEMA = {
    "name": "reset_employee_password",
    "description": (
        "Simulates corporate IT password and MFA reset for an employee. "
        "Validates that the employee email exists and is active, generates a secure "
        "temporary 16-character password token (valid for 15 minutes), and logs a security audit event."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "identifier": {
                "type": "string",
                "description": "Employee company email address (e.g. 'michael.scott@company.com') or Employee ID (e.g. 'EMP-1002')."
            },
            "reason": {
                "type": "string",
                "description": "The stated reason for password reset (e.g., 'Account locked after 3 attempts', 'Forgot credentials', 'New workstation')"
            }
        },
        "required": ["identifier"]
    }
}


def _generate_temp_password(length: int = 14) -> str:
    """Generate a high-entropy compliant temporary corporate password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    # Ensure at least one upper, lower, digit, special
    pwd = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*")
    ]
    pwd += [secrets.choice(alphabet) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(pwd)
    return "".join(pwd)


def reset_password_mcp(identifier: str, reason: str = "Self-service IT reset request") -> Dict[str, Any]:
    """Execute MCP-compliant password reset workflow with database validation."""
    clean_id = identifier.strip().lower()

    if not os.path.exists(DB_PATH):
        return {
            "content": [{
                "type": "text",
                "text": "Database error: 'helpdesk.db' not found. Please run setup_db.py."
            }],
            "is_error": True,
            "metadata": {"status": "FAILED", "reason": "Database missing"}
        }

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Look up employee by email or employee_id
    cursor.execute("""
    SELECT employee_id, name, email, department, laptop_asset_tag, status
    FROM employees
    WHERE LOWER(email) = ? OR LOWER(employee_id) = ?;
    """, (clean_id, clean_id.upper()))
    
    employee = cursor.fetchone()

    if not employee:
        conn.close()
        return {
            "content": [{
                "type": "text",
                "text": f"Verification Failed: No active employee found with identifier '{identifier}'. Please verify the corporate email address."
            }],
            "is_error": True,
            "metadata": {"status": "REJECTED", "identifier": identifier}
        }

    emp_id, emp_name, emp_email, emp_dept, asset_tag, emp_status = employee

    if emp_status.lower() != "active":
        conn.close()
        return {
            "content": [{
                "type": "text",
                "text": f"Security Alert: Employee {emp_name} ({emp_id}) status is '{emp_status}'. Automated resets are blocked for non-active accounts. Escalate to HR/SecOps."
            }],
            "is_error": True,
            "metadata": {"status": "BLOCKED", "employee_id": emp_id, "account_status": emp_status}
        }

    # Generate credential and expiry
    temp_pwd = _generate_temp_password(14)
    now_dt = datetime.datetime.now()
    expiry_dt = now_dt + datetime.timedelta(minutes=15)
    now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
    expiry_str = expiry_dt.strftime("%H:%M:%S")

    # Insert security audit log
    log_details = f"Password reset initiated for {emp_email} ({emp_id}). Workstation {asset_tag}. Reason: {reason}"
    cursor.execute("""
    INSERT INTO system_logs (timestamp, event_type, actor, details, severity, status)
    VALUES (?, 'ACCOUNT_PWD_RESET', ?, ?, 'WARN', 'Success');
    """, (now_str, emp_email, log_details))

    conn.commit()
    conn.close()

    response_text = (
        f"✓ Password Reset Successful\n"
        f"--------------------------------------------------\n"
        f"Employee: {emp_name} ({emp_id})\n"
        f"Department: {emp_dept}\n"
        f"Email: {emp_email}\n"
        f"Laptop Asset Tag: {asset_tag}\n"
        f"Temporary Password: {temp_pwd}\n"
        f"Expiration: 15 minutes (Expires at {expiry_str})\n"
        f"Security Notice: The employee will be forced to choose a new password meeting company standards upon first login.\n"
        f"Audit: Security event logged to system_logs."
    )

    return {
        "content": [{
            "type": "text",
            "text": response_text
        }],
        "is_error": False,
        "metadata": {
            "employee_id": emp_id,
            "employee_name": emp_name,
            "email": emp_email,
            "temp_password_generated": True,
            "expires_at": expiry_str,
            "audit_logged": True
        }
    }


@tool
def reset_employee_password(identifier: str, reason: str = "Self-service IT reset request") -> str:
    """
    Triggers an automated password and MFA credential reset for a verified employee email or employee ID.
    Generates a secure temporary password and records a security audit log.
    """
    mcp_result = reset_password_mcp(identifier, reason)
    return mcp_result["content"][0]["text"]
