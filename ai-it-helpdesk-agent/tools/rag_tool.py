"""
tools/rag_tool.py - Knowledge Base RAG Tool for AI IT Helpdesk Agent
Adheres to Model Context Protocol (MCP) tool schema and execution semantics.
Performs semantic & contextual search across IT standard operating procedures,
VPN setup manuals, security policies, and troubleshooting guides.
"""

import math
import re
from typing import Dict, Any, List

try:
    from langchain_core.tools import tool
except ImportError:
    def tool(func):
        return func

# Standard internal IT Knowledge Base articles
IT_KNOWLEDGE_BASE = [
    {
        "id": "KB-VPN-001",
        "title": "GlobalProtect VPN: Setup, Gateways, and Error 503 Resolution",
        "category": "Networking",
        "tags": ["vpn", "globalprotect", "error 503", "gateway", "remote work", "network"],
        "content": (
            "1. Gateway Addresses:\n"
            "   - Primary US East: vpn-east.corp.company.com\n"
            "   - Primary US West: vpn-west.corp.company.com\n"
            "   - EMEA: vpn-eu.corp.company.com\n"
            "2. Error 503 (Gateway Unreachable) Troubleshooting:\n"
            "   Step A: Verify home internet connectivity by opening a browser to https://1.1.1.1.\n"
            "   Step B: Flush local DNS cache.\n"
            "     - Windows: Open PowerShell as Admin and run 'ipconfig /flushdns'.\n"
            "     - macOS: Run 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder'.\n"
            "   Step C: Check if company root CA certificate is installed. If expired, navigate to "
            "https://portal.corp.company.com/certs and re-download Corporate-Root-CA.crt.\n"
            "   Step D: If using public or hotel Wi-Fi, accept the captive portal login before initiating GlobalProtect.\n"
            "   Step E: Switch gateway to alternate region (e.g., vpn-west if east is experiencing high tunnel load)."
        )
    },
    {
        "id": "KB-SEC-002",
        "title": "Corporate Password & Multi-Factor Authentication (MFA) Standards",
        "category": "Security",
        "tags": ["password", "mfa", "reset", "yubikey", "authenticator", "okta", "security"],
        "content": (
            "1. Password Complexity Requirements:\n"
            "   - Minimum 14 characters in length.\n"
            "   - Must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol (!@#$%^&*).\n"
            "   - Must not contain parts of employee's first or last name or last 5 previous passwords.\n"
            "   - Passwords expire every 90 days. Mandatory reset notification begins at T-14 days.\n"
            "2. MFA Enrollment and Recovery:\n"
            "   - Primary authenticator: Okta Verify or Microsoft Authenticator with Number Matching enabled.\n"
            "   - Hardware tokens: YubiKey 5C NFC is issued to Engineers, Executives, and SecOps personnel.\n"
            "   - In case of lost phone or forgotten token: Contact IT Helpdesk or use the Automated Password/MFA Reset Tool.\n"
            "   - Tier-1 Helpdesk requires identity validation (employee ID, department, laptop asset tag) prior to OTP dispatch."
        )
    },
    {
        "id": "KB-HDW-003",
        "title": "Hardware Asset Management, BitLocker, and FileVault Recovery",
        "category": "Hardware",
        "tags": ["hardware", "bitlocker", "filevault", "mac", "windows", "docking station", "encryption"],
        "content": (
            "1. Disk Encryption Policies:\n"
            "   - Windows workstations must have TPM 2.0 active and BitLocker enabled.\n"
            "   - macOS workstations must have Apple Silicon Secure Enclave and FileVault activated during MDM enrollment.\n"
            "   - BitLocker Recovery Keys are securely backed up to Microsoft Intune and Azure Active Directory.\n"
            "2. Docking Station & Peripheral Issues:\n"
            "   - USB-C DisplayLink Docks: If flashing amber, perform a 30-second power cycle (unplug all USB, monitor, and AC power cords, hold dock power button for 15s, reconnect AC first).\n"
            "   - Firmware updates for Dell/Lenovo docks can be found in company Self-Service Portal under 'Hardware Drivers'.\n"
            "3. Loaner Laptop Policy:\n"
            "   - For hardware damage requiring repair > 24 hours, loaner Mac/Dell units are dispatched from IT Depot."
        )
    },
    {
        "id": "KB-APP-004",
        "title": "Outlook 365, Shared Mailboxes, and Teams Synchronization",
        "category": "Workplace Apps",
        "tags": ["outlook", "email", "teams", "office 365", "mailbox", "calendar"],
        "content": (
            "1. Shared Mailbox Not Syncing:\n"
            "   - Go to Outlook -> File -> Account Settings -> Account Settings.\n"
            "   - Select your M365 account -> Change -> More Settings -> Advanced tab.\n"
            "   - Uncheck 'Download shared folders' (disables cached mode for shared mailboxes) and restart Outlook.\n"
            "   - This forces live server-side mailbox synchronization.\n"
            "2. Teams Meeting Add-in missing:\n"
            "   - Verify in Outlook COM Add-ins that 'Microsoft Teams Meeting Add-in for Microsoft Office' is checked.\n"
            "   - If disabled due to slow start, set load behavior to Always Enable."
        )
    },
    {
        "id": "KB-POL-005",
        "title": "Zero-Trust Remote Work Tech Policy & IT Service Level Agreements (SLAs)",
        "category": "Policy",
        "tags": ["policy", "sla", "priority", "escalation", "remote work", "zero trust"],
        "content": (
            "1. IT Ticket Priority Tiers & SLA Response Times:\n"
            "   - P1 - Critical (Entire service outage, executive blocked, data breach): 15 minute response, 2 hour resolution SLA.\n"
            "   - P2 - High (Key employee blocked from work, VPN down for team): 1 hour response, 4 hour resolution SLA.\n"
            "   - P3 - Medium (Single application glitch, peripheral failure, non-blocking bug): 4 hour response, 24 hour resolution SLA.\n"
            "   - P4 - Low (General inquiry, hardware upgrade request, software license inquiry): 24 hour response, 3 business days SLA.\n"
            "2. Tier-1 Escalation Protocol:\n"
            "   - When self-service troubleshooting (KB docs, password reset, restart) does not resolve the issue, agent MUST escalate ticket with structured metadata (category, priority, employee ID, summary of steps taken)."
        )
    }
]

RAG_TOOL_MCP_SCHEMA = {
    "name": "search_knowledge_base",
    "description": (
        "Search internal IT documentation, technical policies, setup manuals, and troubleshooting guides. "
        "Use this tool whenever an employee asks how to solve a technical issue (e.g. VPN error 503, "
        "Outlook mailbox sync, Wi-Fi, password rules, docking stations, or SLAs)."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language search keywords or question (e.g., 'how to fix globalprotect vpn error 503', 'password complexity policy')"
            }
        },
        "required": ["query"]
    }
}


def _calculate_bm25_similarity(query: str, doc_text: str, tags: List[str]) -> float:
    """Lightweight portable relevance scoring without heavy binary dependencies."""
    tokens = set(re.findall(r'\w+', query.lower()))
    if not tokens:
        return 0.0
    
    score = 0.0
    doc_lower = doc_text.lower()
    
    for token in tokens:
        # Boost for matching tags
        if any(token in tag.lower() for tag in tags):
            score += 4.0
        # Boost for occurrence in title/content
        count = doc_lower.count(token)
        if count > 0:
            score += 1.0 + math.log1p(count)
            
    return score


def search_kb_mcp(query: str, top_k: int = 2) -> Dict[str, Any]:
    """Execute semantic knowledge retrieval matching query against internal articles."""
    scored_docs = []
    for doc in IT_KNOWLEDGE_BASE:
        text_corpus = f"{doc['title']} {doc['category']} {doc['content']}"
        score = _calculate_bm25_similarity(query, text_corpus, doc["tags"])
        scored_docs.append((score, doc))
        
    scored_docs.sort(key=lambda x: x[0], reverse=True)
    top_results = [doc for score, doc in scored_docs[:top_k] if score > 0.5]
    
    if not top_results:
        # Fallback to most relevant by tag or top 1
        top_results = [scored_docs[0][1]] if scored_docs else []

    formatted_output = []
    for i, doc in enumerate(top_results, 1):
        formatted_output.append(
            f"--- [Document {i}: {doc['id']} - {doc['title']}] ---\n"
            f"Category: {doc['category']}\n"
            f"Tags: {', '.join(doc['tags'])}\n"
            f"Content:\n{doc['content']}\n"
        )

    result_text = "\n".join(formatted_output) if formatted_output else "No relevant knowledge base articles found."
    
    return {
        "content": [{
            "type": "text",
            "text": f"Knowledge Base Search Query: '{query}'\nRetrieved {len(top_results)} matching articles:\n\n{result_text}"
        }],
        "is_error": False,
        "metadata": {
            "query": query,
            "matched_ids": [d["id"] for d in top_results],
            "total_matches": len(top_results)
        }
    }


@tool
def search_knowledge_base(query: str) -> str:
    """
    Searches internal IT documentation for technical instructions, troubleshooting steps,
    VPN setup guides, Outlook issues, hardware policies, and SLAs.
    """
    mcp_result = search_kb_mcp(query)
    return mcp_result["content"][0]["text"]
