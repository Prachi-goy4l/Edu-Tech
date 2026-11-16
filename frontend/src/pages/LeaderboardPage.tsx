import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard } from '../services/storage';
import { LeaderboardEntry } from '../types';
import {
  Trophy,
  Medal,
  Flame,
  Search,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const leaderboard = getLeaderboard(user);

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top3 = leaderboard.slice(0, 3);
  const currentUserEntry = leaderboard.find((e) => e.isCurrentUser);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Assessment Leaderboard & Rankings
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Real-time candidate standings based on solved algorithm challenges, execution accuracy, and consistency streaks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Novithra Scoring System: Active</span>
          </span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {top3.map((entry, index) => {
          const podiumConfig = [
            {
              place: '1st Place',
              badgeColor: 'from-amber-400 to-yellow-600 text-black',
              border: 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[#18181f] to-[#141418]',
              icon: <Trophy className="w-6 h-6 text-amber-400" />,
              rankText: '🥇 Rank 1',
              pill: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
            },
            {
              place: '2nd Place',
              badgeColor: 'from-slate-300 to-gray-500 text-black',
              border: 'border-slate-400/30 bg-gradient-to-b from-slate-500/10 via-[#18181f] to-[#141418]',
              icon: <Medal className="w-6 h-6 text-slate-300" />,
              rankText: '🥈 Rank 2',
              pill: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
            },
            {
              place: '3rd Place',
              badgeColor: 'from-amber-700 to-orange-800 text-white',
              border: 'border-amber-700/30 bg-gradient-to-b from-orange-500/10 via-[#18181f] to-[#141418]',
              icon: <Award className="w-6 h-6 text-amber-600" />,
              rankText: '🥉 Rank 3',
              pill: 'bg-amber-700/20 text-amber-400 border-amber-700/30',
            },
          ][index];

          return (
            <div
              key={entry.userId}
              className={`relative rounded-2xl border ${podiumConfig.border} p-6 flex flex-col items-center text-center space-y-4 shadow-xl transition-all hover:scale-[1.02]`}
            >
              {entry.isCurrentUser && (
                <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold">
                  YOU
                </span>
              )}

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#252530] to-[#363644] border-2 border-[#454555] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {entry.avatar}
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#121216] border border-[#2e2e38]">
                  {podiumConfig.icon}
                </div>
              </div>

              <div className="space-y-1">
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${podiumConfig.pill}`}>
                  {podiumConfig.rankText}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">{entry.name}</h3>
                <p className="text-xs text-gray-400">
                  {entry.problemsSolved} Solved • {entry.accuracy}% Accuracy
                </p>
              </div>

              <div className="w-full pt-2 border-t border-[#262632] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1 text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{entry.streak}d streak</span>
                </div>
                <div className="text-white font-bold text-sm">
                  {entry.points} <span className="text-[10px] text-gray-400 font-normal">PTS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User's Quick Rank Banner */}
      {currentUserEntry && (
        <div className="bg-gradient-to-r from-emerald-950/30 via-[#181822] to-amber-950/20 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-base flex items-center justify-center shadow-md">
              #{currentUserEntry.rank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">Your Current Platform Standing</h2>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Active Candidate
                </span>
              </div>
              <p className="text-xs text-gray-400">
                You have earned <strong className="text-white font-semibold">{currentUserEntry.points} points</strong> with{' '}
                <strong className="text-emerald-400">{currentUserEntry.problemsSolved} challenges solved</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/problems"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Solve More Challenges</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search and Table Container */}
      <div className="bg-[#141418] border border-[#23232b] rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-[#23232b] pb-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white">All Candidate Rankings</h2>
            <p className="text-xs text-gray-400">
              Scored based on Easy (20 pts), Medium (50 pts), Hard (100 pts) and streak multiplier.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1a1a22] text-gray-400 uppercase text-[10px] font-mono border-b border-[#272733]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4 text-center">Problems Solved</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e26]">
              {filteredLeaderboard.map((entry) => {
                const isUser = entry.isCurrentUser;
                return (
                  <tr
                    key={entry.userId}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-amber-500/10 hover:bg-amber-500/15 font-medium'
                        : 'hover:bg-[#181820]'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {entry.rank === 1 ? (
                        <span className="text-amber-400 font-extrabold text-sm">🥇 #1</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-slate-300 font-extrabold text-sm">🥈 #2</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-600 font-extrabold text-sm">🥉 #3</span>
                      ) : (
                        <span className="text-gray-400 text-xs">#{entry.rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center ${
                            isUser
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-sm'
                              : 'bg-[#252530] text-gray-300'
                          }`}
                        >
                          {entry.avatar}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${isUser ? 'text-amber-400' : 'text-white'}`}>
                            {entry.name}
                          </span>
                          {isUser && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-gray-200">
                      {entry.problemsSolved}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-[#252530] rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-400 h-1.5 rounded-full"
                            style={{ width: `${entry.accuracy}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-semibold">{entry.accuracy}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-amber-400">
                      <span className="inline-flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{entry.streak}d</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      {entry.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
