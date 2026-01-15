import argparse
import json
import re

def monitor_logs(log_file, threshold):
    error_pattern = re.compile(r"ERROR|CRITICAL")
    errors = []
    
    try:
        with open(log_file, 'r') as f:
            lines = f.readlines()
            # In a real agent, we would tail the file. Here we read the whole mock.
            for line in lines:
                if error_pattern.search(line):
                    errors.append(line.strip())
    except FileNotFoundError:
        return {"spike_detected": False, "error": "Log file not found"}

    spike_detected = len(errors) >= threshold
    
    return {
        "spike_detected": spike_detected,
        "error_count": len(errors),
        "recent_errors": errors[-10:] # Return last 10 errors
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--log-file", required=True)
    parser.add_argument("--threshold", type=int, default=5)
    args = parser.parse_args()
    
    result = monitor_logs(args.log_file, args.threshold)
    print(json.dumps(result, indent=2))
