import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Documents from './pages/Documents';
import AIChat from './pages/AIChat';
import Watchlist from './pages/Watchlist';
import JournalLayout from './pages/journal/JournalLayout';
import JournalOverview from './pages/journal/JournalOverview';
import JournalTrades from './pages/journal/JournalTrades';
import JournalTradeForm from './pages/journal/JournalTradeForm';
import JournalTradeDetail from './pages/journal/JournalTradeDetail';
import JournalCalendar from './pages/journal/JournalCalendar';
import JournalReports from './pages/journal/JournalReports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={<AuthLayout />}
      >
        <Route
          path="login"
          element={<LoginRedirectWrapper><Login /></LoginRedirectWrapper>}
        />
        <Route
          path="register"
          element={<LoginRedirectWrapper><Register /></LoginRedirectWrapper>}
        />
      </Route>

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="stocks" element={<Stocks />} />
        <Route path="journal" element={<JournalLayout />}>
          <Route index element={<JournalOverview />} />
          <Route path="trades" element={<JournalTrades />} />
          <Route path="trades/new" element={<JournalTradeForm />} />
          <Route path="trades/:id" element={<JournalTradeDetail />} />
          <Route path="trades/:id/edit" element={<JournalTradeForm />} />
          <Route path="calendar" element={<JournalCalendar />} />
          <Route path="reports" element={<JournalReports />} />
        </Route>
        <Route path="documents" element={<Documents />} />
        <Route path="chat" element={<AIChat />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

const LoginRedirectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};
