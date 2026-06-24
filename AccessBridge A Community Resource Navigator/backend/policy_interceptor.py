import re

def sanitize_intake_payload(text: str) -> str:
    """
    Screens the incoming payload from the user. Masks emails and phone numbers,
    and outright blocks requests containing highly sensitive keywords.
    """
    if not isinstance(text, str):
        return text

    # Keywords that trigger a strict Zero-Trust block
    # Note: \b ensures we match the whole word
    blocked_keywords = [
        r'\bnin\b', 
        r'\bbvn\b', 
        r'medical record'
    ]
    
    lower_text = text.lower()
    for keyword in blocked_keywords:
        if re.search(keyword, lower_text):
            raise ValueError("Security Exception: Sensitive identity or medical data detected. Request blocked.")

    # Mask email addresses
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    text = re.sub(email_pattern, '[[REDACTED_EMAIL]]', text)

    # Mask phone numbers (matches Nigerian numbers and generic 10+ digit structures)
    # E.g. 08012345678, +2348012345678, +234-801-234-5678
    phone_pattern = r'(?:\+?234|0)[789][01]\d{8}|\b(?:\+?\d{1,3}[\s-]?)?\(?\d{3,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b'
    text = re.sub(phone_pattern, '[[REDACTED_PHONE]]', text)

    return text
