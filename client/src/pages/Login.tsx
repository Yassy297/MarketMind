import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { login } from '../services/auth.service';

const Login: React.FC = () => {
  const { setToken } = useAuth();
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
      setToken(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-semibold">Welcome back!</h2>

        <div className="space-y-1">
          <label htmlFor="login-email" className="text-sm text-gray-400">Email address</label>
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

        <div className="space-y-1">
          <label htmlFor="login-password" className="text-sm text-gray-400">Password</label>
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

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full py-3">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>

        <div className="pt-4 text-sm text-gray-400 text-center">
          Don't have an account? <NavLink className="text-indigo-300" to="/auth/register">Create account</NavLink>
        </div>
      </form>
    </div>
  );
};

export default Login;
