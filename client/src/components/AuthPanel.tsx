import { FormEvent, useState } from 'react';
import { loginUser, registerUser } from '../lib/api';
import './AuthPanel.css';

interface AuthPanelProps {
  readonly onAuthenticated: (token: string) => void;
}

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  let buttonText = 'Create account';

  if (isSubmitting) {
    buttonText = 'Please wait...';
  } else if (mode === 'login') {
    buttonText = 'Sign in';
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = mode === 'register'
        ? await registerUser({ email, password, name })
        : await loginUser({ email, password });

      localStorage.setItem('marketmind-token', result.token);
      onAuthenticated(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-panel">
      <div className="auth-mode-toggle">
        <button
          type="button"
          className={`auth-mode-button ${mode === 'login' ? 'active' : 'inactive'}`}
          onClick={() => setMode('login')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`auth-mode-button ${mode === 'register' ? 'active' : 'inactive'}`}
          onClick={() => setMode('register')}
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label className="auth-field">
            <span>Name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="auth-input"
              placeholder="Alex Morgan"
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="auth-input"
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="auth-input"
            placeholder="At least 6 characters"
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" disabled={isSubmitting} className="auth-submit">
          {buttonText}
        </button>
      </form>
    </div>
  );
}
