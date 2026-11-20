import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredProblems, getStoredSubmissions, deleteProblem } from '../services/storage';
import { Difficulty, Problem } from '../types';
import { Search, Code2, ArrowRight, Tag, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProblemsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [problems, setProblems] = useState<Problem[]>(getStoredProblems());
  const [search, setSearch] = useState('');
  const [selectedDiff, setSelectedDiff] = useState<string>('All');
  const submissions = getStoredSubmissions(user?.id);

  const solvedIds = new Set(
    submissions.filter((s) => s.status === 'Accepted').map((s) => s.problemId)
  );

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = selectedDiff === 'All' || p.difficulty === selectedDiff;
    return matchesSearch && matchesDiff;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this custom question?')) {
      deleteProblem(id);
      setProblems(getStoredProblems());
    }
  };

  const difficultyColors: Record<Difficulty, { text: string; bg: string; border: string }> = {
    Easy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    Medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    Hard: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Problem Library</h1>
        <p className="text-xs text-gray-400">
          Browse algorithm problems, practice coding solutions in our interactive editor, and evaluate test cases.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search problems by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#16161b] border border-[#282832] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 bg-[#16161b] border border-[#282832] p-1 rounded-xl text-xs">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDiff(diff)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedDiff === diff
                  ? 'bg-amber-500 text-black font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Cards Table */}
      <div className="bg-[#141418] border border-[#23232b] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1a1a20] text-gray-400 uppercase text-[11px] font-mono border-b border-[#262630]">
              <tr>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Difficulty</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f26]">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No problems match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem) => {
                  const isSolved = solvedIds.has(problem.id);
                  const diff = difficultyColors[problem.difficulty];
                  const isCustom = Boolean(problem.createdBy);

                  return (
                    <tr
                      key={problem.id}
                      className="hover:bg-[#1a1a22] transition-colors group"
                    >
                      <td className="py-4 px-6">
                        {isSolved ? (
                          <div className="flex items-center space-x-1 text-emerald-400 text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Solved</span>
                          </div>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-600 block" />
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-white group-hover:text-amber-400 transition-colors">
                        <div className="flex items-center space-x-2">
                          <Link to={`/problems/${problem.id}`} className="hover:underline">
                            {problem.title}
                          </Link>
                          {isCustom && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Staff
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#1e1e26] border border-[#2c2c36] text-[11px]">
                          <Tag className="w-3 h-3 text-gray-500" />
                          <span>{problem.category}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${diff.text} ${diff.bg} ${diff.border}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/problems/${problem.id}`}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#23232c] hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold border border-[#30303c] transition-all"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Solve</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          {isAdmin && isCustom && (
                            <button
                              onClick={(e) => handleDelete(problem.id, e)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
