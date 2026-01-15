---
name: skill-git-bisect
description: Identifies the bad commit introducing an error.
---

# Git Bisect Skill

## Usage

Run the `bisect.py` script to find the culprit commit.

```bash
python bisect.py --reproduction-command "python test_repro.py"
```

## Output

Returns a JSON object with:

- `bad_commit_hash`: str
- `author`: str
- `message`: str
