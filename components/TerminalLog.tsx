import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-terminal-bg border border-terminal-border rounded-lg overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="bg-[#161b22] px-4 py-2 border-b border-terminal-border flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400">mock_production.log</span>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1 font-mono text-xs md:text-sm leading-relaxed">
        {logs.length === 0 && <span className="text-gray-600 italic">Waiting for log stream...</span>}
        {logs.map((log) => (
          <div key={log.id} className="mb-1 hover:bg-white/5 p-0.5 rounded transition-colors">
            <span className="text-gray-500 select-none">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
            <span className={`mx-2 font-bold ${
              log.level === 'ERROR' ? 'text-terminal-red' : 
              log.level === 'WARN' ? 'text-terminal-yellow' : 'text-terminal-blue'
            }`}>
              {log.level}
            </span>
            <span className="text-gray-400 mr-2">[{log.service}]</span>
            <span className={log.level === 'ERROR' ? 'text-red-300' : 'text-terminal-text'}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalLog;
