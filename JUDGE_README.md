# Self-Healing SRE Agent - Judge Documentation

## Project Overview

An autonomous Site Reliability Engineer Agent powered by **Gemini 3 Pro** that detects, diagnoses, and fixes production errors without human intervention.

## Key Technical Highlights

### 1. Gemini 3 Pro Integration

- Uses `thinking_level="HIGH"` for deep root cause analysis
- Analyzes log patterns and stack traces to identify failures

### 2. Thought Signatures (Governance)

- Cryptographic SHA-256 hash of the AI's reasoning
- Prevents hallucinated fixes by validating logic chain before execution
- Execution layer rejects commands without valid signatures

### 3. Antigravity Skills

| Skill               | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `skill-log-monitor` | Detects error spikes in production logs     |
| `skill-git-bisect`  | Traces errors to specific commits           |
| `skill-k8s-patch`   | Applies fixes via Kubernetes rollback/patch |

### 4. IncidentArtifact (Pydantic Model)

```python
class IncidentArtifact(BaseModel):
    incident_id: str
    detected_at: datetime
    root_cause_analysis: str
    thought_signature: str  # Governance hash
    bad_commit_hash: str
    reproduction_script: str
    fix_action: Literal["REVERT", "HOTFIX"]
    verification_result: bool
```

## Architecture Flow

```
Monitor → Detect Spike → Gemini 3 Analysis → Generate Signature →
Git Bisect → K8s Patch → Verify Fix → Generate Artifact
```

## Repository Structure

```
sre_agent/
├── agent_loop.py          # Main orchestration
├── models.py              # Pydantic models
├── skills/
│   ├── log_monitor/       # Log monitoring skill
│   ├── git_bisect/        # Git analysis skill
│   └── k8s_patch/         # Kubernetes patching skill
└── data/
    ├── mock_production.log
    └── artifacts/         # Generated incident reports
```

## Running the Project

```bash
# Backend (Python)
cd sre_agent
python agent_loop.py

# Frontend (React Dashboard)
npm install
npm run dev
```

## GitHub Repository

https://github.com/Harsh6425/gemini-sre-agent
