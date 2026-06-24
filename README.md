# AccessBridge 🌉
**A Zero-Trust, LangGraph-Powered Community Resource Navigator**

AccessBridge is an advanced, multi-agent AI system designed to connect underserved communities with hyper-local resources, grants, and skills training. 

Unlike generic chatbots, AccessBridge operates as a strict **Decision-Support Engine**. It relies on deterministic state-machine routing, explicit zero-trust boundaries, and verifiable mock registries to prevent hallucination and provide actionable, measurable outputs.

---

## 🚀 Key Innovations

1. **Implicit Localization**
   The Intake Agent is engineered to seamlessly parse local shorthand and Nigerian Pidgin (e.g., translating "Lasgidi" to "Lagos", or "I dey find money for school" to a strict `{need_category: scholarship}` JSON schema) without triggering frustrating Clarification loops.
2. **Zero-Trust Architecture**
   A dedicated `PolicyInterceptorGate` actively parses incoming payloads to block PII (NINs, Phone Numbers) and malicious prompts before they ever reach the LLM context window. 
3. **LangGraph State Machine**
   The application logic abandons traditional sequential chaining in favor of a cyclical LangGraph architecture. Agents (Intake, Clarification, Discovery, Eligibility, Action Plan) deterministically route and mutate the graph state based on strictly enforced schemas.
4. **Last-Mile Export**
   The React Canvas UI features native PDF Generation and WhatsApp deep-linking, allowing community Caseworkers to seamlessly share Action Plans and Trust Badges directly with clients on mobile devices.

---

## 🛠️ Architecture

* **Presentation Layer**: React + Vite + Tailwind CSS (Interactive Canvas UI)
* **Orchestration Layer**: LangGraph + FastAPI
* **Intelligence Engine**: Ollama (Local) / Groq Cloud
* **Data Layer**: Local Model Context Protocol (MCP) interfacing with a verified `nigeria_registry.json`.

---

## 💻 Getting Started

This repository contains both the FastAPI backend and the React frontend.

### 1. Start the Backend (FastAPI + LangGraph)
Navigate to the root directory and run the Uvicorn server:
```bash
python -m uvicorn backend.main:app --port 8002 --reload
```

### 2. Start the Frontend (Vite)
Open a second terminal, navigate to the frontend folder, install dependencies, and start the Vite development server:

```bash


cd frontend
npm install
npm run dev
```

### 3. Usage
Open your browser to http://localhost:5173. Try testing the implicit localization engine with a prompt like:

"I am a student and I dey find money for my school for Lasgidi"

##🛡️ Telemetry & Observability
While the system executes, it tracks latencies and agent routing internally via the execution_trace. This proves the multi-agent routing architecture to technical stakeholders without exposing raw developer telemetry to end-users in productio
