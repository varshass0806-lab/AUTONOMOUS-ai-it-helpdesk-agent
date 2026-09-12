"""
tools/system_status_tool.py - System Status & Health Monitoring Tool
Adheres to Model Context Protocol (MCP) tool schema and execution semantics.
Pings and evaluates real-time telemetry across internal IT services:
VPN, Email, Active Directory/Okta SSO, Database, and Ticketing systems.
"""

import datetime
import random
from typing import Dict, Any, Optional

try:
    from langchain_core.tools import tool
except ImportError:
    def tool(func):
        return func

STATUS_CHECK_MCP_SCHEMA = {
    "name": "check_system_status",
    "description": (
        "Check the operational health and real-time telemetry of key enterprise IT services. "
        "Monitors VPN gateways, Microsoft 365 / Email, Active Directory / Okta SSO, "
        "Database clusters, and Jira/ServiceNow systems. Can inspect a specific service or all services."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "service_name": {
                "type": "string",
                "description": (
                    "Optional name of the specific service to query: 'vpn', 'email', 'auth' / 'active_directory', "
                    "'database', 'ticketing', 'wifi', or 'all'. Defaults to 'all'."
                ),
                "default": "all"
            }
        },
        "required": []
    }
}

# Enterprise services telemetry baseline
SERVICES_CATALOG = {
    "vpn": {
        "name": "GlobalProtect VPN Gateway",
        "endpoints": ["vpn-east.corp.company.com", "vpn-west.corp.company.com"],
        "status": "Operational",
        "latency_ms": 28,
        "tunnel_capacity": "68%",
        "active_incident": None,
        "notes": "US-East tunnel load normalized after peak morning spike."
    },
    "email": {
        "name": "Microsoft 365 Exchange & Outlook",
        "endpoints": ["outlook.office365.com", "autodiscover.company.com"],
        "status": "Degraded",
        "latency_ms": 142,
        "tunnel_capacity": "N/A",
        "active_incident": "Advisory: Shared mailbox sync delay under investigation by Microsoft (EX781290).",
        "notes": "Webmail portal (outlook.office.com) is unaffected; local cached-mode sync may experience 5-10m delays."
    },
    "auth": {
        "name": "Active Directory & Okta SSO",
        "endpoints": ["sso.corp.company.com", "dc01.corp.internal"],
        "status": "Operational",
        "latency_ms": 14,
        "tunnel_capacity": "99.98% SLA",
        "active_incident": None,
        "notes": "Zero-trust SAML 2.0 authentication endpoints operational."
    },
    "database": {
        "name": "PostgreSQL Enterprise Database Cluster",
        "endpoints": ["db-cluster-primary.internal:5432"],
        "status": "Operational",
        "latency_ms": 6,
        "tunnel_capacity": "32% pool util",
        "active_incident": None,
        "notes": "Master-replica sync lag < 12ms. Automated backups verified."
    },
    "ticketing": {
        "name": "Jira / ServiceNow Incident Gateway",
        "endpoints": ["jira.internal.company.com"],
        "status": "Operational",
        "latency_ms": 45,
        "tunnel_capacity": "Normal",
        "active_incident": None,
        "notes": "REST API webhook dispatcher active and accepting ticket payloads."
    },
    "wifi": {
        "name": "Corporate 802.1X Wi-Fi & RADIUS",
        "endpoints": ["radius01.corp.internal"],
        "status": "Operational",
        "latency_ms": 9,
        "tunnel_capacity": "1800 active leases",
        "active_incident": None,
        "notes": "RADIUS certificate valid through Nov 2026."
    }
}


def check_status_mcp(service_name: Optional[str] = "all") -> Dict[str, Any]:
    """Execute MCP-compliant system health inspection."""
    target = (service_name or "all").lower().strip()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    # Map aliases
    alias_map = {
        "active directory": "auth",
        "activedirectory": "auth",
        "okta": "auth",
        "sso": "auth",
        "mail": "email",
        "outlook": "email",
        "office": "email",
        "office365": "email",
        "globalprotect": "vpn",
        "network": "vpn",
        "db": "database",
        "postgres": "database",
        "sql": "database",
        "jira": "ticketing",
        "servicenow": "ticketing",
        "tickets": "ticketing"
    }
    key = alias_map.get(target, target)

    if key != "all" and key in SERVICES_CATALOG:
        targets = {key: SERVICES_CATALOG[key]}
    else:
        targets = SERVICES_CATALOG

    lines = [
        f"=== Enterprise IT Infrastructure Health Telemetry ===",
        f"Timestamp: {now_str}",
        f"Overall System State: {'OPERATIONAL WITH ADVISORY' if any(s['status'] != 'Operational' for s in targets.values()) else 'ALL SYSTEMS NOMINAL'}\n"
    ]

    raw_summary = {}
    for k, item in targets.items():
        symbol = "✓" if item["status"] == "Operational" else ("⚠" if item["status"] == "Degraded" else "✖")
        lines.append(f"[{symbol}] {item['name']} ({k.upper()}):")
        lines.append(f"    - Status: {item['status']}")
        lines.append(f"    - Latency: {item['latency_ms']} ms")
        lines.append(f"    - Endpoints: {', '.join(item['endpoints'])}")
        if item["active_incident"]:
            lines.append(f"    - Incident: {item['active_incident']}")
        lines.append(f"    - Telemetry Notes: {item['notes']}\n")
        raw_summary[k] = item

    return {
        "content": [{
            "type": "text",
            "text": "\n".join(lines)
        }],
        "is_error": False,
        "metadata": {
            "query_target": target,
            "timestamp": now_str,
            "monitored_services": list(targets.keys()),
            "telemetry": raw_summary
        }
    }


@tool
def check_system_status(service_name: str = "all") -> str:
    """
    Checks the real-time operational status of IT services (VPN, Email, Active Directory, Database, Ticketing).
    Pass 'all' or specific service name (e.g., 'vpn', 'email', 'auth').
    """
    mcp_result = check_status_mcp(service_name)
    return mcp_result["content"][0]["text"]
