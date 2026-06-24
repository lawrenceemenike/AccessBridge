---
name: stride-threat-model
description: Evaluates the architecture against STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
---

# STRIDE Threat Modeling Instructions

To execute a STRIDE threat model:
1. Review the provided architecture specification or system design.
2. For each element in the architecture, analyze the following threats:
   - **Spoofing**: Can an attacker impersonate a user, component, or system?
   - **Tampering**: Can an attacker modify data in transit or at rest?
   - **Repudiation**: Can an attacker perform an action without a trace or deny performing an action?
   - **Information Disclosure**: Can an attacker access sensitive data (e.g., PII)?
   - **Denial of Service (DoS)**: Can an attacker overwhelm the system to degrade or deny service?
   - **Elevation of Privilege**: Can an attacker gain unauthorized access or permissions?
3. Generate a structured Markdown report detailing the identified threats, specifically focusing on MCP tool boundaries and masking PII during the Intake phase.
4. The output should be saved to `threat_model.md` in the workspace root.
