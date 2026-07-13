import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { register } from '../services/auth.service';

const Register: React.FC = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptedTerms) {
      setError('You must agree to the terms to continue.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await register({ name, email, password });
      setToken(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-semibold">Create an account</h2>

        <div className="space-y-1">
          <label htmlFor="register-name" className="text-sm text-gray-400">Full name</label>
          <Input
            id="register-name"
            required
            placeholder="Your full name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="register-email" className="text-sm text-gray-400">Email</label>
          <Input
            id="register-email"
            required
            type="email"
            placeholder="you@company.com"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="register-password" className="text-sm text-gray-400">Password</label>
          <Input
            id="register-password"
            required
            minLength={6}
            type="password"
            placeholder="Create a password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/10 bg-gray-900 text-indigo-500 focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-400">
            I agree to the Terms of Service and Privacy Policy.
          </label>
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full py-3">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </div>

        <div className="pt-4 text-sm text-gray-400 text-center">
          Already have an account? <NavLink className="text-indigo-300" to="/auth/login">Sign in</NavLink>
        </div>
      </form>
    </div>
  );
};

export default Register;
