from typing import TypedDict, Dict, Any

class AccessBridgeState(TypedDict):
    raw_user_prompt: str
    sanitized_prompt: str
    extracted_profile: Dict[str, Any]
    mcp_results: str
    eligibility_decision: str
    action_plan: Dict[str, Any]
    security_flag: bool
    security_message: str
    clarification_needed: bool
    clarification_message: str
