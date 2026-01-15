import React from 'react';
import { IncidentArtifact } from '../types';

interface ArtifactCardProps {
  artifact: IncidentArtifact | null;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact }) => {
  if (!artifact) {
    return (
      <div className="h-full flex items-center justify-center border border-dashed border-gray-700 rounded-lg p-8">
        <p className="text-gray-500 font-mono text-sm">No Active Incident Artifact</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-terminal-border rounded-lg p-6 shadow-lg font-mono text-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-50">
             <span className="text-[10px] text-gray-500 border border-gray-600 px-1 rounded">PYDANTIC MODEL</span>
        </div>
      
      <h3 className="text-terminal-blue font-bold text-lg mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        IncidentArtifact
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 border-b border-gray-800 pb-2">
          <span className="text-gray-500">incident_id:</span>
          <span className="col-span-2 text-white">{artifact.incident_id}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-gray-800 pb-2">
           <span className="text-gray-500">status:</span>
           <span className="col-span-2 text-terminal-yellow">{artifact.status_message}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-gray-800 pb-2">
          <span className="text-gray-500">bad_commit:</span>
          <span className="col-span-2 text-red-400">{artifact.bad_commit_hash || "PENDING..."}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-gray-800 pb-2">
          <span className="text-gray-500">thought_sig:</span>
          <div className="col-span-2 break-all">
            {artifact.thought_signature ? (
               <span className="text-green-500 text-xs">{artifact.thought_signature}</span>
            ) : (
                <span className="text-gray-600 text-xs">PENDING GENERATION...</span>
            )}
          </div>
        </div>

        <div className="pt-2">
          <span className="text-gray-500 block mb-1">root_cause_analysis:</span>
          <div className="bg-black/30 p-2 rounded text-gray-300 text-xs max-h-24 overflow-y-auto">
            {artifact.root_cause_analysis || "Waiting for Gemini 3 Pro..."}
          </div>
        </div>

        {artifact.fix_action && (
             <div className="pt-2">
             <span className="text-gray-500 block mb-1">plan_execution:</span>
             <div className="flex gap-2">
                 <span className={`px-2 py-0.5 text-xs rounded border ${
                     artifact.fix_action === 'REVERT' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'
                 }`}>{artifact.fix_action}</span>
                 {artifact.verification_result !== null && (
                     <span className={`px-2 py-0.5 text-xs rounded border ${
                         artifact.verification_result ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                     }`}>
                         VERIFIED: {artifact.verification_result.toString().toUpperCase()}
                     </span>
                 )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactCard;
