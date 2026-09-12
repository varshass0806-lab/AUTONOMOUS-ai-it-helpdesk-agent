import { Employee, ITTicket, SystemLog, ServiceTelemetry, KnowledgeArticle, ReActStep } from './types';

export interface AgentExecutionResult {
  finalResponse: string;
  thoughtSteps: ReActStep[];
  matchedEmployee?: Employee;
  newTicket?: ITTicket;
  newLog?: SystemLog;
  updatedTelemetry?: ServiceTelemetry[];
}

export function executeReActAgent(
  userMessage: string,
  employees: Employee[],
  tickets: ITTicket[],
  logs: SystemLog[],
  services: ServiceTelemetry[],
  knowledgeBase: KnowledgeArticle[]
): AgentExecutionResult {
  const steps: ReActStep[] = [];
  const lower = userMessage.toLowerCase();
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const dateStr = now.toISOString().split('T')[0] + ' ' + timeStr;

  // -------------------------------------------------------------
  // PHASE 1: PERCEIVE
  // -------------------------------------------------------------
  let matchedEmployee: Employee | undefined = undefined;
  
  // Extract email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i;
  const emailMatch = userMessage.match(emailRegex);
  if (emailMatch) {
    const targetEmail = emailMatch[0].toLowerCase();
    matchedEmployee = employees.find(e => e.email.toLowerCase() === targetEmail);
  }

  // Extract name if no email
  if (!matchedEmployee) {
    for (const emp of employees) {
      if (lower.includes(emp.name.toLowerCase())) {
        matchedEmployee = emp;
        break;
      }
    }
  }

  // Intent classification
  let intent: 'password_reset' | 'vpn_issue' | 'system_status' | 'hardware_trouble' | 'ticket_query' | 'general' = 'general';
  if (lower.includes('password') || lower.includes('reset') || lower.includes('locked out') || lower.includes('credentials') || lower.includes('login')) {
    intent = 'password_reset';
  } else if (lower.includes('vpn') || lower.includes('globalprotect') || lower.includes('error 503') || lower.includes('tunnel')) {
    intent = 'vpn_issue';
  } else if (lower.includes('status') || lower.includes('health') || lower.includes('outage') || lower.includes('is down') || lower.includes('ping')) {
    intent = 'system_status';
  } else if (lower.includes('dock') || lower.includes('screen') || lower.includes('hardware') || lower.includes('monitor') || lower.includes('broken')) {
    intent = 'hardware_trouble';
  } else if (lower.includes('ticket') || lower.includes('it-') || lower.includes('history')) {
    intent = 'ticket_query';
  }

  steps.push({
    phase: 'PERCEIVE',
    thought: `Analyzed user input. Detected intent: '${intent}'. Employee entity: ${matchedEmployee ? `${matchedEmployee.name} (${matchedEmployee.employee_id})` : 'Context search required'}. Priority evaluation initialized.`,
    timestamp: timeStr
  });

  // -------------------------------------------------------------
  // PHASE 2 & 3: PLAN & ACT (Step 1: DB Lookup)
  // -------------------------------------------------------------
  if (matchedEmployee) {
    steps.push({
      phase: 'PLAN',
      thought: `Query internal SQLite database ('employees' and 'it_tickets') via MCP Tool 'query_helpdesk_db' to retrieve active profile, laptop asset tag, and historical incidents.`,
      timestamp: timeStr
    });

    const sql = `SELECT * FROM employees WHERE employee_id='${matchedEmployee.employee_id}';`;
    steps.push({
      phase: 'ACT',
      thought: `Invoked query_helpdesk_db for employee record.`,
      tool_name: 'query_helpdesk_db',
      tool_input: { query: sql },
      tool_output: JSON.stringify(matchedEmployee, null, 2),
      timestamp: timeStr
    });

    steps.push({
      phase: 'ITERATE',
      thought: `Validated employee identity: ${matchedEmployee.name}, Department: ${matchedEmployee.department}, Laptop: ${matchedEmployee.laptop_asset_tag} (${matchedEmployee.os}). Proceeding with task remediation.`,
      timestamp: timeStr
    });
  }

  // -------------------------------------------------------------
  // BRANCH SPECIFIC REMEDIATIONS
  // -------------------------------------------------------------
  let finalResponse = '';
  let newTicket: ITTicket | undefined = undefined;
  let newLog: SystemLog | undefined = undefined;

  if (intent === 'password_reset') {
    const emp = matchedEmployee || employees[1]; // default Michael Scott for testing if none
    const tempPass = 'IbmTemp#2026!' + Math.floor(100 + Math.random() * 900);

    steps.push({
      phase: 'PLAN',
      thought: `Execute MCP Tool 'reset_employee_password' to issue secure temporary credential and generate security audit event in system_logs.`,
      timestamp: timeStr
    });

    const resetOutput = `✓ Password Reset Successful\n--------------------------------------------------\nEmployee: ${emp.name} (${emp.employee_id})\nEmail: ${emp.email}\nWorkstation: ${emp.laptop_asset_tag}\nTemporary Password: ${tempPass}\nExpiration: 15 minutes\nSecurity Audit: ACCOUNT_PWD_RESET recorded to system_logs.`;

    steps.push({
      phase: 'ACT',
      thought: `Executed reset_employee_password MCP tool.`,
      tool_name: 'reset_employee_password',
      tool_input: { identifier: emp.email, reason: 'Self-service account unlock request' },
      tool_output: resetOutput,
      timestamp: timeStr
    });

    newLog = {
      id: logs.length + 1,
      timestamp: dateStr,
      event_type: 'ACCOUNT_PWD_RESET',
      actor: emp.email,
      details: `Password reset issued for ${emp.name} (${emp.employee_id}). Workstation ${emp.laptop_asset_tag}.`,
      severity: 'WARN',
      status: 'Success'
    };

    steps.push({
      phase: 'ITERATE',
      thought: `Verified password reset payload generated. Constructing guided single-sign-on (SSO) instructions and security complexity policy.`,
      timestamp: timeStr
    });

    finalResponse = `Hello ${emp.name},\n\nI have successfully processed your password reset request!\n\n` +
      `**Temporary Credentials Generated:**\n` +
      `\`\`\`text\n${resetOutput}\n\`\`\`\n\n` +
      `**Next Steps to Regain Access:**\n` +
      `1. Open your browser to **https://sso.corp.company.com**.\n` +
      `2. Log in with your email (\`${emp.email}\`) and the temporary password above.\n` +
      `3. You will be prompted immediately to create a new password conforming to company standards (minimum 14 characters, uppercase, lowercase, numbers, and special symbols).\n` +
      `4. Verify your identity with Okta Verify or YubiKey token when prompted.`;

  } else if (intent === 'vpn_issue') {
    const emp = matchedEmployee || employees[1];

    steps.push({
      phase: 'PLAN',
      thought: `Formulate 2-tier action plan: 1) Query Knowledge Base RAG tool for GlobalProtect Error 503 SOP. 2) Check real-time telemetry for VPN gateway health.`,
      timestamp: timeStr
    });

    // Tool 2: KB
    const kbDoc = knowledgeBase.find(k => k.id === 'KB-VPN-001') || knowledgeBase[0];
    steps.push({
      phase: 'ACT',
      thought: `Consulted IT Knowledge Base for GlobalProtect VPN Error 503 resolution steps.`,
      tool_name: 'search_knowledge_base',
      tool_input: { query: 'GlobalProtect VPN Error 503 gateway unreachable' },
      tool_output: `[KB-VPN-001 - ${kbDoc.title}]\n${kbDoc.content}`,
      timestamp: timeStr
    });

    // Tool 4: System Status
    const vpnService = services.find(s => s.id === 'vpn');
    steps.push({
      phase: 'ACT',
      thought: `Checked real-time telemetry of GlobalProtect VPN Gateways.`,
      tool_name: 'check_system_status',
      tool_input: { service_name: 'vpn' },
      tool_output: `Status: ${vpnService?.status} | Latency: ${vpnService?.latency_ms}ms | Capacity: ${vpnService?.capacity}\nEndpoints: ${vpnService?.endpoints.join(', ')}`,
      timestamp: timeStr
    });

    steps.push({
      phase: 'ITERATE',
      thought: `VPN telemetry confirms gateways are fully operational (${vpnService?.latency_ms}ms latency). Root cause is client-side DNS cache or captive portal. Synthesizing OS-specific resolution for ${emp.os}.`,
      timestamp: timeStr
    });

    const isMac = emp.os.toLowerCase().includes('mac');
    const dnsCommand = isMac
      ? 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder'
      : 'ipconfig /flushdns';

    finalResponse = `Hello ${emp.name},\n\n` +
      `I inspected our network telemetry and confirmed that **GlobalProtect VPN Gateways are healthy and fully operational** (${vpnService?.latency_ms}ms latency, ${vpnService?.capacity}).\n\n` +
      `The **Error 503 (Gateway Unreachable)** you are experiencing is typically caused by local client-side DNS resolution issues or captive portals.\n\n` +
      `### Step-by-Step Fix for ${emp.os}:\n` +
      `1. **Flush Local DNS Cache**:\n` +
      `   - Run the following in your ${isMac ? 'Terminal' : 'PowerShell (Run as Admin)'}:\n` +
      `   \`\`\`bash\n   ${dnsCommand}\n   \`\`\`\n` +
      `2. **Switch Gateway Address**:\n` +
      `   - In the GlobalProtect client, click the gear icon ➔ **Settings** ➔ **Gateways**.\n` +
      `   - Change your primary gateway from \`vpn-east.corp.company.com\` to \`vpn-west.corp.company.com\`.\n` +
      `3. **Verify Corporate Root CA Certificate**:\n` +
      `   - If you recently updated your OS, navigate to \`https://portal.corp.company.com/certs\` to re-download Corporate-Root-CA.crt.\n\n` +
      `If the issue continues after these steps, reply to this message and I will immediately escalate a ticket to our Network Engineering team!`;

  } else if (intent === 'system_status') {
    steps.push({
      phase: 'PLAN',
      thought: `Execute MCP Tool 'check_system_status' across all infrastructure endpoints to gather real-time latency, operational status, and active advisories.`,
      timestamp: timeStr
    });

    const telemetryReport = services.map(s => 
      `[${s.status === 'Operational' ? '✓' : '⚠'}] ${s.name}: ${s.status} (${s.latency_ms}ms, ${s.capacity})${s.incident ? `\n    Incident: ${s.incident}` : ''}`
    ).join('\n');

    steps.push({
      phase: 'ACT',
      thought: `Polled all 6 enterprise service clusters.`,
      tool_name: 'check_system_status',
      tool_input: { service_name: 'all' },
      tool_output: telemetryReport,
      timestamp: timeStr
    });

    steps.push({
      phase: 'ITERATE',
      thought: `Telemetry evaluated. Found 5 Operational services, 1 Degraded service (M365 Exchange). Synthesizing status brief.`,
      timestamp: timeStr
    });

    finalResponse = `Here is the current operational health of all company IT services:\n\n` +
      `\`\`\`text\n${telemetryReport}\n\`\`\`\n\n` +
      `**Summary:**\n` +
      `• **VPN, Active Directory SSO, and Postgres Databases** are fully operational with normal latency (<30ms).\n` +
      `• **Microsoft 365 Exchange** has an active Microsoft service advisory (**EX781290**) causing cached-mode shared mailbox sync delays. The webmail portal at \`https://outlook.office.com\` is unaffected.`;

  } else if (intent === 'hardware_trouble') {
    const emp = matchedEmployee || employees[6]; // Dwight Schrute
    const nextTicketNum = `IT-${1043 + tickets.length - 5}`;

    steps.push({
      phase: 'PLAN',
      thought: `Hardware fault identified. 1) Consult KB for docking station power cycling. 2) Escalate incident to Desktop Support via MCP Tool 'escalate_ticket'.`,
      timestamp: timeStr
    });

    const kbHw = knowledgeBase.find(k => k.id === 'KB-HDW-003') || knowledgeBase[2];
    steps.push({
      phase: 'ACT',
      thought: `Searched IT Knowledge Base for docking station display power cycle SOP.`,
      tool_name: 'search_knowledge_base',
      tool_input: { query: 'docking station flashing amber displaylink reset' },
      tool_output: `[KB-HDW-003 - ${kbHw.title}]\n${kbHw.content}`,
      timestamp: timeStr
    });

    newTicket = {
      id: tickets.length + 1,
      ticket_id: nextTicketNum,
      employee_id: emp.employee_id,
      employee_name: emp.name,
      title: `Hardware Fault: Docking station / display failure (${emp.laptop_asset_tag})`,
      description: `User reported peripheral issue: "${userMessage}". Self-service power cycle SOP dispatched. Assigned to Desktop Support.`,
      category: 'Hardware',
      priority: 'P3-Medium',
      status: 'Open',
      assigned_team: 'Desktop Support',
      created_at: dateStr,
      resolved_at: null
    };

    newLog = {
      id: logs.length + 1,
      timestamp: dateStr,
      event_type: 'TICKET_ESCALATED',
      actor: emp.name,
      details: `Escalated ticket ${nextTicketNum} [P3-Medium] to Desktop Support: ${newTicket.title}`,
      severity: 'WARN',
      status: 'Success'
    };

    steps.push({
      phase: 'ACT',
      thought: `Dispatched Tier-2 ticket to Desktop Support and registered record in SQLite database.`,
      tool_name: 'escalate_ticket',
      tool_input: {
        employee_identifier: emp.email,
        title: newTicket.title,
        category: 'Hardware',
        priority: 'P3-Medium',
        assigned_team: 'Desktop Support'
      },
      tool_output: `✓ Ticket Created: ${nextTicketNum}\nPriority: P3-Medium\nAssigned Team: Desktop Support\nJira Payload Dispatched.`,
      timestamp: timeStr
    });

    steps.push({
      phase: 'ITERATE',
      thought: `Ticket filed and dispatched to Jira. Formulating emergency dock discharge instructions and ticket SLA expectations.`,
      timestamp: timeStr
    });

    finalResponse = `Hello ${emp.name},\n\n` +
      `I have logged and escalated a Tier-2 hardware service request on your behalf:\n\n` +
      `• **Ticket ID**: \`${nextTicketNum}\`\n` +
      `• **Priority**: P3-Medium (SLA: 4-hour initial response)\n` +
      `• **Assigned Team**: Desktop Support\n` +
      `• **Workstation Tag**: \`${emp.laptop_asset_tag}\`\n\n` +
      `### Quick Hardware Reset Procedure (Try While Queued):\n` +
      `1. **Discharge Residual Capacitance**:\n` +
      `   - Unplug all USB, HDMI, and DisplayPort cables from your dock.\n` +
      `   - Unplug the dock's AC power adapter from the electrical outlet.\n` +
      `   - Hold the dock's power button down continuously for **15 seconds**.\n` +
      `   - Plug the AC power adapter back in first, wait 5 seconds, then reconnect your laptop's USB-C cable.\n\n` +
      `If the amber flashing LED persists, a Desktop Support technician will dispatch a replacement dock from the IT Depot.`;

  } else if (intent === 'ticket_query') {
    steps.push({
      phase: 'PLAN',
      thought: `Query SQLite 'it_tickets' table using MCP Tool 'query_helpdesk_db' for active and historical tickets.`,
      timestamp: timeStr
    });

    const ticketMatch = userMessage.toUpperCase().match(/IT-\d+/);
    let matchedTickets = tickets;
    let queryStr = `SELECT * FROM it_tickets;`;
    if (ticketMatch) {
      const tid = ticketMatch[0];
      matchedTickets = tickets.filter(t => t.ticket_id === tid);
      queryStr = `SELECT * FROM it_tickets WHERE ticket_id='${tid}';`;
    } else if (matchedEmployee) {
      matchedTickets = tickets.filter(t => t.employee_id === matchedEmployee?.employee_id);
      queryStr = `SELECT * FROM it_tickets WHERE employee_id='${matchedEmployee.employee_id}';`;
    }

    steps.push({
      phase: 'ACT',
      thought: `Executed SQL query on it_tickets table.`,
      tool_name: 'query_helpdesk_db',
      tool_input: { query: queryStr },
      tool_output: JSON.stringify(matchedTickets, null, 2),
      timestamp: timeStr
    });

    steps.push({
      phase: 'ITERATE',
      thought: `Retrieved ${matchedTickets.length} ticket records. Formatting markdown report.`,
      timestamp: timeStr
    });

    finalResponse = `Here are the ticket details retrieved from the IT database:\n\n` +
      matchedTickets.map(t => 
        `• **${t.ticket_id}**: *${t.title}*\n` +
        `  - Status: **${t.status}** | Priority: **${t.priority}** | Category: ${t.category}\n` +
        `  - Assigned Team: ${t.assigned_team}\n` +
        `  - Requester: ${t.employee_name} (${t.employee_id})\n` +
        `  - Created: ${t.created_at}${t.resolved_at ? ` | Resolved: ${t.resolved_at}` : ''}`
      ).join('\n\n') +
      `\n\nNeed to update or escalate any of these tickets? Just let me know!`;

  } else {
    // General Inquiry
    steps.push({
      phase: 'PLAN',
      thought: `Query Knowledge Base RAG Tool for relevant corporate IT documentation matching query keywords.`,
      timestamp: timeStr
    });

    const bestDoc = knowledgeBase[0];
    steps.push({
      phase: 'ACT',
      thought: `Searched Knowledge Base for: "${userMessage}"`,
      tool_name: 'search_knowledge_base',
      tool_input: { query: userMessage },
      tool_output: `[${bestDoc.id} - ${bestDoc.title}]\n${bestDoc.content}`,
      timestamp: timeStr
    });

    steps.push({
      phase: 'ITERATE',
      thought: `Analyzed knowledge base context. Synthesized informative Tier-1 support guidance.`,
      timestamp: timeStr
    });

    finalResponse = `Thank you for reaching out to the IBM AI IT Helpdesk!\n\n` +
      `Here is the relevant policy information from our IT Knowledge Base:\n\n` +
      `**${bestDoc.title}** (${bestDoc.category})\n` +
      `\`\`\`text\n${bestDoc.content}\n\`\`\`\n\n` +
      `**How I Can Assist You:**\n` +
      `1. **Employee & Asset Queries** (\`query_helpdesk_db\`)\n` +
      `2. **Automated Password/MFA Reset** (\`reset_employee_password\`)\n` +
      `3. **Infrastructure Outage Checks** (\`check_system_status\`)\n` +
      `4. **Hardware & Ticket Escalation** (\`escalate_ticket\`)`;
  }

  return {
    finalResponse,
    thoughtSteps: steps,
    matchedEmployee,
    newTicket,
    newLog
  };
}
