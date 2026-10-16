import { Check, Gauge, Zap, X } from 'lucide-react';
import { formatMemory } from '../api.js';

export function ExecutionResult({ result }) {
  const results = result.testResults || [];
  return (
    <div className="execution-result">
      <div className={`execution-summary ${result.verdict === 'accepted' ? 'summary-pass' : 'summary-fail'}`}>
        {result.verdict === 'accepted' ? <Check size={17} /> : <X size={17} />}
        <div><strong>{result.verdict?.replaceAll('_', ' ') || 'Finished'}</strong><span>{result.score ?? 0}% of tests passed</span></div>
        <div className="execution-metrics"><span><Gauge size={13} /> {result.runtime ?? '—'} s</span><span><Zap size={13} /> {formatMemory(result.memory)}</span></div>
      </div>
      <div className="test-result-list">
        {results.map((test, index) => (
          <div className="test-result-row" key={index}>
            <span className={`test-result-icon ${test.passed ? 'test-pass' : 'test-fail'}`}>{test.passed ? <Check size={13} /> : <X size={13} />}</span>
            <span>Test {index + 1}</span>
            {test.isHidden && <span className="hidden-test-label">HIDDEN</span>}
            {!test.isHidden && test.status && <span className="test-status">{test.status.replaceAll('_', ' ')}</span>}
            {!test.isHidden && test.stdout && <code>{test.stdout.trim().slice(0, 42)}</code>}
          </div>
        ))}
      </div>
    </div>
  );
}
