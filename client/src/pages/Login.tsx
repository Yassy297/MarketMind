import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { login } from '../services/auth.service';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.66z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3a7.4 7.4 0 0 1-11-3.9H.9v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.05 14.19a7.2 7.2 0 0 1 0-4.38v-3.1H.9a12 12 0 0 0 0 10.58z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 .9 6.71l4.15 3.1A7.16 7.16 0 0 1 12 4.75z" />
  </svg>
);

const Login: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      setUser(response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-[26px] font-semibold tracking-tight text-white">Welcome back!</h2>
      <p className="mt-1.5 text-sm text-slate-400">Sign in to continue to your account.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-slate-300">Email address</label>
          <Input
            id="login-email"
            required
            type="email"
            placeholder="you@company.com"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-300">Password</label>
            <a href="#" className="text-xs font-medium text-violet-300 hover:text-violet-200">Forgot password?</a>
          </div>
          <Input
            id="login-password"
            required
            type="password"
            placeholder="Your password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div> : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-slate-600">
          <div className="h-px flex-1 bg-white/8" />
          or
          <div className="h-px flex-1 bg-white/8" />
        </div>

        <Button type="button" variant="outline" className="w-full">
          <GoogleIcon />
          Sign in with Google
        </Button>

        <div className="pt-2 text-center text-sm text-slate-400">
          Don't have an account? <NavLink className="font-medium text-violet-300 hover:text-violet-200" to="/auth/register">Create account</NavLink>
        </div>
      </form>
    </div>
  );
};

export default Login;
