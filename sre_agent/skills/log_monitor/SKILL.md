---
name: skill-log-monitor
description: Monitors production logs for error spikes.
---

# Log Monitor Skill

## Usage

Run the `monitor.py` script to scan the logs.

```bash
python monitor.py --log-file ../../data/mock_production.log --threshold 5
```

## Output

Returns a JSON object with:

- `spike_detected`: boolean
- `error_count`: int
- `recent_errors`: list[str]
