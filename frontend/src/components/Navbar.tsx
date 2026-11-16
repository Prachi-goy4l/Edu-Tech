import React from 'react';
import { Problem, Difficulty } from '../types';
import { Code2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface NavbarProps {
  problems: Problem[];
  currentProblem: Problem;
  onSelectProblem: (problem: Problem) => void;
  onResetCode: () => void;
}

const difficultyBadgeColor: Record<Difficulty, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export const Navbar: React.FC<NavbarProps> = ({
  problems,
  currentProblem,
  onSelectProblem,
  onResetCode,
}) => {
  const currentIndex = problems.findIndex((p) => p.id === currentProblem.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectProblem(problems[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      onSelectProblem(problems[currentIndex + 1]);
    }
  };

  return (
    <header className="h-14 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between px-4 select-none shrink-0">
      {/* Left: Branding & Problem Switcher */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-sm">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-100 text-sm sm:text-base tracking-tight leading-none">
              Novithra <span className="text-amber-500">Tech Solution</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">
              Intern Project • Code Assessment
            </span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-[#333] hidden sm:block" />

        {/* Problem Navigation & Dropdown */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1.5 rounded hover:bg-[#2a2a2a] disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 hover:text-white transition-colors"
            title="Previous Problem"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentProblem.id}
            onChange={(e) => {
              const selected = problems.find((p) => p.id === e.target.value);
              if (selected) onSelectProblem(selected);
            }}
            className="bg-[#282828] text-gray-200 text-sm font-medium rounded-md px-3 py-1.5 border border-[#3c3c3c] hover:border-[#505050] focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>

          <button
            onClick={handleNext}
            disabled={currentIndex === problems.length - 1}
            className="p-1.5 rounded hover:bg-[#2a2a2a] disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 hover:text-white transition-colors"
            title="Next Problem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Difficulty Pill */}
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
            difficultyBadgeColor[currentProblem.difficulty]
          }`}
        >
          {currentProblem.difficulty}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onResetCode}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-[#282828] hover:bg-[#323232] border border-[#383838] rounded-md transition-colors"
          title="Reset code to starter template"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Code</span>
        </button>
      </div>
    </header>
  );
};
