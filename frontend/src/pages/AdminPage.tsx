import React, { useState } from 'react';
import { getStoredProblems, saveNewProblem, deleteProblem, getStoredSubmissions } from '../services/storage';
import { getCustomProblemStarterCode } from '../services/problemTemplates';
import { Problem, Difficulty, TestCase, SupportedLanguage, LANGUAGE_OPTIONS } from '../types';
import {
  ShieldCheck,
  Users,
  Code2,
  FileCheck2,
  Activity,
  Plus,
  ArrowUpRight,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>(getStoredProblems());
  const [submissions] = useState(getStoredSubmissions());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('String & Array');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [description, setDescription] = useState('');
  const [constraintsText, setConstraintsText] = useState('1 <= n <= 10^5\nAll elements are valid.');
  const [examples, setExamples] = useState<Problem['examples']>([
    { input: '', output: '', explanation: '' },
  ]);
  const [starterCode, setStarterCode] = useState<Record<SupportedLanguage, string>>(
    getCustomProblemStarterCode()
  );

  // Dynamic Test Cases
  const [testCases, setTestCases] = useState<Array<{ input: string; expectedOutput: string }>>([
    { input: '1 2 3', expectedOutput: '3 2 1' },
    { input: '4 5', expectedOutput: '5 4' },
  ]);

  const handleAddTestCase = () => {
    setTestCases((prev) => [...prev, { input: '', expectedOutput: '' }]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    setTestCases((prev) => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const handleExampleChange = (
    index: number,
    field: 'input' | 'output' | 'explanation',
    value: string
  ) => {
    setExamples((prev) => prev.map((example, i) =>
      i === index ? { ...example, [field]: value } : example
    ));
  };

  const handleCreateProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the Challenge Title and Description.');
      return;
    }

    if (examples.length === 0 || examples.some((example) => !example.input.trim() || !example.output.trim())) {
      alert('Add at least one example with both input and output.');
      return;
    }

    const savedExamples = examples.map((example) => ({
      input: example.input.trim(),
      output: example.output.trim(),
      explanation: example.explanation?.trim() || undefined,
    }));

    if (testCases.some((testCase) => !testCase.input.trim() || !testCase.expectedOutput.trim())) {
      alert('Every test case must have both input and expected output.');
      return;
    }

    if (LANGUAGE_OPTIONS.some(({ id }) => !starterCode[id].trim())) {
      alert('Provide starter code for every supported language.');
      return;
    }

    const existingProblems = getStoredProblems();
    const baseId = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `problem-${Date.now()}`;
    let problemId = baseId;
    let suffix = 2;
    while (existingProblems.some((problem) => problem.id === problemId)) {
      problemId = `${baseId}-${suffix++}`;
    }

    const constraints = constraintsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const formattedTestCases: TestCase[] = testCases.map((tc, idx) => ({
      id: idx + 1,
      input: tc.input.trim(),
      expectedOutput: tc.expectedOutput.trim(),
    }));

    const newProblem: Problem = {
      id: problemId,
      title: title.trim(),
      difficulty,
      category: category.trim(),
      description: description.trim(),
      createdBy: 'Staff / Admin',
      createdAt: new Date().toISOString(),
      examples: savedExamples,
      constraints,
      starterCode,
      testCases: formattedTestCases,
    };

    try {
      saveNewProblem(newProblem);
    } catch (error) {
      alert(error instanceof Error ? `Could not publish problem: ${error.message}` : 'Could not publish problem.');
      return;
    }

    setProblems(getStoredProblems());
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setDescription('');
    setExamples([{ input: '', output: '', explanation: '' }]);
    setStarterCode(getCustomProblemStarterCode());
    setTestCases([
      { input: '1 2 3', expectedOutput: '3 2 1' },
      { input: '4 5', expectedOutput: '5 4' },
    ]);

    setSuccessToast(`Challenge "${newProblem.title}" generated and published!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this custom challenge?')) {
      deleteProblem(id);
      setProblems(getStoredProblems());
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl font-medium text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Staff & Administrator Portal
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Generate coding questions & test cases, oversee student assessments, and track automated rankings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/leaderboard"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#1e1e26] hover:bg-[#282834] border border-[#2e2e3a] text-gray-200 text-xs font-semibold transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>View Leaderboard</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Challenge</span>
          </button>
        </div>
      </div>

      {/* 4 Admin Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Problem Bank</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{problems.length} Active</div>
          <div className="text-[11px] text-gray-400">Multi-language Wandbox compiler</div>
        </div>

        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Submissions Logged</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{submissions.length}</div>
          <div className="text-[11px] text-gray-400">Automated evaluations</div>
        </div>

        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Active Candidates</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">8 Students</div>
          <div className="text-[11px] text-emerald-400 font-medium">Rankings calculated</div>
        </div>

        <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Compiler Latency</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">&lt; 350 ms</div>
          <div className="text-[11px] text-gray-400">Wandbox cloud sandbox</div>
        </div>
      </div>

      {/* Problem Management Overview */}
      <div className="bg-[#15151a] border border-[#23232b] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#23232b] pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-white">Platform Assessment Challenges</h2>
            <p className="text-xs text-gray-400">
              Staff and pre-seeded challenges available to all students in real-time.
            </p>
          </div>
          <Link
            to="/problems"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1"
          >
            <span>Open Student Library</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#202028]">
          {problems.map((problem) => {
            const isCustom = Boolean(problem.createdBy);
            return (
              <div
                key={problem.id}
                className="py-3.5 flex items-center justify-between hover:bg-[#1a1a22] px-3 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs">{problem.title}</span>
                    {isCustom && (
                      <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Staff Created
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Category: {problem.category} • {problem.testCases.length} Test Cases
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                      problem.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {problem.difficulty}
                  </span>

                  <Link
                    to={`/problems/${problem.id}`}
                    className="px-3 py-1 rounded-lg bg-[#22222a] hover:bg-amber-500 hover:text-black text-gray-300 text-xs font-semibold border border-[#30303c] transition-all"
                  >
                    Test Solution
                  </Link>

                  {isCustom && (
                    <button
                      onClick={(e) => handleDelete(problem.id, e)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all"
                      title="Delete Challenge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create New Challenge */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#16161c] border border-[#2b2b36] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#282834] pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Create & Publish Challenge</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#252530] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
              {/* Title & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-gray-300 font-semibold">Challenge Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 344. Reverse String"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1b1b24] border border-[#2c2c38] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-300 font-semibold">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-[#1b1b24] border border-[#2c2c38] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Easy">Easy (20 pts)</option>
                    <option value="Medium">Medium (50 pts)</option>
                    <option value="Hard">Hard (100 pts)</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-gray-300 font-semibold">Category / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Strings & Two Pointers, Dynamic Programming"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#1b1b24] border border-[#2c2c38] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-gray-300 font-semibold">Problem Statement / Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the challenge instructions, expectations, and edge cases..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1b1b24] border border-[#2c2c38] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Problem Examples */}
              <div className="p-3 bg-[#131318] border border-[#262632] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-300 text-[11px] uppercase tracking-wide">
                    Public Examples
                  </span>
                  <button
                    type="button"
                    onClick={() => setExamples((prev) => [...prev, { input: '', output: '', explanation: '' }])}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Example</span>
                  </button>
                </div>
                {examples.map((example, index) => (
                  <div key={index} className="space-y-2 p-3 bg-[#1b1b24] border border-[#2a2a36] rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 font-semibold">Example {index + 1}</span>
                      {examples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setExamples((prev) => prev.filter((_, i) => i !== index))}
                          className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#252530]"
                          title="Remove example"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <textarea
                        rows={2}
                        placeholder="Input"
                        value={example.input}
                        onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                        className="w-full bg-[#131318] border border-[#2e2e3c] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <textarea
                        rows={2}
                        placeholder="Output"
                        value={example.output}
                        onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                        className="w-full bg-[#131318] border border-[#2e2e3c] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Explanation (optional)"
                      value={example.explanation}
                      onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                      className="w-full bg-[#131318] border border-[#2e2e3c] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>

              {/* Dynamic Test Cases Builder */}
              <div className="p-4 bg-[#131318] border border-[#262632] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-xs">Automated Evaluation Test Cases</h3>
                    <p className="text-[11px] text-gray-400">
                      Each input is sent to the solution on stdin; its output is compared with the expected output.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {testCases.map((tc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 bg-[#1b1b24] border border-[#2a2a36] rounded-xl"
                    >
                      <span className="font-mono text-[10px] text-gray-500 w-6">#{index + 1}</span>
                      <textarea
                        rows={2}
                        placeholder="Input (stdin): e.g. 1 2 3"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        className="flex-1 bg-[#131318] border border-[#2e2e3c] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <textarea
                        rows={2}
                        placeholder="Expected Output: e.g. 3 2 1"
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        className="flex-1 bg-[#131318] border border-[#2e2e3c] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(index)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#252530]"
                          title="Remove test case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-1.5">
                <label className="text-gray-300 font-semibold">Constraints (one per line)</label>
                <textarea
                  rows={2}
                  value={constraintsText}
                  onChange={(e) => setConstraintsText(e.target.value)}
                  className="w-full bg-[#1b1b24] border border-[#2c2c38] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Starter Code */}
              <div className="p-4 bg-[#131318] border border-[#262632] rounded-xl space-y-3">
                <div>
                  <h3 className="font-semibold text-white text-xs">Starter Code by Language</h3>
                  <p className="text-[11px] text-gray-400">
                    Students receive the matching starter code when they open this problem.
                  </p>
                </div>
                {LANGUAGE_OPTIONS.map((language) => (
                  <div key={language.id} className="space-y-1.5">
                    <label className="text-gray-300 font-semibold">{language.name}</label>
                    <textarea
                      required
                      rows={7}
                      value={starterCode[language.id]}
                      onChange={(e) => setStarterCode((prev) => ({
                        ...prev,
                        [language.id]: e.target.value,
                      }))}
                      className="w-full bg-[#1b1b24] border border-[#2c2c38] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#282834]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#22222a] hover:bg-[#2b2b35] text-gray-300 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish to Student Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
