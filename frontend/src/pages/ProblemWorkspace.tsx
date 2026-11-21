import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Problem, SupportedLanguage, ExecutionResult } from '../types';
import { ProblemDescription } from '../components/ProblemDescription';
import { CodeEditor } from '../components/CodeEditor';
import { ConsoleOutput } from '../components/ConsoleOutput';
import { executeCode } from '../services/codeRunner';
import { getStoredProblems, saveSubmission } from '../services/storage';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ProblemWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const problems = getStoredProblems();
  // Find active problem or default to first
  const currentProblem = problems.find((p) => p.id === id) || problems[0];
  const currentIndex = problems.findIndex((p) => p.id === currentProblem?.id);

  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [codeCache, setCodeCache] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [submitToast, setSubmitToast] = useState<string | null>(null);

  const cacheKey = `${currentProblem?.id ?? 'p0'}_${language}`;
  const activeCode = codeCache[cacheKey] ?? currentProblem?.starterCode[language] ?? '';

  const handleCodeChange = (newCode: string | undefined) => {
    setCodeCache((prev) => ({
      ...prev,
      [cacheKey]: newCode ?? '',
    }));
  };

  const handleResetCode = () => {
    setCodeCache((prev) => ({
      ...prev,
      [cacheKey]: currentProblem?.starterCode[language] ?? '',
    }));
    setResult(null);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      navigate(`/problems/${problems[currentIndex - 1].id}`);
      setResult(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      navigate(`/problems/${problems[currentIndex + 1].id}`);
      setResult(null);
    }
  };

  const runExecution = async (isSubmission: boolean = false) => {
    setIsRunning(true);
    setResult(null);
    setSubmitToast(null);

    try {
      const res = await executeCode(currentProblem, language, activeCode, customInput);
      setResult(res);

      if (isSubmission) {
        const passedCount = res.testCaseResults.filter((t) => t.passed).length;
        saveSubmission({
          problemId: currentProblem.id,
          problemTitle: currentProblem.title,
          language,
          status: res.status,
          runtimeMs: res.executionTimeMs || 45,
          testCasesPassed: passedCount,
          totalTestCases: currentProblem.testCases.length,
          code: activeCode,
        });

        if (res.status === 'Accepted') {
          setSubmitToast('🎉 Solution Accepted! Saved to your Submissions History.');
        } else {
          setSubmitToast('⚠️ Solution Submitted with errors. Check details in Console.');
        }

        setTimeout(() => setSubmitToast(null), 6000);
      }
    } catch (err: any) {
      setResult({
        status: 'Runtime Error',
        testCaseResults: [],
        errorDetails: err?.message || 'Unexpected execution failure.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] overflow-hidden select-none">
      {/* Top Workspace Header Bar */}
      <div className="h-12 bg-[#17171c] border-b border-[#26262f] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            to="/problems"
            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Problem Library</span>
          </Link>

          <div className="h-4 w-[1px] bg-[#2d2d38]" />

          {/* Problem Selector & Prev/Next */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1 rounded hover:bg-[#252530] disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
              title="Previous Problem"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentProblem.id}
              onChange={(e) => {
                navigate(`/problems/${e.target.value}`);
                setResult(null);
              }}
              className="bg-[#202028] text-white text-xs font-semibold rounded-lg px-2.5 py-1 border border-[#31313d] hover:border-[#454555] focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={currentIndex === problems.length - 1}
              className="p-1 rounded hover:bg-[#252530] disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
              title="Next Problem"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {submitToast && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitToast}</span>
            </div>
          )}

          <button
            onClick={handleResetCode}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-gray-300 hover:text-white bg-[#202028] hover:bg-[#292934] border border-[#2f2f3d] rounded-lg transition-colors"
            title="Reset code template"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Coding Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Problem Description (5 cols) */}
        <div className="lg:col-span-5 h-[35vh] lg:h-full overflow-hidden border-r border-[#26262f]">
          <ProblemDescription problem={currentProblem} />
        </div>

        {/* Right: Monaco Editor & Console Tabs (7 cols) */}
        <div className="lg:col-span-7 h-[65vh] lg:h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
          {/* Top Half: Monaco Code Editor */}
          <div className="h-[58%] w-full overflow-hidden">
            <CodeEditor
              language={language}
              code={activeCode}
              onChange={handleCodeChange}
              onLanguageChange={(newLang) => {
                setLanguage(newLang);
                setResult(null);
              }}
            />
          </div>

          {/* Bottom Half: Console & Testcase Tabs */}
          <div className="h-[42%] w-full overflow-hidden">
            <ConsoleOutput
              problem={currentProblem}
              result={result}
              isRunning={isRunning}
              onRunCode={() => runExecution(false)}
              onSubmitCode={() => runExecution(true)}
              customInput={customInput}
              setCustomInput={setCustomInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
