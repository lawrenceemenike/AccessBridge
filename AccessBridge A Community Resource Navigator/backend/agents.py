import json
import re
from langchain_community.chat_models import ChatOllama
from backend.state import AccessBridgeState
from backend.mcp_server import NigeriaResourceRegistry

# Initialize local LLM (Ollama running Gemma 12B or similar)
llm = ChatOllama(model="gemma", temperature=0.1)

def node_intake(state: AccessBridgeState):
    """
    Uses the LLM to parse sanitized_prompt and extract a JSON dictionary.
    """
    prompt = f"""
You are an expert intake parser. Extract the user's region, status, and need_category from the following prompt.
You must implicitly translate and parse Nigerian Pidgin or localized shorthand into the strict English JSON schema. For example, if a user types 'I dey find money for my school for Lasgidi', extract 'status': 'student', 'need_category': 'scholarship', and 'region': 'Lagos'. Do not ask for clarification if the Pidgin intent is clear.

Return ONLY valid JSON.
The need_category must be exactly one of: "scholarship", "skills_training", "medical_fund".

User Prompt: {state.get('sanitized_prompt', '')}

Output JSON format:
{{
  "region": "...",
  "status": "...",
  "need_category": "..."
}}
"""
    response = llm.invoke(prompt)
    content = response.content.strip()
    
    # Try to extract JSON from markdown blocks if the LLM wraps it
    match = re.search(r'```(?:json)?(.*?)```', content, re.DOTALL)
    if match:
        content = match.group(1).strip()
    
    try:
        extracted = json.loads(content)
    except Exception:
        # Fallback if parsing fails to avoid breaking the graph
        extracted = {"region": "", "status": "", "need_category": ""}
        
    missing = []
    if not extracted.get("region"): missing.append("region")
    if not extracted.get("status"): missing.append("status")
    if not extracted.get("need_category"): missing.append("need_category")
    
    clarification_needed = len(missing) > 0
    return {"extracted_profile": extracted, "clarification_needed": clarification_needed}

def node_clarification(state: AccessBridgeState):
    """
    Uses the LLM to write a polite, conversational follow-up question for missing data.
    """
    extracted = state.get('extracted_profile', {})
    missing = []
    if not extracted.get("region"): missing.append("region")
    if not extracted.get("status"): missing.append("status")
    if not extracted.get("need_category"): missing.append("need_category")
    
    prompt = f"""
The user is missing the following required fields: {', '.join(missing)}.
Write a polite, conversational follow-up question asking for this specific information to help them find community resources.
Do not mention JSON or any technical terms. Keep it short and supportive.
"""
    response = llm.invoke(prompt)
    return {"clarification_message": response.content.strip()}

def node_discovery(state: AccessBridgeState):
    """
    Instantiates NigeriaResourceRegistry and queries opportunities.
    """
    registry = NigeriaResourceRegistry()
    profile = state.get('extracted_profile', {})
    
    region = profile.get('region', '')
    status = profile.get('status', '')
    need_category = profile.get('need_category', '')
    
    results = registry.query_opportunities(region, status, need_category)
    return {"mcp_results": results}

def node_eligibility(state: AccessBridgeState):
    """
    Uses the LLM to cross-reference extracted_profile against mcp_results to determine eligibility.
    """
    prompt = f"""
You are an eligibility evaluator. Cross-reference the user profile against the registry results.
Determine if the user qualifies for the resources.

User Profile: {json.dumps(state.get('extracted_profile', {}))}
Registry Results: {state.get('mcp_results', '')}

Provide a short reasoning, then output the final decision on a new line as exactly one of: 
'High Confidence', 'Low Confidence', or 'Insufficient Info'.
"""
    response = llm.invoke(prompt)
    return {"eligibility_decision": response.content}

def node_action_plan(state: AccessBridgeState):
    """
    Uses the LLM to write a step-by-step structured JSON action plan based on eligible resources.
    """
    prompt = f"""
You are an action plan generator. Write an action plan for the user based on the eligible resources.

User Profile: {json.dumps(state.get('extracted_profile', {}))}
Registry Results: {state.get('mcp_results', '')}
Eligibility Decision: {state.get('eligibility_decision', '')}

Output EXACTLY this JSON structure:
{{
  "summary": "Brief 2-sentence overview",
  "trust_badge": "Verified by AccessBridge",
  "quantitative_metrics": {{
    "grant_amount": "extracted from registry, e.g. ₦500,000",
    "historical_approval_rate": "extracted from registry, e.g. 45%",
    "match_confidence_score": "Generate a mock percentage like 85% based on eligibility decision"
  }},
  "local_contact": {{
    "officer": "extracted contact_officer",
    "address": "extracted office_address",
    "phone": "extracted phone_number"
  }},
  "steps": [ 
    {{
      "title": "...", 
      "description": "...", 
      "deadline": "...", 
      "is_clickable": true, 
      "action_url": "extracted action_url from registry"
    }} 
  ],
  "required_documents": ["...", "..."],
  "reasoning_trace": "Explain why this resource was selected based on the user's region and status."
}}
"""
    response = llm.invoke(prompt)
    content = response.content.strip()
    
    match = re.search(r'```(?:json)?(.*?)```', content, re.DOTALL)
    if match:
        content = match.group(1).strip()
    
    try:
        action_plan_json = json.loads(content)
    except Exception:
        action_plan_json = {
            "summary": "Error generating action plan.",
            "trust_badge": "Unverified",
            "quantitative_metrics": {},
            "local_contact": {},
            "steps": [],
            "required_documents": [],
            "reasoning_trace": "Parsing failed."
        }
        
    return {"action_plan": action_plan_json}
