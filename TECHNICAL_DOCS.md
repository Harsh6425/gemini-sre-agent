# Self-Healing SRE Agent - Technical Documentation

## Project Overview

An autonomous Site Reliability Engineer Agent powered by Gemini 3 Pro that detects, diagnoses, and fixes production errors without human intervention.

## Architecture

### Core Components

1. **Log Monitor Skill** (`skills/log_monitor/`) - Monitors production logs for error spikes
2. **Git Bisect Skill** (`skills/git_bisect/`) - Identifies bad commits via binary search
3. **K8s Patch Skill** (`skills/k8s_patch/`) - Applies fixes via Kubernetes

### Orchestration Flow

```
Monitor → Analyze (Gemini 3) → Plan → Execute → Verify
```

### Key Innovation: Thought Signatures

We prevent AI hallucinations by generating a cryptographic hash of the diagnosis before execution. The execution layer ONLY runs commands that bear a valid signature from the diagnosis layer.

## Technology Stack

- **AI Model**: Gemini 3 Pro (Thinking Level: HIGH)
- **Backend**: Python 3.10+, Pydantic
- **Frontend**: React 19, Vite, TypeScript
- **Infrastructure**: Kubernetes (mocked for demo)

## How to Run

### Backend (Python Agent)

```bash
cd sre_agent
pip install pydantic
python agent_loop.py
```

### Frontend (React Dashboard)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## File Structure

```
├── sre_agent/
│   ├── agent_loop.py        # Main orchestration
│   ├── models.py            # Pydantic data models
│   ├── data/
│   │   └── mock_production.log
│   └── skills/
│       ├── log_monitor/
│       ├── git_bisect/
│       └── k8s_patch/
├── App.tsx                  # React dashboard
├── services/
│   ├── geminiService.ts     # Gemini API integration
│   └── mockSkills.ts        # Frontend skill mocks
└── components/
    ├── TerminalLog.tsx
    └── ArtifactCard.tsx
```

## Gemini 3 Integration

The agent uses Gemini 3 Pro with `thinking_level="HIGH"` for:

- Root cause analysis of error patterns
- Decision making (Revert vs Hotfix)
- Generating reproduction test cases

## Contact

GitHub: https://github.com/Harsh6425/gemini-sre-agent
