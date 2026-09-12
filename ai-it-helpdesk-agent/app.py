"""
app.py - Streamlit Interactive Dashboard for AI IT Helpdesk Agent
Author: Senior AI Engineer (IBM Internship Project)
Description: Complete Streamlit web application providing real-time ReAct loop
visualization, MCP tool execution tracing, persistent chat history, database inspection,
and system health telemetry.
"""

import streamlit as st
import json
import sqlite3
import os
from agent_core import execute_autonomous_react_loop, MCPToolDispatcher
from tools.system_status_tool import check_status_mcp

# -----------------------------------------------------------------------------
# Streamlit Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="IBM AI IT Helpdesk Agent",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for executive enterprise look
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #0f62fe;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #525252;
        margin-bottom: 1.2rem;
    }
    .badge-perceive { background-color: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
    .badge-plan { background-color: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
    .badge-act { background-color: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
    .badge-iterate { background-color: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
    .mcp-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-family: monospace; font-size: 0.85rem; }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# Initialize Persistent Session State
# -----------------------------------------------------------------------------
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": (
                "👋 Hello! I am your **IBM IT Helpdesk Tier-1 Support Agent**.\n\n"
                "I operate autonomously on a **Perceive ➔ Plan ➔ Act ➔ Iterate** loop with Model Context Protocol (MCP) tools.\n\n"
                "How can I assist you today? You can report an incident (e.g. *VPN Error 503*), "
                "request a password reset, check system outages, or query open tickets."
            ),
            "thought_steps": []
        }
    ]

if "provider" not in st.session_state:
    st.session_state.provider = "Autonomous ReAct Engine"

if "api_key" not in st.session_state:
    st.session_state.api_key = ""


# -----------------------------------------------------------------------------
# Sidebar: Controls, Telemetry & Database Inspector
# -----------------------------------------------------------------------------
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", width=110)
    st.markdown("### ⚙️ IT Agent Configuration")

    provider = st.selectbox(
        "Model Reasoning Engine",
        ["Autonomous ReAct Engine (Local)", "Groq (llama-3.1-8b-instant)", "OpenAI (gpt-4o-mini)", "Google Gemini (1.5-flash)"],
        index=0
    )
    st.session_state.provider = provider

    if "Groq" in provider or "OpenAI" in provider or "Gemini" in provider:
        st.session_state.api_key = st.text_input(
            f"Enter {provider.split()[0]} API Key",
            type="password",
            value=st.session_state.api_key,
            help="Your API key stays local in session memory."
        )

    st.markdown("---")
    st.markdown("### 🟢 Infrastructure Telemetry")

    # Real-time telemetry check
    telemetry = check_status_mcp("all")["metadata"]["telemetry"]
    cols = st.columns(2)
    for i, (key, info) in enumerate(telemetry.items()):
        col = cols[i % 2]
        is_ok = info["status"] == "Operational"
        col.metric(
            label=f"{info['name'].split()[0]}",
            value=info["status"],
            delta=f"{info['latency_ms']}ms" if is_ok else "Advisory",
            delta_color="normal" if is_ok else "inverse"
        )

    st.markdown("---")
    st.markdown("### 💡 Quick Test Scenarios")
    quick_prompts = [
        "My name is Michael Scott and I cannot connect to GlobalProtect VPN (Error 503)",
        "Reset password for pam.beesly@company.com - account locked",
        "Check system status and active outages across all IT services",
        "Dwight Schrute here. My USB-C docking station is flashing amber and monitors won't turn on",
        "What is the status of IT ticket IT-1042?"
    ]

    for qp in quick_prompts:
        if st.button(f"👉 {qp[:36]}...", key=qp, use_container_width=True):
            st.session_state.next_prompt = qp

    st.markdown("---")
    if st.button("🗑️ Reset Conversation Memory", use_container_width=True, type="secondary"):
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "Conversation memory reset. How can I assist you with your IT needs today?",
                "thought_steps": []
            }
        ]
        st.rerun()

    # Database quick inspect
    with st.expander("📁 Inspect SQLite helpdesk.db"):
        db_path = os.path.join(os.path.dirname(__file__), "helpdesk.db")
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            selected_table = st.selectbox("Select Table", ["employees", "it_tickets", "system_logs"])
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {selected_table} LIMIT 5;")
            rows = cursor.fetchall()
            cols = [d[0] for d in cursor.description]
            conn.close()
            st.dataframe([dict(zip(cols, r)) for r in rows], use_container_width=True)
        else:
            st.warning("helpdesk.db not found. Run setup_db.py first.")


# -----------------------------------------------------------------------------
# Main Header
# -----------------------------------------------------------------------------
st.markdown('<div class="main-title">🛡️ Autonomous AI IT Helpdesk Agent</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">IBM Internship Project &bull; Built with LangChain, LangGraph, Python, SQLite &bull; Model Context Protocol (MCP) Decoupled Architecture</div>',
    unsafe_allow_html=True
)

# -----------------------------------------------------------------------------
# Render Chat History with ReAct Tracing Accordions
# -----------------------------------------------------------------------------
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        if msg.get("thought_steps"):
            with st.expander("🧠 View Agent ReAct Reasoning Stream (Perceive ➔ Plan ➔ Act ➔ Iterate)", expanded=False):
                for step in msg["thought_steps"]:
                    phase = step.get("phase", "THOUGHT")
                    badge_class = f"badge-{phase.lower()}"
                    st.markdown(f'<span class="{badge_class}">{phase}</span> **{step.get("thought", "")}**', unsafe_allow_html=True)
                    
                    if step.get("tool_name"):
                        st.markdown(f"**MCP Tool Invocation**: `{step['tool_name']}`")
                        col1, col2 = st.columns(2)
                        with col1:
                            st.caption("📥 Tool Input (MCP Parameters)")
                            st.json(step.get("tool_input", {}))
                        with col2:
                            st.caption("📤 Tool Output (MCP Text Block)")
                            st.text_area("Output", value=step.get("tool_output", ""), height=100, disabled=True)
                    st.markdown("---")

        st.markdown(msg["content"])


# -----------------------------------------------------------------------------
# Handle User Input & Trigger ReAct Agent Loop
# -----------------------------------------------------------------------------
user_input = None
if "next_prompt" in st.session_state and st.session_state.next_prompt:
    user_input = st.session_state.next_prompt
    st.session_state.next_prompt = None
else:
    user_input = st.chat_input("Describe your IT issue (e.g. 'Cannot connect to VPN', 'Reset password', 'Laptop broken')...")

if user_input:
    # Display user message
    st.session_state.messages.append({"role": "user", "content": user_input, "thought_steps": []})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Execute Autonomous ReAct Agent Loop
    with st.chat_message("assistant"):
        with st.spinner("Executing Perceive ➔ Plan ➔ Act ➔ Iterate loop..."):
            result = execute_autonomous_react_loop(
                user_message=user_input,
                chat_history=st.session_state.messages,
                model_provider=st.session_state.provider,
                api_key=st.session_state.api_key
            )

        # Show Live Reasoning Steps in Expandable Accordion
        if result["thought_steps"]:
            with st.expander("🧠 Agent ReAct Reasoning Stream (Perceive ➔ Plan ➔ Act ➔ Iterate)", expanded=True):
                for step in result["thought_steps"]:
                    phase = step.get("phase", "THOUGHT")
                    badge_class = f"badge-{phase.lower()}"
                    st.markdown(f'<span class="{badge_class}">{phase}</span> **{step.get("thought", "")}**', unsafe_allow_html=True)
                    if step.get("tool_name"):
                        st.markdown(f"**MCP Tool**: `{step['tool_name']}`")
                        col1, col2 = st.columns(2)
                        with col1:
                            st.caption("📥 Input Parameters")
                            st.json(step.get("tool_input", {}))
                        with col2:
                            st.caption("📤 MCP Output")
                            st.text_area("Result", value=step.get("tool_output", ""), height=100, disabled=True)
                    st.markdown("---")

        st.markdown(result["final_response"])

    # Persist assistant turn to session
    st.session_state.messages.append({
        "role": "assistant",
        "content": result["final_response"],
        "thought_steps": result["thought_steps"]
    })
