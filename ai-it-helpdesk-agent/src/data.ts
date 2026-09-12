import { Employee, ITTicket, SystemLog, ServiceTelemetry, KnowledgeArticle } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    employee_id: "EMP-1001",
    name: "Sarah Connor",
    email: "sarah.connor@company.com",
    department: "Security Operations",
    role: "Lead SecOps Engineer",
    manager: "John Matrix",
    laptop_asset_tag: "LAP-M3-8821",
    os: "macOS Sonoma 14.5",
    phone: "+1-555-0101",
    status: "Active"
  },
  {
    id: 2,
    employee_id: "EMP-1002",
    name: "Michael Scott",
    email: "michael.scott@company.com",
    department: "Sales & Accounts",
    role: "Regional Director",
    manager: "Jan Levinson",
    laptop_asset_tag: "LAP-DELL-4412",
    os: "Windows 11 Enterprise",
    phone: "+1-555-0102",
    status: "Active"
  },
  {
    id: 3,
    employee_id: "EMP-1003",
    name: "Pam Beesly",
    email: "pam.beesly@company.com",
    department: "Administration",
    role: "Office Administrator",
    manager: "Michael Scott",
    laptop_asset_tag: "LAP-LEN-9031",
    os: "Windows 11 Pro",
    phone: "+1-555-0103",
    status: "Active"
  },
  {
    id: 4,
    employee_id: "EMP-1004",
    name: "Tony Stark",
    email: "tony.stark@company.com",
    department: "Research & Hardware",
    role: "Chief Architect",
    manager: "Board of Directors",
    laptop_asset_tag: "LAP-CUSTOM-001",
    os: "Ubuntu Linux 24.04",
    phone: "+1-555-0104",
    status: "Active"
  },
  {
    id: 5,
    employee_id: "EMP-1005",
    name: "Peter Parker",
    email: "peter.parker@company.com",
    department: "IT Infrastructure",
    role: "Junior Systems Intern",
    manager: "Tony Stark",
    laptop_asset_tag: "LAP-M2-5509",
    os: "macOS Ventura 13.6",
    phone: "+1-555-0105",
    status: "Active"
  },
  {
    id: 6,
    employee_id: "EMP-1006",
    name: "Bruce Wayne",
    email: "bruce.wayne@company.com",
    department: "Executive Board",
    role: "Managing Director",
    manager: "Self",
    laptop_asset_tag: "LAP-X1-9988",
    os: "Windows 11 Enterprise",
    phone: "+1-555-0106",
    status: "Active"
  },
  {
    id: 7,
    employee_id: "EMP-1007",
    name: "Dwight Schrute",
    email: "dwight.schrute@company.com",
    department: "Sales & Accounts",
    role: "Assistant to the Regional Director",
    manager: "Michael Scott",
    laptop_asset_tag: "LAP-DELL-1122",
    os: "Windows 10 Enterprise",
    phone: "+1-555-0107",
    status: "Active"
  },
  {
    id: 8,
    employee_id: "EMP-1008",
    name: "Jim Halpert",
    email: "jim.halpert@company.com",
    department: "Sales & Accounts",
    role: "Senior Account Manager",
    manager: "Michael Scott",
    laptop_asset_tag: "LAP-M2-3312",
    os: "macOS Sonoma 14.4",
    phone: "+1-555-0108",
    status: "Active"
  }
];

export const INITIAL_TICKETS: ITTicket[] = [
  {
    id: 1,
    ticket_id: "IT-1042",
    employee_id: "EMP-1002",
    employee_name: "Michael Scott",
    title: "Cannot connect to GlobalProtect VPN",
    description: "GlobalProtect client reports Error 503: Gateway Unreachable from home WiFi.",
    category: "Network",
    priority: "P2-High",
    status: "Open",
    assigned_team: "Network Engineering",
    created_at: "2026-09-07 14:32:00",
    resolved_at: null
  },
  {
    id: 2,
    ticket_id: "IT-1039",
    employee_id: "EMP-1003",
    employee_name: "Pam Beesly",
    title: "Outlook 365 Shared Mailbox sync delay",
    description: "Executive shared inbox not syncing new calendar invitations.",
    category: "Workplace Apps",
    priority: "P3-Medium",
    status: "In Progress",
    assigned_team: "Workplace Apps",
    created_at: "2026-09-06 09:15:00",
    resolved_at: null
  },
  {
    id: 3,
    ticket_id: "IT-1035",
    employee_id: "EMP-1001",
    employee_name: "Sarah Connor",
    title: "Request YubiKey 5C NFC hardware replacement",
    description: "Lost primary hardware token during transit, currently using emergency SMS fallback.",
    category: "Security",
    priority: "P2-High",
    status: "Resolved",
    assigned_team: "SecOps Identity",
    created_at: "2026-09-03 11:20:00",
    resolved_at: "2026-09-05 16:45:00"
  },
  {
    id: 4,
    ticket_id: "IT-1028",
    employee_id: "EMP-1007",
    employee_name: "Dwight Schrute",
    title: "Desk dual monitor docking station power surge",
    description: "USB-C DisplayLink dock flashing amber LED and not transmitting HDMI signal.",
    category: "Hardware",
    priority: "P3-Medium",
    status: "Open",
    assigned_team: "Desktop Support",
    created_at: "2026-09-05 10:05:00",
    resolved_at: null
  },
  {
    id: 5,
    ticket_id: "IT-1011",
    employee_id: "EMP-1004",
    employee_name: "Tony Stark",
    title: "Kubernetes cluster local tunnel certificate renewal",
    description: "Self-signed root CA certificate expired for staging ingress endpoint.",
    category: "DevOps",
    priority: "P1-Critical",
    status: "Resolved",
    assigned_team: "Infrastructure Core",
    created_at: "2026-09-03 08:00:00",
    resolved_at: "2026-09-03 09:40:00"
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 1,
    timestamp: "2026-09-03 11:22:00",
    event_type: "AUTH_MFA_CHALLENGE",
    actor: "sarah.connor@company.com",
    details: "Emergency SMS OTP verified after YubiKey loss.",
    severity: "WARN",
    status: "Success"
  },
  {
    id: 2,
    timestamp: "2026-09-05 10:14:00",
    event_type: "VPN_GATEWAY_HEALTH",
    actor: "SYSTEM_HEALTH_PROBE",
    details: "US-East-1 VPN gateway reached 92% tunnel capacity threshold.",
    severity: "WARN",
    status: "Resolved"
  },
  {
    id: 3,
    timestamp: "2026-09-06 14:02:00",
    event_type: "ACCOUNT_PWD_RESET",
    actor: "admin.helpdesk@company.com",
    details: "Automated password reset link sent to pam.beesly@company.com.",
    severity: "INFO",
    status: "Success"
  },
  {
    id: 4,
    timestamp: "2026-09-07 15:40:00",
    event_type: "AUTH_FAILED_ATTEMPT",
    actor: "michael.scott@company.com",
    details: "3 failed Kerberos password attempts on workstation LAP-DELL-4412.",
    severity: "WARN",
    status: "Account Flagged"
  },
  {
    id: 5,
    timestamp: "2026-09-08 08:00:00",
    event_type: "SYSTEM_BOOTSTRAP",
    actor: "setup_db.py",
    details: "Helpdesk SQLite seed completed with 8 employees, 5 tickets, 5 log events.",
    severity: "INFO",
    status: "Success"
  }
];

export const INITIAL_SERVICES: ServiceTelemetry[] = [
  {
    id: "vpn",
    name: "GlobalProtect VPN Gateway",
    category: "Network",
    endpoints: ["vpn-east.corp.company.com", "vpn-west.corp.company.com"],
    status: "Operational",
    latency_ms: 28,
    capacity: "68% active tunnels",
    incident: null,
    notes: "US-East tunnel load normalized after peak morning spike."
  },
  {
    id: "email",
    name: "Microsoft 365 Exchange & Outlook",
    category: "Productivity",
    endpoints: ["outlook.office365.com", "autodiscover.company.com"],
    status: "Degraded",
    latency_ms: 142,
    capacity: "SLA Impacted",
    incident: "Advisory EX781290: Shared mailbox sync delay under investigation.",
    notes: "Webmail portal (outlook.office.com) is unaffected; cached-mode sync experiencing 5-10m delays."
  },
  {
    id: "auth",
    name: "Active Directory & Okta SSO",
    category: "Security & IAM",
    endpoints: ["sso.corp.company.com", "dc01.corp.internal"],
    status: "Operational",
    latency_ms: 14,
    capacity: "99.98% SLA",
    incident: null,
    notes: "Zero-trust SAML 2.0 authentication endpoints operational."
  },
  {
    id: "database",
    name: "PostgreSQL Enterprise Database Cluster",
    category: "Infrastructure",
    endpoints: ["db-cluster-primary.internal:5432"],
    status: "Operational",
    latency_ms: 6,
    capacity: "32% pool util",
    incident: null,
    notes: "Master-replica sync lag < 12ms. Automated backups verified."
  },
  {
    id: "ticketing",
    name: "Jira / ServiceNow Incident Gateway",
    category: "ITSM",
    endpoints: ["jira.internal.company.com"],
    status: "Operational",
    latency_ms: 45,
    capacity: "Normal",
    incident: null,
    notes: "REST API webhook dispatcher active and accepting ticket payloads."
  },
  {
    id: "wifi",
    name: "Corporate 802.1X Wi-Fi & RADIUS",
    category: "Network",
    endpoints: ["radius01.corp.internal"],
    status: "Operational",
    latency_ms: 9,
    capacity: "1800 active leases",
    incident: null,
    notes: "RADIUS certificate valid through Nov 2026."
  }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: "KB-VPN-001",
    title: "GlobalProtect VPN: Setup, Gateways, and Error 503 Resolution",
    category: "Networking",
    tags: ["vpn", "globalprotect", "error 503", "gateway", "remote work", "network"],
    content: `1. Gateway Addresses:
- Primary US East: vpn-east.corp.company.com
- Primary US West: vpn-west.corp.company.com
- EMEA: vpn-eu.corp.company.com

2. Error 503 (Gateway Unreachable) Troubleshooting:
Step A: Verify home internet connectivity by opening a browser to https://1.1.1.1.
Step B: Flush local DNS cache.
  - Windows: Open PowerShell as Admin and run 'ipconfig /flushdns'.
  - macOS: Run 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder'.
Step C: Check if company root CA certificate is installed. If expired, navigate to https://portal.corp.company.com/certs and re-download Corporate-Root-CA.crt.
Step D: If using public or hotel Wi-Fi, accept the captive portal login before initiating GlobalProtect.
Step E: Switch gateway to alternate region (e.g., vpn-west if east is experiencing high tunnel load).`
  },
  {
    id: "KB-SEC-002",
    title: "Corporate Password & Multi-Factor Authentication (MFA) Standards",
    category: "Security",
    tags: ["password", "mfa", "reset", "yubikey", "authenticator", "okta", "security"],
    content: `1. Password Complexity Requirements:
- Minimum 14 characters in length.
- Must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol (!@#$%^&*).
- Must not contain parts of employee's first or last name or last 5 previous passwords.
- Passwords expire every 90 days. Mandatory reset notification begins at T-14 days.

2. MFA Enrollment and Recovery:
- Primary authenticator: Okta Verify or Microsoft Authenticator with Number Matching enabled.
- Hardware tokens: YubiKey 5C NFC is issued to Engineers, Executives, and SecOps personnel.
- In case of lost phone or forgotten token: Contact IT Helpdesk or use the Automated Password/MFA Reset Tool.
- Tier-1 Helpdesk requires identity validation (employee ID, department, laptop asset tag) prior to OTP dispatch.`
  },
  {
    id: "KB-HDW-003",
    title: "Hardware Asset Management, BitLocker, and FileVault Recovery",
    category: "Hardware",
    tags: ["hardware", "bitlocker", "filevault", "mac", "windows", "docking station", "encryption"],
    content: `1. Disk Encryption Policies:
- Windows workstations must have TPM 2.0 active and BitLocker enabled.
- macOS workstations must have Apple Silicon Secure Enclave and FileVault activated during MDM enrollment.
- BitLocker Recovery Keys are securely backed up to Microsoft Intune and Azure Active Directory.

2. Docking Station & Peripheral Issues:
- USB-C DisplayLink Docks: If flashing amber, perform a 30-second power cycle (unplug all USB, monitor, and AC power cords, hold dock power button for 15s, reconnect AC first).
- Firmware updates for Dell/Lenovo docks can be found in company Self-Service Portal under 'Hardware Drivers'.

3. Loaner Laptop Policy:
- For hardware damage requiring repair > 24 hours, loaner Mac/Dell units are dispatched from IT Depot.`
  },
  {
    id: "KB-APP-004",
    title: "Outlook 365, Shared Mailboxes, and Teams Synchronization",
    category: "Workplace Apps",
    tags: ["outlook", "email", "teams", "office 365", "mailbox", "calendar"],
    content: `1. Shared Mailbox Not Syncing:
- Go to Outlook -> File -> Account Settings -> Account Settings.
- Select your M365 account -> Change -> More Settings -> Advanced tab.
- Uncheck 'Download shared folders' (disables cached mode for shared mailboxes) and restart Outlook.
- This forces live server-side mailbox synchronization.

2. Teams Meeting Add-in missing:
- Verify in Outlook COM Add-ins that 'Microsoft Teams Meeting Add-in for Microsoft Office' is checked.
- If disabled due to slow start, set load behavior to Always Enable.`
  },
  {
    id: "KB-POL-005",
    title: "Zero-Trust Remote Work Tech Policy & IT Service Level Agreements (SLAs)",
    category: "Policy",
    tags: ["policy", "sla", "priority", "escalation", "remote work", "zero trust"],
    content: `1. IT Ticket Priority Tiers & SLA Response Times:
- P1 - Critical (Entire service outage, executive blocked, data breach): 15 minute response, 2 hour resolution SLA.
- P2 - High (Key employee blocked from work, VPN down for team): 1 hour response, 4 hour resolution SLA.
- P3 - Medium (Single application glitch, peripheral failure, non-blocking bug): 4 hour response, 24 hour resolution SLA.
- P4 - Low (General inquiry, hardware upgrade request, software license inquiry): 24 hour response, 3 business days SLA.

2. Tier-1 Escalation Protocol:
- When self-service troubleshooting (KB docs, password reset, restart) does not resolve the issue, agent MUST escalate ticket with structured metadata (category, priority, employee ID, summary of steps taken).`
  }
];
