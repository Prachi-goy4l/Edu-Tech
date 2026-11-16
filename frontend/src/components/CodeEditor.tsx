import React from 'react';
import Editor from '@monaco-editor/react';
import { SupportedLanguage, LANGUAGE_OPTIONS } from '../types';
import { Code } from 'lucide-react';

interface CodeEditorProps {
  language: SupportedLanguage;
  code: string;
  onChange: (value: string | undefined) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  onChange,
  onLanguageChange,
}) => {
  const currentLang = LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] border-b border-[#2d2d2d] overflow-hidden">
      {/* Editor Header Bar */}
      <div className="h-10 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between px-3 select-none shrink-0">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-amber-500" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-[#282828] text-gray-200 text-xs font-medium rounded px-2.5 py-1 border border-[#3c3c3c] hover:border-[#4d4d4d] focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monaco Code Editor Canvas */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={currentLang.monacoLang}
          value={code}
          theme="vs-dark"
          onChange={onChange}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Consolas', monospace",
            fontLigatures: true,
            tabSize: 4,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'all',
          }}
          loading={
            <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e] text-gray-400 text-sm">
              <span className="animate-pulse">Loading Editor Engine...</span>
            </div>
          }
        />
      </div>
    </div>
  );
};
