import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { CreateQuizPage } from './components/CreateQuizPage';
import { FeaturesPage } from './components/FeaturesPage';
import { ProfilePage } from './components/ProfilePage';
import { TakeQuizPage } from './components/TakeQuizPage';
import { SettingsPage } from './components/SettingsPage';
import { LandingPage } from './components/LandingPage';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import { authAPI } from './services/api';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/landingpage');
  };

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><HomePage onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/create-quiz" element={<ProtectedRoute><CreateQuizPage onBack={() => navigate('/home')} /></ProtectedRoute>} />
        <Route path="/features" element={<ProtectedRoute><FeaturesPage onBack={() => navigate('/home')} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage onBack={() => navigate('/home')} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage onBack={() => navigate('/home')} /></ProtectedRoute>} />
        <Route path="/take-quiz" element={<ProtectedRoute><TakeQuizPage onBack={() => navigate('/home')} /></ProtectedRoute>} />
        <Route path="/take-quiz/:quizId" element={<ProtectedRoute><TakeQuizPage onBack={() => navigate('/home')} /></ProtectedRoute>} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ErrorBoundary>
  );
}
