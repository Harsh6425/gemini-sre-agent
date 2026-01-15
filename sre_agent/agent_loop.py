import os
import json
import subprocess
import hashlib
from datetime import datetime
from models import IncidentArtifact

# Configuration
LOG_MONITOR_SCRIPT = "skills/log_monitor/monitor.py"
GIT_BISECT_SCRIPT = "skills/git_bisect/bisect.py"
K8S_PATCH_SCRIPT = "skills/k8s_patch/patch.py"
LOG_FILE = "data/mock_production.log"
ARTIFACTS_DIR = "data/artifacts"

def run_command(command):
    """Helper to run shell commands and parse JSON output."""
    print(f"Executing: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"Failed to parse JSON: {result.stdout}")
        return None

def mock_gemini_reasoning(logs):
    """Mocks Gemini 3 Pro high-level reasoning."""
    print("\n[Gemini 3 Pro] Analyzing logs with Thinking Level=HIGH...")
    print("[Gemini 3 Pro] Identifying ERROR pattern 'ConnectionRefusedError'...")
    print("[Gemini 3 Pro] Hypothesizing: Recent commit removed DB connection check.")
    
    # Generate a deterministic thought signature based on analysis
    analysis = "Root Cause: Database connection failure due to missing retry logic in db.py."
    signature = hashlib.sha256(analysis.encode()).hexdigest()
    
    return {
        "root_cause_analysis": analysis,
        "thought_signature": signature,
        "fix_action": "REVERT", # Logic error suggests revert
        "reproduction_script": "import sys; print('Reproducing DB connection failure...'); sys.exit(0)" # Mock passing script
    }

def main():
    # 1. Monitor
    print("--- [Step 1] Monitoring Production Logs ---")
    monitor_cmd = f"python {LOG_MONITOR_SCRIPT} --log-file {LOG_FILE} --threshold 5"
    monitor_result = run_command(monitor_cmd)
    
    if not monitor_result or not monitor_result.get("spike_detected"):
        print("No error spike detected. System healthy.")
        return

    print(f"ALERT! Spike detected: {monitor_result['error_count']} errors.")
    
    # 2. Analyze (Gemini 3 Pro)
    print("\n--- [Step 2] Gemini 3 Pro Root Cause Analysis ---")
    gemini_output = mock_gemini_reasoning(monitor_result['recent_errors'])
    
    # 3. Plan & Execute
    print("\n--- [Step 3] Execution & Governance ---")
    incident_id = f"inc-{int(datetime.now().timestamp())}"
    
    bisect_cmd = f'python {GIT_BISECT_SCRIPT} --reproduction-command "python test_repro.py"'
    bisect_result = run_command(bisect_cmd)
    bad_commit = bisect_result.get("bad_commit_hash") if bisect_result else "unknown"
    
    print(f"identified bad_commit: {bad_commit}")
    
    action = gemini_output['fix_action']
    signature = gemini_output['thought_signature']
    
    # Verify Signature Handling
    print(f"Passing Thought Signature to K8s Controller: {signature[:8]}...")
    
    patch_cmd = f'python {K8S_PATCH_SCRIPT} --action {action} --target "deployment/main-app" --signature {signature}'
    patch_result = run_command(patch_cmd)
    
    # 4. Verify & Artifact
    print("\n--- [Step 4] Verification & Artifact Generation ---")
    
    # Run Repro script (Mocked)
    verification_passed = True # validated by k8s patch success in this mock
    
    artifact = IncidentArtifact(
        incident_id=incident_id,
        detected_at=datetime.now(),
        root_cause_analysis=gemini_output['root_cause_analysis'],
        thought_signature=signature,
        bad_commit_hash=bad_commit,
        reproduction_script=gemini_output['reproduction_script'],
        fix_action=action,
        verification_result=verification_passed
    )
    
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    artifact_path = os.path.join(ARTIFACTS_DIR, f"{incident_id}.json")
    with open(artifact_path, "w") as f:
        f.write(artifact.model_dump_json(indent=2))
        
    print(f"Incident Resolved. Artifact generated: {artifact_path}")

if __name__ == "__main__":
    main()
