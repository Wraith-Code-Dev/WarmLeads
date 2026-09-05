import hashlib
from typing import Optional

def generate_dedup_hash(title: str, budget_min: Optional[float], budget_max: Optional[float], platform: Optional[str] = None) -> str:
    """
    Generates a deterministic SHA-256 hash to identify and deduplicate identical job postings.
    Uses normalized title, budget constraints, and optional platform/source identifier.
    """
    clean_title = (title or "").strip().lower()
    b_min = float(budget_min) if budget_min is not None else 0.0
    b_max = float(budget_max) if budget_max is not None else 0.0
    
    payload = f"{clean_title}|{b_min}|{b_max}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()
