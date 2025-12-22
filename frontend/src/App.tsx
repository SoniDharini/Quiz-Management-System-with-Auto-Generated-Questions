import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { CreateQuizPage } from './components/CreateQuizPage';
import { FeaturesPage } from './components/FeaturesPage';
import { TakeQuizPage } from './components/TakeQuizPage';
import { isAuthenticated, authAPI } from './services/api';

type Page = 'login' | 'signup' | 'home' | 'profile' | 'create-quiz' | 'features' | 'take-quiz';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      setCurrentPage('home');
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleSignUp = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  const handleNavigateToProfile = () => {
    setCurrentPage('profile');
  };

  const handleNavigateToCreateQuiz = () => {
    setSelectedQuizId(null); // Clear any existing quiz ID
    setCurrentPage('create-quiz');
  };

  const handleNavigateToFeatures = () => {
    setCurrentPage('features');
  };

  const handleNavigateToTakeQuiz = (quizId?: number) => {
    console.log('Navigating to take quiz with ID:', quizId);
    setSelectedQuizId(quizId || null);
    setCurrentPage('take-quiz');
  };

  const handleBackToHome = () => {
    setSelectedQuizId(null); // Clear selected quiz when going back
    setCurrentPage('home');
  };

  if (currentPage === 'login') {
    return (
      <LoginPage 
        onLogin={handleLogin}
        onNavigateToSignUp={() => setCurrentPage('signup')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignUpPage 
        onSignUp={handleSignUp}
        onNavigateToLogin={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'profile') {
    return <ProfilePage onBack={handleBackToHome} onLogout={handleLogout} />;
  }

  if (currentPage === 'create-quiz') {
    return <CreateQuizPage onBack={handleBackToHome} onNavigateToTakeQuiz={handleNavigateToTakeQuiz} />;
  }

  if (currentPage === 'features') {
    return <FeaturesPage onBack={handleBackToHome} />;
  }

  if (currentPage === 'take-quiz') {
    return <TakeQuizPage onBack={handleBackToHome} preselectedQuizId={selectedQuizId} />;
  }

  return (
    <HomePage 
      onLogout={handleLogout} 
      onNavigateToProfile={handleNavigateToProfile}
      onNavigateToCreateQuiz={handleNavigateToCreateQuiz}
      onNavigateToFeatures={handleNavigateToFeatures}
      onNavigateToTakeQuiz={handleNavigateToTakeQuiz}
    />
  );
}