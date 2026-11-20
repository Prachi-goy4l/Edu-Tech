import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStats, getStoredSubmissions, getStoredProblems, getLeaderboard } from '../services/storage';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Code2,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  Medal,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const stats = getStats(user);
  const problems = getStoredProblems();
  const recentSubmissions = getStoredSubmissions(user?.id).slice(0, 4);
  const leaderboard = getLeaderboard(user);
  const myEntry = leaderboard.find((e) => e.isCurrentUser);

  const featuredProblem = problems[0] || {
    id: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of two numbers that add up to target.',
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e1c15] via-[#1a1a20] to-[#16161c] border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Novithra Assessment Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-amber-400">{user?.name}</span>!
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Ready to sharpen your coding skills? Pick up where you left off, solve newly published challenges from staff, or challenge yourself on the live leaderboard.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to={`/problems/${featuredProblem.id}`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs transition-all shadow-md"
            >
              <Code2 className="w-4 h-4" />
              <span>Launch Code Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#22222a] hover:bg-[#2b2b35] border border-[#333340] text-amber-400 text-xs font-semibold transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Leaderboard</span>
            </Link>
            <Link
              to="/problems"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#22222a] hover:bg-[#2b2b35] border border-[#333340] text-gray-200 text-xs font-semibold transition-all"
            >
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>Browse All ({problems.length})</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Problems Solved</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.problemsSolved}{' '}
            <span className="text-xs font-normal text-gray-400">/ {problems.length}</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active Progress</span>
          </div>
        </div>

        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Day Streak</span>
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.currentStreak} <span className="text-xs font-normal text-gray-400">Days</span>
          </div>
          <div className="text-[11px] text-orange-400 font-medium">Keep it going! 🔥</div>
        </div>

        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Platform Rank</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            #{myEntry?.rank ?? 4}
            <span className="text-xs font-normal text-gray-400 ml-1.5">({myEntry?.points ?? 110} pts)</span>
          </div>
          <div className="text-[11px] text-gray-400">
            <Link to="/leaderboard" className="text-amber-400 hover:underline">
              Check standings &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Submissions</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalSubmissions}</div>
          <div className="text-[11px] text-gray-400">{stats.accuracy}% accuracy</div>
        </div>
      </div>

      {/* Two Column Layout: Featured Problem + Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Challenge (7 cols) */}
        <div className="lg:col-span-7 bg-[#15151a] border border-[#23232b] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#23232b] pb-3">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-white">Daily Coding Challenge</h2>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
              {featuredProblem.difficulty}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">{featuredProblem.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
              {featuredProblem.description}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 bg-[#191920] p-2.5 rounded-xl border border-[#282832]">
            <span className="text-gray-500">Supported:</span>
            <span className="text-amber-400">Python 3</span>
            <span>•</span>
            <span className="text-blue-400">C++</span>
            <span>•</span>
            <span className="text-yellow-400">JavaScript</span>
            <span>•</span>
            <span className="text-rose-400">Java</span>
          </div>

          <div className="pt-2">
            <Link
              to={`/problems/${featuredProblem.id}`}
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md space-x-2"
            >
              <span>Solve in Code Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Submissions Activity (5 cols) */}
        <div className="lg:col-span-5 bg-[#15151a] border border-[#23232b] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#23232b] pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            </div>
            <Link to="/submissions" className="text-xs text-amber-400 hover:underline">
              View all
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#191920] border border-[#262630] text-xs hover:border-[#383844] transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">{sub.problemTitle}</span>
                    <div className="text-[10px] text-gray-500 uppercase font-mono">
                      {sub.language} • {sub.runtimeMs} ms
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                      sub.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
