---
name: skill-k8s-patch
description: Applies patches or rollbacks to Kubernetes.
---

# K8s Patch Skill

## Usage

```bash
python patch.py --action REVERT --deployment my-service
# OR
python patch.py --action HOTFIX --file hotfix.yaml
```

## Output

Returns JSON status and logs to `audit_trail.json`.
