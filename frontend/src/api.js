const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function api(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (_error) {
    throw new ApiError(`Can't reach the backend at ${API_URL}. Is it running?`);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('edu-tech:unauthorized'));
    }
    throw new ApiError(payload.error || `Request failed (${response.status})`, response.status);
  }
  return payload;
}

export function jsonBody(value) {
  return JSON.stringify(value);
}

export function editorLanguage(name) {
  const language = (name || '').toLowerCase();
  if (language.includes('python')) return 'python';
  if (language.includes('javascript') || language.includes('node')) return 'javascript';
  if (language.includes('typescript')) return 'typescript';
  if (language.includes('java')) return 'java';
  if (language.includes('c++')) return 'cpp';
  if (language === 'c' || language.startsWith('c (')) return 'c';
  if (language.includes('c#')) return 'csharp';
  if (language.includes('go')) return 'go';
  if (language.includes('rust')) return 'rust';
  return 'plaintext';
}

export function prettyLanguage(name) {
  return (name || 'Language')
    .replace(/\s*\(.*\)$/, '')
    .replace(/\s+-\s+.*$/, '');
}

export function timeAgo(value) {
  if (!value) return '—';
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function formatMemory(memory) {
  return memory == null ? '—' : `${(memory / 1024).toFixed(1)} MB`;
}
