#!/usr/bin/env python3
"""
setup_db.py - Database Initialization & Seed Script for AI IT Helpdesk Agent
Author: Senior AI Engineer (IBM Internship Project)
Description: Initializes SQLite database (helpdesk.db) and populates realistic
enterprise records across employees, it_tickets, and system_logs tables.
"""

import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "helpdesk.db")


def initialize_database():
    print(f"[*] Initializing SQLite database at: {DB_PATH}")

    # Remove existing database if present for a clean state
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("[+] Existing database cleared.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. EMPLOYEES TABLE
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
    );
    """)

    # 2. IT_TICKETS TABLE
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
        resolved_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
    );
    """)

    # 3. SYSTEM_LOGS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        actor TEXT NOT NULL,
        details TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'INFO',
        status TEXT NOT NULL DEFAULT 'Success'
    );
    """)

    # ---------------------------------------------------------
    # SEED DATA
    # ---------------------------------------------------------
    employees_data = [
        ("EMP-1001", "Sarah Connor", "sarah.connor@company.com", "Security Operations", "Lead SecOps Engineer", "John Matrix", "LAP-M3-8821", "macOS Sonoma 14.5", "+1-555-0101", "Active"),
        ("EMP-1002", "Michael Scott", "michael.scott@company.com", "Sales & Accounts", "Regional Director", "Jan Levinson", "LAP-DELL-4412", "Windows 11 Enterprise", "+1-555-0102", "Active"),
        ("EMP-1003", "Pam Beesly", "pam.beesly@company.com", "Administration", "Office Administrator", "Michael Scott", "LAP-LEN-9031", "Windows 11 Pro", "+1-555-0103", "Active"),
        ("EMP-1004", "Tony Stark", "tony.stark@company.com", "Research & Hardware", "Chief Architect", "Board of Directors", "LAP-CUSTOM-001", "Ubuntu Linux 24.04", "+1-555-0104", "Active"),
        ("EMP-1005", "Peter Parker", "peter.parker@company.com", "IT Infrastructure", "Junior Systems Intern", "Tony Stark", "LAP-M2-5509", "macOS Ventura 13.6", "+1-555-0105", "Active"),
        ("EMP-1006", "Bruce Wayne", "bruce.wayne@company.com", "Executive Board", "Managing Director", "Self", "LAP-X1-9988", "Windows 11 Enterprise", "+1-555-0106", "Active"),
        ("EMP-1007", "Dwight Schrute", "dwight.schrute@company.com", "Sales & Accounts", "Assistant to the Regional Director", "Michael Scott", "LAP-DELL-1122", "Windows 10 Enterprise", "+1-555-0107", "Active"),
        ("EMP-1008", "Jim Halpert", "jim.halpert@company.com", "Sales & Accounts", "Senior Account Manager", "Michael Scott", "LAP-M2-3312", "macOS Sonoma 14.4", "+1-555-0108", "Active"),
    ]

    cursor.executemany("""
    INSERT INTO employees (employee_id, name, email, department, role, manager, laptop_asset_tag, os, phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, employees_data)

    now = datetime.datetime.now()
    t_minus_1 = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
    t_minus_2 = (now - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
    t_minus_3 = (now - datetime.timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
    t_minus_5 = (now - datetime.timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")

    tickets_data = [
        ("IT-1042", "EMP-1002", "Michael Scott", "Cannot connect to GlobalProtect VPN", "GlobalProtect client reports Error 503: Gateway Unreachable from home WiFi.", "Network", "P2-High", "Open", "Network Engineering", t_minus_1, None),
        ("IT-1039", "EMP-1003", "Pam Beesly", "Outlook 365 Shared Mailbox sync delay", "Executive shared inbox not syncing new calendar invitations.", "Software", "P3-Medium", "In Progress", "Workplace Apps", t_minus_2, None),
        ("IT-1035", "EMP-1001", "Sarah Connor", "Request YubiKey 5C NFC hardware replacement", "Lost primary hardware token during transit, currently using emergency SMS fallback.", "Security", "P2-High", "Resolved", "SecOps Identity", t_minus_5, t_minus_3),
        ("IT-1028", "EMP-1007", "Dwight Schrute", "Desk dual monitor docking station power surge", "USB-C DisplayLink dock flashing amber LED and not transmitting HDMI signal.", "Hardware", "P3-Medium", "Open", "Desktop Support", t_minus_3, None),
        ("IT-1011", "EMP-1004", "Tony Stark", "Kubernetes cluster local tunnel certificate renewal", "Self-signed root CA certificate expired for staging ingress endpoint.", "DevOps", "P1-Critical", "Resolved", "Infrastructure Core", t_minus_5, t_minus_5),
    ]

    cursor.executemany("""
    INSERT INTO it_tickets (ticket_id, employee_id, employee_name, title, description, category, priority, status, assigned_team, created_at, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, tickets_data)

    logs_data = [
        (t_minus_5, "AUTH_MFA_CHALLENGE", "sarah.connor@company.com", "Emergency SMS OTP verified after YubiKey loss.", "WARN", "Success"),
        (t_minus_3, "VPN_GATEWAY_HEALTH", "SYSTEM_HEALTH_PROBE", "US-East-1 VPN gateway reached 92% tunnel capacity threshold.", "WARN", "Resolved"),
        (t_minus_2, "ACCOUNT_PWD_RESET", "admin.helpdesk@company.com", "Automated password reset link sent to pam.beesly@company.com.", "INFO", "Success"),
        (t_minus_1, "AUTH_FAILED_ATTEMPT", "michael.scott@company.com", "3 failed Kerberos password attempts on workstation LAP-DELL-4412.", "WARN", "Account Flagged"),
        (now.strftime("%Y-%m-%d %H:%M:%S"), "SYSTEM_BOOTSTRAP", "setup_db.py", "Helpdesk SQLite seed completed with 8 employees, 5 tickets, 5 log events.", "INFO", "Success"),
    ]

    cursor.executemany("""
    INSERT INTO system_logs (timestamp, event_type, actor, details, severity, status)
    VALUES (?, ?, ?, ?, ?, ?);
    """, logs_data)

    conn.commit()
    conn.close()

    print(f"[✓] Successfully populated 'helpdesk.db' with:")
    print(f"    - {len(employees_data)} Employee profiles")
    print(f"    - {len(tickets_data)} Historical IT Tickets")
    print(f"    - {len(logs_data)} System Audit Log entries")


if __name__ == "__main__":
    initialize_database()
