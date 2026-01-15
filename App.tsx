import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AgentState, IncidentArtifact, LogEntry } from './types';
import { generateLog, runGitBisect, runK8sPatch, runReproductionScript, createSignature } from './services/mockSkills';
import { analyzeLogsWithGemini } from './services/geminiService';
import TerminalLog from './components/TerminalLog';
import ArtifactCard from './components/ArtifactCard';

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agentState, setAgentState] = useState<AgentState>(AgentState.IDLE);
  const [artifact, setArtifact] = useState<IncidentArtifact | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [errorSpikeDetected, setErrorSpikeDetected] = useState(false);
  
  // Simulation Controls
  const intervalRef = useRef<number | null>(null);
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  // --- SKILL: LOG MONITOR (Implementation in React Loop) ---
  const monitorLogs = useCallback(() => {
    // Generate a log
    const newLog = generateLog(errorSpikeDetected);
    setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50

    // Detection Logic: >5 errors in last 10 logs (simplified "1 minute")
    const recentLogs = [...logs, newLog].slice(-10);
    const errorCount = recentLogs.filter(l => l.level === 'ERROR').length;

    if (errorCount > 5 && agentState === AgentState.MONITORING) {
      console.log("CRITICAL: Error spike detected. Triggering Agent.");
      setAgentState(AgentState.ANALYZING);
      
      // Initialize Artifact
      setArtifact({
        incident_id: `INC-${Date.now()}`,
        detected_at: new Date().toISOString(),
        root_cause_analysis: '',
        thought_signature: '',
        bad_commit_hash: null,
        reproduction_script: '',
        fix_action: null,
        verification_result: null,
        status_message: 'Analyzing logs with Gemini 3 Pro...'
      });
    }
  }, [logs, errorSpikeDetected, agentState]);

  // --- AGENT ORCHESTRATION LOOP ---
  useEffect(() => {
    if (!isSimulationRunning) return;

    const runLoop = async () => {
      // 1. MONITORING PHASE
      if (agentState === AgentState.MONITORING) {
        monitorLogs();
      }

      // 2. ANALYZING PHASE (Gemini 3)
      else if (agentState === AgentState.ANALYZING && artifact) {
        // Pause monitoring during deep thought
        try {
          const analysis = await analyzeLogsWithGemini(logs);
          
          // GENERATE THOUGHT SIGNATURE (State Management Requirement)
          // In a real system, the LLM provides this or we sign the LLM's output.
          // Here, we cryptographically hash the reasoning to freeze the state.
          const signature = await createSignature(analysis.root_cause_analysis);

          setArtifact(prev => prev ? ({
            ...prev,
            root_cause_analysis: analysis.root_cause_analysis,
            bad_commit_hash: analysis.bad_commit_hash,
            fix_action: analysis.recommended_action,
            reproduction_script: analysis.reproduction_code,
            thought_signature: signature,
            status_message: 'Diagnosis Complete. Validating Signature...'
          }) : null);

          setAgentState(AgentState.PLANNING);
        } catch (e) {
          console.error("Analysis Failed", e);
          setAgentState(AgentState.FAILED);
        }
      }

      // 3. PLANNING PHASE (Signature Verification)
      else if (agentState === AgentState.PLANNING && artifact) {
        await new Promise(r => setTimeout(r, 1000)); // Simulate verification delay
        
        // Verify Signature (Mock logic: ensure signature exists and matches content)
        const reHash = await createSignature(artifact.root_cause_analysis);
        if (reHash === artifact.thought_signature) {
            setArtifact(prev => prev ? ({ ...prev, status_message: `Signature Verified (${reHash.substring(0,8)}...). Executing Plan.` }) : null);
            setAgentState(AgentState.EXECUTING);
        } else {
            setArtifact(prev => prev ? ({ ...prev, status_message: 'Signature Mismatch! Halting to prevent hallucination.' }) : null);
            setAgentState(AgentState.FAILED);
        }
      }

      // 4. EXECUTING PHASE (Skills: Git/K8s)
      else if (agentState === AgentState.EXECUTING && artifact) {
        try {
            if (artifact.fix_action === 'REVERT') {
                await runGitBisect('main-repo', artifact.reproduction_script);
                await runK8sPatch('ROLLBACK', `Reverting commit ${artifact.bad_commit_hash}`);
            } else {
                await runK8sPatch('APPLY_PATCH', 'Applying config hotfix');
            }
            
            setArtifact(prev => prev ? ({ ...prev, status_message: 'Fix Applied. Verifying stability...' }) : null);
            setAgentState(AgentState.VERIFYING);
        } catch (e) {
            setAgentState(AgentState.FAILED);
        }
      }

      // 5. VERIFYING PHASE
      else if (agentState === AgentState.VERIFYING && artifact) {
          const success = await runReproductionScript(artifact.reproduction_script);
          setArtifact(prev => prev ? ({ 
              ...prev, 
              verification_result: success,
              status_message: success ? 'Incident RESOLVED. System Stabilized.' : 'Verification Failed. Escalating.'
          }) : null);
          
          setAgentState(success ? AgentState.RESOLVED : AgentState.FAILED);
          setErrorSpikeDetected(false); // Heal the mock system
      }
      
      // RESOLVED: Just monitor quietly or stop
      else if (agentState === AgentState.RESOLVED) {
         // Auto-reset after a while for demo purposes
         // setTimeout(() => setAgentState(AgentState.MONITORING), 5000);
      }
    };

    // Run the loop logic roughly every second (or faster for monitoring)
    const tickRate = agentState === AgentState.MONITORING ? 800 : 2000;
    loopRef.current = setTimeout(runLoop, tickRate);

    return () => {
        if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [isSimulationRunning, agentState, logs, artifact, errorSpikeDetected, monitorLogs]);


  // Handler to start/stop
  const toggleSimulation = () => {
    if (isSimulationRunning) {
      setIsSimulationRunning(false);
      setAgentState(AgentState.IDLE);
      setLogs([]);
      setArtifact(null);
    } else {
      setIsSimulationRunning(true);
      setAgentState(AgentState.MONITORING);
      setErrorSpikeDetected(false);
    }
  };

  const triggerError = () => {
    setErrorSpikeDetected(true);
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text font-sans selection:bg-terminal-green selection:text-black">
      {/* Header */}
      <header className="border-b border-terminal-border bg-[#161b22]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center font-bold text-white">
                G3
            </div>
            <h1 className="font-bold tracking-tight text-white">Self-Healing SRE Agent <span className="text-xs font-normal text-gray-500 ml-2">Powered by Gemini 3 Pro</span></h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={triggerError}
              disabled={!isSimulationRunning || agentState !== AgentState.MONITORING}
              className="px-4 py-2 text-xs font-mono border border-red-500/50 text-red-400 rounded hover:bg-red-500/10 disabled:opacity-30 transition-all uppercase tracking-wider"
            >
              Inject Failure
            </button>
            <button 
              onClick={toggleSimulation}
              className={`px-6 py-2 text-sm font-bold rounded transition-all shadow-lg ${
                isSimulationRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-terminal-green hover:bg-green-600 text-black'
              }`}
            >
              {isSimulationRunning ? 'STOP AGENT' : 'INITIALIZE AGENT'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-4rem)]">
        
        {/* Left Column: Logs */}
        <section className="flex flex-col gap-4 h-full min-h-[400px]">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                Live Production Logs
             </h2>
             <span className="text-xs font-mono text-gray-600">k8s-cluster-prod-us-east1</span>
          </div>
          <TerminalLog logs={logs} />
        </section>

        {/* Right Column: Brain & State */}
        <section className="flex flex-col gap-6 h-full overflow-y-auto">
          
          {/* Status Panel */}
          <div className="bg-[#161b22] border border-terminal-border rounded-lg p-6">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Orchestration Loop</h2>
             
             {/* Progress Steps */}
             <div className="flex justify-between items-center relative">
                 {/* Connecting Line */}
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>
                 
                 {[AgentState.MONITORING, AgentState.ANALYZING, AgentState.PLANNING, AgentState.EXECUTING, AgentState.VERIFYING].map((step, idx) => {
                     const isActive = agentState === step;
                     const isCompleted = Object.values(AgentState).indexOf(agentState) > Object.values(AgentState).indexOf(step);
                     
                     return (
                         <div key={step} className="flex flex-col items-center gap-2 bg-[#161b22] px-2">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                 isActive ? 'bg-terminal-blue text-black scale-110 shadow-[0_0_15px_rgba(88,166,255,0.5)]' : 
                                 isCompleted ? 'bg-terminal-green text-black' : 'bg-gray-800 text-gray-500'
                             }`}>
                                 {idx + 1}
                             </div>
                             <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-terminal-blue' : 'text-gray-600'}`}>
                                 {step}
                             </span>
                         </div>
                     )
                 })}
             </div>
          </div>

          {/* Artifact / Pydantic Model Visualization */}
          <ArtifactCard artifact={artifact} />

          {/* Thinking Visualization */}
          {agentState === AgentState.ANALYZING && (
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div>
                      <h4 className="text-purple-300 font-bold text-sm">Gemini 3 Pro is Thinking...</h4>
                      <p className="text-purple-400/60 text-xs">Analyzing 150+ log lines • Tracing dependency graph • Calculating signature</p>
                  </div>
              </div>
          )}

          {agentState === AgentState.RESOLVED && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <div>
                       <h4 className="text-green-400 font-bold text-sm">Incident Resolved</h4>
                       <p className="text-green-500/60 text-xs">System stability restored. Reproduction script verified fix.</p>
                   </div>
              </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default App;