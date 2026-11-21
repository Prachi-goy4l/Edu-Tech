import React, { useState } from 'react';
import { Problem, ExecutionResult } from '../types';
import { Play, Loader2, CheckCircle2, XCircle, AlertTriangle, Terminal, Check, Clock, Send } from 'lucide-react';

interface ConsoleOutputProps {
  problem: Problem;
  result: ExecutionResult | null;
  isRunning: boolean;
  onRunCode: () => void;
  onSubmitCode?: () => void;
  customInput: string;
  setCustomInput: (val: string) => void;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  problem,
  result,
  isRunning,
  onRunCode,
  onSubmitCode,
  customInput,
  setCustomInput,
}) => {
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(0);
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);

  // If new result arrives, switch automatically to result tab
  React.useEffect(() => {
    if (result) {
      setActiveTab('result');
    }
  }, [result]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] select-text overflow-hidden">
      {/* Console Header / Tab Controls & Run Button */}
      <div className="h-11 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center space-x-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('testcase')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'testcase'
                ? 'bg-[#2a2a2a] text-amber-400 font-semibold border border-[#3d3d3d]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Testcases</span>
          </button>

          <button
            onClick={() => setActiveTab('result')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'result'
                ? 'bg-[#2a2a2a] text-amber-400 font-semibold border border-[#3d3d3d]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
            }`}
          >
            <span>Result</span>
            {result && (
              <span
                className={`w-2 h-2 rounded-full ${
                  result.status === 'Accepted'
                    ? 'bg-emerald-400'
                    : result.status === 'Wrong Answer'
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
                }`}
              />
            )}
          </button>
        </div>

        {/* Action Run & Submit Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#2a2a32] hover:bg-[#34343f] border border-[#3e3e4c] disabled:opacity-50 text-gray-200 font-semibold text-xs rounded-md shadow-sm transition-all"
            title="Run solution against sample testcases"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>Run</span>
              </>
            )}
          </button>

          {onSubmitCode && (
            <button
              onClick={onSubmitCode}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow-sm transition-all"
              title="Submit solution for assessment record"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
        {activeTab === 'testcase' ? (
          <div className="space-y-4">
            {/* Test Case Selection Pills */}
            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2">
              <div className="flex items-center space-x-2">
                {problem.testCases.map((tc, idx) => (
                  <button
                    key={tc.id}
                    onClick={() => {
                      setSelectedCaseIndex(idx);
                      setUseCustomInput(false);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-sans transition-colors ${
                      !useCustomInput && selectedCaseIndex === idx
                        ? 'bg-[#333] text-white font-semibold'
                        : 'bg-[#252525] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setUseCustomInput(!useCustomInput)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  useCustomInput
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-[#252525] border-[#383838] text-gray-400 hover:text-white'
                }`}
              >
                {useCustomInput ? 'Custom Input Enabled' : '+ Custom Input'}
              </button>
            </div>

            {useCustomInput ? (
              <div className="space-y-2">
                <div className="text-gray-400 font-sans">Provide standard stdin input:</div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 5&#10;1 2 3 4 5"
                  rows={4}
                  className="w-full bg-[#181818] border border-[#333] rounded-md p-3 text-gray-200 font-mono text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Input:</div>
                  <div className="bg-[#181818] border border-[#2d2d2d] rounded-md p-2.5 font-mono text-gray-200">
                    {problem.testCases[selectedCaseIndex]?.input}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 text-xs mb-1">Expected Output:</div>
                  <div className="bg-[#181818] border border-[#2d2d2d] rounded-md p-2.5 font-mono text-amber-400">
                    {problem.testCases[selectedCaseIndex]?.expectedOutput}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* RESULT TAB */
          <div className="space-y-4">
            {!result ? (
              <div className="h-32 flex flex-col items-center justify-center text-gray-500 font-sans space-y-2">
                <Terminal className="w-8 h-8 text-gray-600" />
                <p>Click "Run Code" to compile and execute your solution.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Verdict Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#2d2d2d]">
                  <div className="flex items-center space-x-2">
                    {result.status === 'Accepted' && (
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-base font-sans">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Accepted</span>
                      </div>
                    )}
                    {result.status === 'Wrong Answer' && (
                      <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-base font-sans">
                        <XCircle className="w-5 h-5" />
                        <span>Wrong Answer</span>
                      </div>
                    )}
                    {(result.status === 'Compile Error' ||
                      result.status === 'Runtime Error' ||
                      result.status === 'Time Limit Exceeded') && (
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-base font-sans">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{result.status}</span>
                      </div>
                    )}
                  </div>

                  {result.executionTimeMs !== undefined && (
                    <div className="flex items-center space-x-1 text-gray-400 text-xs font-sans">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Runtime: {result.executionTimeMs} ms</span>
                    </div>
                  )}
                </div>

                {/* Error Traceback Display */}
                {result.errorDetails && (
                  <div className="bg-rose-950/20 border border-rose-800/40 rounded-lg p-3 text-rose-300 font-mono text-xs whitespace-pre-wrap">
                    {result.errorDetails}
                  </div>
                )}

                {/* Test Cases Results List */}
                {result.testCaseResults.length > 0 && (
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center space-x-2">
                      {result.testCaseResults.map((tc, idx) => (
                        <button
                          key={tc.testCaseId}
                          onClick={() => setSelectedCaseIndex(idx)}
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                            selectedCaseIndex === idx
                              ? 'bg-[#333] text-white font-semibold'
                              : 'bg-[#252525] text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tc.passed ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>Case {idx + 1}</span>
                        </button>
                      ))}
                    </div>

                    {result.testCaseResults[selectedCaseIndex] && (
                      <div className="space-y-3 font-mono text-xs bg-[#181818] border border-[#2d2d2d] rounded-lg p-3.5">
                        <div>
                          <div className="text-gray-500 font-sans text-xs mb-1">Input:</div>
                          <div className="text-gray-200">
                            {result.testCaseResults[selectedCaseIndex].input}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-500 font-sans text-xs mb-1">Output:</div>
                          <div
                            className={
                              result.testCaseResults[selectedCaseIndex].passed
                                ? 'text-emerald-400 font-semibold'
                                : 'text-rose-400 font-semibold'
                            }
                          >
                            {result.testCaseResults[selectedCaseIndex].actual}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-500 font-sans text-xs mb-1">Expected:</div>
                          <div className="text-amber-400">
                            {result.testCaseResults[selectedCaseIndex].expected}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
