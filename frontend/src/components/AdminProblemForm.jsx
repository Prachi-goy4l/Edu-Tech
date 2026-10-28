import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api, jsonBody } from '../api.js';

const INITIAL_FORM = {
  title: '',
  slug: '',
  description: '',
  difficulty: 'easy',
  mode: 'stdin',
  functionName: 'solve',
  tags: '',
  constraints: '',
  starterCode: '',
  testCases: '[\n  { "input": "2 3\\n", "expectedOutput": "5\\n", "isHidden": false },\n  { "input": "10 5\\n", "expectedOutput": "15\\n", "isHidden": true }\n]',
};

export function AdminProblemForm({ token, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setNotice('');
  }

  async function createProblem(event) {
    event.preventDefault();
    setCreating(true);
    setError('');
    setNotice('');
    try {
      let testCases;
      let starterCode = {};
      try {
        testCases = JSON.parse(form.testCases);
      } catch {
        throw new Error('Test cases must be valid JSON.');
      }
      if (form.starterCode.trim()) {
        try {
          starterCode = JSON.parse(form.starterCode);
        } catch {
          throw new Error('Starter code must be a valid JSON object keyed by language.');
        }
        if (!starterCode || Array.isArray(starterCode) || typeof starterCode !== 'object') {
          throw new Error('Starter code must be a JSON object keyed by language.');
        }
      }

      const problem = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        mode: form.mode,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        constraints: form.constraints.split('\n').map((item) => item.trim()).filter(Boolean),
        starterCode,
        testCases,
      };
      if (form.mode === 'function') problem.functionName = form.functionName.trim();
      const result = await api('/problems', {
        method: 'POST',
        token,
        body: jsonBody(problem),
      });
      setNotice(`“${result.problem.title}” is now in the problem library.`);
      setForm(INITIAL_FORM);
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="panel admin-create-panel">
      <div className="admin-section-heading">
        <div><span className="section-kicker">PROBLEM LIBRARY</span><h2>Create a challenge</h2></div>
        <span className="admin-form-note">Hidden tests are never shown to students.</span>
      </div>
      {notice && <div className="alert-success" role="status">{notice}</div>}
      {error && <div className="alert-error" role="alert">{error}</div>}
      <form className="admin-problem-form" onSubmit={createProblem}>
        <label className="field-label">Problem title
          <input name="title" value={form.title} onChange={updateForm} required maxLength={160} placeholder="Two Sum" />
        </label>
        <label className="field-label">URL slug
          <input name="slug" value={form.slug} onChange={updateForm} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="two-sum" />
        </label>
        <label className="field-label">Difficulty
          <select name="difficulty" value={form.difficulty} onChange={updateForm}>
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
        </label>
        <label className="field-label">Problem mode
          <select name="mode" value={form.mode} onChange={(event) => {
            const nextMode = event.target.value;
            setForm((current) => ({
              ...current,
              mode: nextMode,
              testCases: nextMode === 'function'
                ? '[\n  { "args": [[2, 7, 11, 15], 9], "expected": [0, 1], "isHidden": false }\n]'
                : INITIAL_FORM.testCases,
            }));
            setError('');
          }}>
            <option value="stdin">Standard input</option><option value="function">Function</option>
          </select>
        </label>
        {form.mode === 'function' && <label className="field-label">Function name
          <input name="functionName" value={form.functionName} onChange={updateForm} required pattern="[A-Za-z_$][\w$]*" placeholder="solve" />
        </label>}
        <label className="field-label admin-wide-field">Description
          <textarea name="description" value={form.description} onChange={updateForm} required rows="5" placeholder="Explain the task, expected input, and output." />
        </label>
        <label className="field-label">Tags <span className="field-hint">Separate with commas</span>
          <input name="tags" value={form.tags} onChange={updateForm} placeholder="arrays, hash map" />
        </label>
        <label className="field-label">Constraints <span className="field-hint">One per line</span>
          <textarea name="constraints" value={form.constraints} onChange={updateForm} rows="3" placeholder="2 ≤ nums.length ≤ 10⁴" />
        </label>
        <label className="field-label admin-wide-field">Test cases <span className="field-hint">{form.mode === 'function' ? 'JSON array with args and expected values' : 'JSON array with input and expectedOutput strings'}</span>
          <textarea className="admin-code-input" name="testCases" value={form.testCases} onChange={updateForm} required rows="7" spellCheck="false" />
        </label>
        <label className="field-label admin-wide-field">Starter code <span className="field-hint">Optional JSON object, for example {'{ "python": "...", "javascript": "..." }'}</span>
          <textarea className="admin-code-input" name="starterCode" value={form.starterCode} onChange={updateForm} rows="4" spellCheck="false" placeholder={'{\n  "python": "def solve():\\n    pass"\n}'} />
        </label>
        <div className="admin-form-actions admin-wide-field">
          <span>At least one visible test case is required.</span>
          <button className="button button-primary" type="submit" disabled={creating}>
            <Plus size={15} /> {creating ? 'Creating…' : 'Publish problem'}
          </button>
        </div>
      </form>
    </section>
  );
}
