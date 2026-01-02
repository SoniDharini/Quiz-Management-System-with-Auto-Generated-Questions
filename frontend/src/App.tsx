import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { CreateQuizPage } from './components/CreateQuizPage';
import { FeaturesPage } from './components/FeaturesPage';
import { ProfilePage } from './components/ProfilePage';
import { TakeQuizPage } from './components/TakeQuizPage';

import { SettingsPage } from './components/SettingsPage';

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for now

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleSignUp = () => {
    // Implement sign up logic
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} onNavigateToSignUp={() => navigate('/signup')} />} />
        <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} onNavigateToLogin={() => navigate('/login')} />} />
        {/* Redirect all other paths to login if not authenticated */}
        <Route path="*" element={<LoginPage onLogin={handleLogin} onNavigateToSignUp={() => navigate('/signup')} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <HomePage
          onLogout={handleLogout}
          onNavigateToProfile={() => navigate('/profile')}
          onNavigateToSettings={() => navigate('/settings')}
          onNavigateToCreateQuiz={() => navigate('/create-quiz')}
          onNavigateToFeatures={() => navigate('/features')}
          onNavigateToTakeQuiz={(quizId) => navigate(quizId ? `/take-quiz/${quizId}` : '/take-quiz')}
          onNavigateToUploadQuiz={() => navigate('/upload-quiz')}
        />
      } />
      <Route path="/create-quiz" element={<CreateQuizPage onBack={() => navigate('/')} onNavigateToTakeQuiz={(quizId) => navigate(quizId ? `/take-quiz/${quizId}` : '/take-quiz')} />} />
      <Route path="/features" element={<FeaturesPage onBack={() => navigate('/')} />} />
      <Route path="/profile" element={<ProfilePage onBack={() => navigate('/')} onLogout={handleLogout} />} />
      <Route path="/settings" element={<SettingsPage onBack={() => navigate('/')} />} />
      <Route path="/take-quiz" element={<TakeQuizPage onBack={() => navigate('/')} />} />
      <Route path="/take-quiz/:quizId" element={<TakeQuizPage onBack={() => navigate('/')} />} />
    </Routes>
  );
}



import ErrorBoundary from './components/ErrorBoundary';



export default function App() {

  return (

    <BrowserRouter>

      <ErrorBoundary>

        <AppContent />

      </ErrorBoundary>

    </BrowserRouter>

  );

}
