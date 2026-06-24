"""
Security Assertion (TDD Gate):
To securely handle SQL/JSON injection via the arguments (region, status, need_category):
1. Input Validation: All inputs must be verified as strings to prevent payload execution.
2. Sanitization: Inputs are stripped of whitespace and forced to lowercase to normalize data.
3. Decoupling from Execution: We avoid evaluating the arguments as code (e.g. eval() or raw SQL execution).
   Instead, we perform simple equality and substring checks against an in-memory parsed JSON structure.
   This guarantees that malicious payloads in 'region' or 'need_category' cannot break the data access boundaries.
"""

import json
import os
from typing import List, Dict, Any

class NigeriaResourceRegistry:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Resolve to backend/data/nigeria_registry.json by default
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.db_path = os.path.join(current_dir, 'data', 'nigeria_registry.json')
        else:
            self.db_path = db_path
            
        self.data: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self):
        try:
            with open(self.db_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
        except FileNotFoundError:
            self.data = []

    def query_opportunities(self, region: str, status: str, need_category: str) -> str:
        # Strict input validation and sanitization
        if not isinstance(region, str) or not isinstance(status, str) or not isinstance(need_category, str):
            return "No verified resources found for these constraints."

        safe_region = region.strip().lower()
        safe_status = status.strip().lower()
        safe_category = need_category.strip().lower()

        matching_resources = []

        # Filter the in-memory array
        for resource in self.data:
            res_region = resource.get('region', '').strip().lower()
            res_category = resource.get('need_category', '').strip().lower()
            criteria = [c.strip().lower() for c in resource.get('eligibility_criteria', [])]

            # Enforce region constraint (Federal matches all)
            region_match = (res_region == safe_region or res_region == 'federal')
            
            # Enforce category constraint strictly
            category_match = (res_category == safe_category)

            # Check status against criteria (if any criteria exist)
            status_match = False
            if not criteria:
                status_match = True
            else:
                for criterion in criteria:
                    # Simple fuzzy matching for the status within criteria
                    if safe_status in criterion or criterion in safe_status:
                        status_match = True
                        break

            if region_match and category_match and status_match:
                matching_resources.append(resource)

        if not matching_resources:
            return "No verified resources found for these constraints."

        return json.dumps(matching_resources, indent=2)
