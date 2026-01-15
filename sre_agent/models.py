from pydantic import BaseModel
from datetime import datetime
from typing import Literal, Optional

class IncidentArtifact(BaseModel):
    incident_id: str
    detected_at: datetime
    root_cause_analysis: str  # The reasoning trace
    thought_signature: str    # Hash of the logic used
    bad_commit_hash: str
    reproduction_script: str  # Python code
    fix_action: Literal["REVERT", "HOTFIX"]
    verification_result: bool # Result of running repro script after fix
