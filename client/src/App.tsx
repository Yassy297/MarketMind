import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthPanel } from './components/AuthPanel';
import { fetchCurrentUser } from './lib/api';
import './App.css';

const features = [
  'Search companies',
  'Upload annual reports',
  'Chat with report documents',
  'Analyze news sentiment'
];

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('marketmind-token');
    if (!storedToken) {
      return;
    }

    void fetchCurrentUser(storedToken)
      .then((response) => {
        setToken(storedToken);
        setUserName(response.user.name);
      })
      .catch(() => {
        localStorage.removeItem('marketmind-token');
      });
  }, []);

  const handleAuthenticated = (nextToken: string) => {
    setToken(nextToken);
    void fetchCurrentUser(nextToken)
      .then((response) => setUserName(response.user.name))
      .catch(() => setUserName(''));
  };

  return (
    <main className="app-root">
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="hero-content"
        >
          <p className="hero-tagline">AI Financial Research Assistant</p>
          <h1 className="hero-title">
            MarketMind helps you research companies with AI-powered insights.
          </h1>
          <p className="hero-copy">
            Search public companies, analyze financial documents, and chat with uploaded reports in one streamlined workspace.
          </p>
          <div className="features-list">
            {features.map((feature) => (
              <span key={feature} className="feature-pill">
                {feature}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="auth-section">
          {token ? (
            <div className="auth-success">
              <p className="auth-success-tag">Authenticated</p>
              <h2 className="auth-success-title">Welcome back, {userName || 'researcher'}.</h2>
              <p className="auth-success-copy">
                Your secure session is active. The next milestones will add document upload, embeddings, and RAG-powered chat.
              </p>
            </div>
          ) : (
            <div className="auth-panel-wrapper">
              <AuthPanel onAuthenticated={handleAuthenticated} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
