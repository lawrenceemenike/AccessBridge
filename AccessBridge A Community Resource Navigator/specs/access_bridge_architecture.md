# AccessBridge: A Community Resource Navigator - Architecture Specification

## ADK Multi-Agent Graph

The system is composed of the following agents within an ADK Multi-Agent Graph:

```yaml
components:
  - name: IntakeAgent
    type: Agent
    description: Parses user profile and extracts relevant information.
  - name: DiscoveryAgent
    type: Agent
    description: Calls the MCP server to find available resources.
  - name: EligibilityAgent
    type: Agent
    description: Evaluates constraints to determine user eligibility for resources.
  - name: ActionPlanAgent
    type: Agent
    description: Generates a step-by-step checklist or action plan for the user.
  - name: PolicyInterceptor
    type: Interceptor
    description: Screens all interactions for PII and unverified claims, enforcing Zero-Trust security.
```

## MCP Server Schema

```yaml
mcp_servers:
  - name: nigeria_resource_registry
    description: Local MCP server for querying available community resources and opportunities in Nigeria.
    tools:
      - name: query_opportunities
        description: Queries the registry for opportunities based on region, status, and need category.
        parameters:
          type: object
          properties:
            region:
              type: string
              description: The geographical region in Nigeria (e.g., Lagos, Abuja, Kano).
            status:
              type: string
              description: The user's current status (e.g., student, unemployed, entrepreneur).
            need_category:
              type: string
              description: The category of resource needed (e.g., scholarship, medical, housing).
          required:
            - region
            - status
            - need_category
```

## BDD Scenarios

### Scenario 1: Happy Path - Scholarship Search
**Given** a final-year student in Lagos seeking scholarships
**When** the user provides their profile to the `IntakeAgent`
**Then** the `PolicyInterceptor` validates the request
**And** the `DiscoveryAgent` calls `query_opportunities` on `nigeria_resource_registry` with `region="Lagos"`, `status="student"`, `need_category="scholarship"`
**And** the `EligibilityAgent` confirms the student meets the criteria
**And** the `ActionPlanAgent` generates an application checklist.

### Scenario 2: Security Interception Path - PII Included
**Given** a user requesting medical funding
**When** the user provides their profile containing sensitive PII (e.g., medical records, National Identity Number) to the `IntakeAgent`
**Then** the `PolicyInterceptor` detects the PII
**And** the `PolicyInterceptor` blocks the request or redacts the PII before any downstream processing
**And** the system alerts the user that PII transmission is not allowed.
