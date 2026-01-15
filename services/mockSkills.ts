import { LogEntry } from '../types';

// --- SKILL: LOG MONITOR ---
export const generateLog = (isBroken: boolean): LogEntry => {
  const timestamp = new Date().toISOString();
  const services = ['auth-service', 'payment-gateway', 'order-processor', 'frontend-api'];
  const service = services[Math.floor(Math.random() * services.length)];
  
  if (isBroken && Math.random() > 0.3) {
    // Inject errors if system is broken
    const errors = [
      'ConnectionRefusedError: database:5432 refused connection',
      'NullPointerException in OrderHandler.java:45',
      'TimeoutError: payment-provider gateway timed out after 5000ms',
      'MemoryLimitExceeded: Pod OOMKilled',
      'TransactionRollbackError: Deadlock detected'
    ];
    return {
      id: Math.random().toString(36).substring(7),
      timestamp,
      level: 'ERROR',
      service,
      message: errors[Math.floor(Math.random() * errors.length)]
    };
  }

  const infos = [
    'Request processed successfully in 45ms',
    'Health check passed',
    'User authenticated: user_id=12345',
    'Cache hit for key: prod_catalog_v2',
    'Background job started: daily_cleanup'
  ];

  return {
    id: Math.random().toString(36).substring(7),
    timestamp,
    level: 'INFO',
    service,
    message: infos[Math.floor(Math.random() * infos.length)]
  };
};

// --- SKILL: GIT BISECT ---
// Simulates binary searching commit history
export const runGitBisect = async (repo: string, testCommand: string): Promise<string> => {
  console.log(`[Skill: GitBisect] Running bisect on ${repo} with command: ${testCommand}`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate work
  return "a1b2c3d4"; // Mock bad commit hash
};

// --- SKILL: K8S PATCH ---
// Simulates kubectl apply or rollback
export const runK8sPatch = async (action: 'ROLLBACK' | 'APPLY_PATCH', details: string): Promise<string> => {
  console.log(`[Skill: K8sPatch] Executing ${action}: ${details}`);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deployment time
  return "deployment.apps/order-processor patched";
};

// --- SKILL: VERIFICATION RUNNER ---
export const runReproductionScript = async (script: string): Promise<boolean> => {
  console.log(`[Skill: Verifier] Running script:\n${script}`);
  await new Promise(resolve => setTimeout(resolve, 1200));
  // In a real scenario, this runs the script. Here we return true to simulate fix success.
  return true; 
};

// Utility to generate a pseudo-signature (Hash)
export const createSignature = async (content: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
