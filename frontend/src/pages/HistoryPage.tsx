import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredSubmissions } from '../services/storage';
import { SubmissionRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Code2,
  Eye,
  X,
  Calendar,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [filter, setFilter] = useState<'all' | 'accepted' | 'failed'>('all');
  const [viewingCode, setViewingCode] = useState<SubmissionRecord | null>(null);
  const submissions = isAdmin ? getStoredSubmissions() : getStoredSubmissions(user?.id);

  const filtered = submissions.filter((sub) => {
    if (filter === 'accepted') return sub.status === 'Accepted';
    if (filter === 'failed') return sub.status !== 'Accepted';
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Submissions History</h1>
          </div>
          <p className="text-xs text-gray-400">
            Audit trail of all your evaluated code executions, test metrics, and verdicts.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 bg-[#16161b] border border-[#282832] p-1 rounded-xl text-xs self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'accepted'
                ? 'bg-emerald-500 text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'failed'
                ? 'bg-rose-500 text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141418] border border-[#23232b] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1a1a20] text-gray-400 uppercase text-[11px] font-mono border-b border-[#262630]">
              <tr>
                <th className="py-3.5 px-6">Verdict</th>
                <th className="py-3.5 px-6">Problem</th>
                <th className="py-3.5 px-6">Language</th>
                <th className="py-3.5 px-6">Runtime</th>
                <th className="py-3.5 px-6">Test Cases</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Source Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f26]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No submissions recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#1a1a22] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1.5 font-bold">
                        {sub.status === 'Accepted' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Accepted</span>
                          </>
                        ) : sub.status === 'Wrong Answer' ? (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span className="text-rose-400">Wrong Answer</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400">{sub.status}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      <Link to={`/problems/${sub.problemId}`} className="hover:text-amber-400 transition-colors">
                        {sub.problemTitle}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#1e1e26] border border-[#2c2c36] font-mono text-[11px] uppercase text-gray-300">
                        {sub.language}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-mono">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{sub.runtimeMs} ms</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-400">
                      {sub.testCasesPassed} / {sub.totalTestCases}
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-[11px]">
                      {new Date(sub.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setViewingCode(sub)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#22222a] hover:bg-[#2b2b36] border border-[#2f2f3d] text-gray-300 hover:text-white transition-all text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Modal */}
      {viewingCode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16161b] border border-[#2b2b35] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#262630] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-white text-sm">
                  {viewingCode.problemTitle} — Submission Code
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#22222b] px-2 py-0.5 rounded text-gray-400">
                  {viewingCode.language}
                </span>
              </div>
              <button
                onClick={() => setViewingCode(null)}
                className="p-1.5 rounded-lg hover:bg-[#252530] text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-gray-300 bg-[#101013] leading-relaxed whitespace-pre-wrap">
              {viewingCode.code}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
