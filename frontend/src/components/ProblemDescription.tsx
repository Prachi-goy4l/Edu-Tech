import React from 'react';
import { Problem, Difficulty } from '../types';
import { FileText, Tag, ShieldAlert } from 'lucide-react';

interface ProblemDescriptionProps {
  problem: Problem;
}

const difficultyColors: Record<Difficulty, { text: string; bg: string; border: string }> = {
  Easy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Hard: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  const diff = difficultyColors[problem.difficulty];

  // Helper to render formatted markdown-like text (backticks -> code)
  const formatText = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-[#2b2b2b] text-amber-300 font-mono text-xs border border-[#3b3b3b]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-gray-300 overflow-hidden select-text border-r border-[#2d2d2d]">
      {/* Top Tab Bar */}
      <div className="h-10 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4 space-x-2 text-xs font-medium text-gray-300">
        <div className="flex items-center space-x-1.5 text-amber-500 border-b-2 border-amber-500 pb-2.5 pt-3">
          <FileText className="w-3.5 h-3.5" />
          <span>Description</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
        {/* Title & Metadata */}
        <div>
          <h1 className="text-xl font-bold text-white mb-2.5 tracking-tight">{problem.title}</h1>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${diff.text} ${diff.bg} ${diff.border}`}>
              {problem.difficulty}
            </span>
            <span className="flex items-center space-x-1 text-xs text-gray-400 bg-[#252525] px-2.5 py-0.5 rounded-full border border-[#333]">
              <Tag className="w-3 h-3 text-gray-500" />
              <span>{problem.category}</span>
            </span>
          </div>
        </div>

        {/* Description Text */}
        <div className="text-gray-300 space-y-3 whitespace-pre-line leading-6">
          {problem.description.split('\n\n').map((para, i) => (
            <p key={i}>{formatText(para)}</p>
          ))}
        </div>

        {/* Examples Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Examples</h2>
          {problem.examples.map((example, index) => (
            <div
              key={index}
              className="bg-[#212121] border border-[#2e2e2e] rounded-lg p-3.5 text-xs font-mono space-y-2 hover:border-[#3d3d3d] transition-colors"
            >
              <div className="font-semibold text-gray-400 font-sans text-xs">Example {index + 1}:</div>
              <div className="space-y-1">
                <div>
                  <span className="text-gray-500">Input: </span>
                  <span className="text-gray-200">{example.input}</span>
                </div>
                <div>
                  <span className="text-gray-500">Output: </span>
                  <span className="text-amber-400">{example.output}</span>
                </div>
                {example.explanation && (
                  <div className="pt-1 text-gray-400 font-sans text-xs">
                    <span className="text-gray-500">Explanation: </span>
                    {example.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Constraints</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-400 font-mono">
            {problem.constraints.map((constraint, index) => (
              <li key={index} className="text-gray-300">
                {formatText(constraint)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
