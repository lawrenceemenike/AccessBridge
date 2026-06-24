# STRIDE Threat Model: AccessBridge

## Overview
This document outlines the STRIDE threat model for the AccessBridge architecture, focusing on the Multi-Agent Graph and the `nigeria_resource_registry` MCP server boundaries.

## Architecture Components Evaluated
- `IntakeAgent`
- `DiscoveryAgent`
- `EligibilityAgent`
- `ActionPlanAgent`
- `PolicyInterceptor`
- `nigeria_resource_registry` (MCP Server)
- `FastAPI Server (/api/navigate)`

## Threat Analysis (STRIDE)

### 1. Spoofing (Identity)
- **Threat**: An attacker impersonates a legitimate user by submitting requests directly to the `/api/navigate` endpoint without authentication, or a rogue service impersonates the MCP server.
- **Mitigation**: The current `main.py` implements permissive CORS (`allow_origins=["*"]`) which allows cross-site spoofing. **Action Required**: Restrict CORS origins to the trusted React frontend domain. Introduce API key validation or JWT-based authentication at the FastAPI layer before requests reach the LangGraph orchestrator.

### 2. Tampering (Data Integrity)
- **Threat**: An attacker crafts a malicious JSON payload at the `/api/navigate` ingress to execute prompt injection or crash the parser, or tampers with MCP query parameters.
- **Mitigation**: The current `main.py` uses Pydantic (`NavigateRequest`) to enforce basic string type validation on the incoming JSON payload. However, **Action Required**: Add stricter Pydantic validation (e.g., max string length, character whitelisting) to sanitize the `prompt` string before it hits the `PolicyInterceptor` or LangGraph orchestrator.

### 3. Repudiation (Non-repudiation)
- **Threat**: A user denies submitting a request that led to a resource allocation, or the system cannot trace which agent made a specific MCP tool call.
- **Mitigation**: As per our global engineering standards, instrument all components with **OpenTelemetry**. Log all agent interactions, interceptor decisions, and MCP tool executions with correlation IDs, ensuring an immutable audit trail.

### 4. Information Disclosure (Confidentiality) - *Focus Area*
- **Threat**: The `IntakeAgent` ingests highly sensitive Personal Identifiable Information (PII) such as National Identity Numbers (NIN) or medical records. If this flows to the `DiscoveryAgent`, it could be leaked to external MCP servers.
- **Mitigation**: 
  - **Masking PII during Intake**: The `PolicyInterceptor` acts as a hard security boundary immediately after the `IntakeAgent`. It must employ pattern matching and LLM-based redaction to strip all PII (e.g., replacing a NIN with `[REDACTED_NIN]`).
  - **Securing MCP Boundaries**: The `DiscoveryAgent` is restricted to only passing safe, abstract parameters (`region`, `status`, `need_category`) to the `nigeria_resource_registry`. The MCP server is sandboxed and completely isolated from any raw user context.

### 5. Denial of Service (Availability)
- **Threat**: An attacker floods the `/api/navigate` endpoint with high-frequency or excessively long prompts, instantly exhausting local LLM compute resources and crashing the stateful LangGraph engine.
- **Mitigation**: The current `main.py` lacks any rate limits or token constraints. **Action Required**: Implement `slowapi` or an equivalent rate limiter on the FastAPI router. Enforce a strict max length (e.g., 500 characters) on the Pydantic `prompt` field to prevent token spamming.

### 6. Elevation of Privilege (Authorization)
- **Threat**: A user crafts a prompt that bypasses the `EligibilityAgent`'s constraints, forcing the `ActionPlanAgent` to generate an approval checklist for resources they do not qualify for.
- **Mitigation**: Employ Zero-Trust security. The `EligibilityAgent` must use deterministic, rule-based constraint evaluation rather than purely LLM-driven decisions. The `PolicyInterceptor` must validate the final output of the `EligibilityAgent` before the `ActionPlanAgent` is invoked.

## Conclusion
The introduction of the `PolicyInterceptor` is critical to maintaining a Zero-Trust posture. By strictly enforcing PII redaction before MCP tool invocation, AccessBridge ensures that the `nigeria_resource_registry` operates purely on abstract needs, safeguarding underserved communities from data exploitation.
