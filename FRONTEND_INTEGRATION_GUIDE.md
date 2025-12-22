# Frontend Integration Guide

This guide shows how to integrate the React/TypeScript frontend with the Django backend.

---

## 🔧 Backend Configuration

### 1. Update CORS Settings

The backend is already configured for frontend at `http://localhost:5173` (Vite default).

If using different port, update `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Start Backend

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install axios
```

### 2. Create API Service

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Authentication Integration

### Login Component

```typescript
// src/components/LoginPage.tsx
import api from '../services/api';

const handleLogin = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login/', {
      username,
      password,
    });
    
    // Store token
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userId', response.data.user_id);
    localStorage.setItem('username', response.data.username);
    
    // Navigate to home
    onLogin();
  } catch (error) {
    console.error('Login failed:', error);
    alert('Invalid credentials');
  }
};
```

### Register Component

```typescript
// src/components/SignUpPage.tsx
import api from '../services/api';

const handleRegister = async (formData: any) => {
  try {
    const response = await api.post('/auth/register/', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      first_name: formData.fullName.split(' ')[0],
      last_name: formData.fullName.split(' ').slice(1).join(' '),
    });
    
    // Auto-login after registration
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userId', response.data.user_id);
    
    onSignUp();
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

---

## 📚 Category Selection Integration

### TakeQuizPage Component

```typescript
// src/components/TakeQuizPage.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';

const TakeQuizPage = () => {
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  
  const handleCategorySelect = async (categoryName: string) => {
    try {
      const response = await api.get(`/levels/?category=${categoryName}`);
      setLevels(response.data);
    } catch (error) {
      console.error('Failed to fetch levels:', error);
    }
  };
  
  const handleLevelSelect = async (levelName: string) => {
    try {
      const response = await api.get(`/subjects/?level=${levelName}`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };
  
  const handleGenerateQuiz = async () => {
    try {
      // Create config
      const configResponse = await api.post('/quiz/config/', {
        category: selectedCategory,
        level: selectedLevel,
        subject: selectedSubject,
        number_of_questions: numQuestions,
        difficulty: difficulty,
      });
      
      // Generate quiz
      const quizResponse = await api.post('/quiz/generate/', {
        config_id: configResponse.data.id,
        title: `${selectedSubject} Quiz`,
      });
      
      // Navigate to quiz
      setCurrentQuiz(quizResponse.data.quiz);
      setCurrentStep('quiz');
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };
  
  return (
    // Your existing JSX
  );
};
```

---

## 📝 Quiz Taking Integration

### Taking Quiz

```typescript
const [quiz, setQuiz] = useState(null);
const [answers, setAnswers] = useState<Record<number, number>>({});
const [startTime, setStartTime] = useState(Date.now());

// Fetch quiz for taking
const fetchQuiz = async (quizId: number) => {
  try {
    const response = await api.get(`/quizzes/${quizId}/take/`);
    setQuiz(response.data);
    setStartTime(Date.now());
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
  }
};

// Submit quiz
const submitQuiz = async () => {
  try {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // seconds
    
    const answersArray = quiz.questions.map((q: any) => ({
      question_id: q.id,
      selected_option: answers[q.id] ?? 0,
    }));
    
    const response = await api.post('/quiz/submit/', {
      quiz_id: quiz.id,
      answers: answersArray,
      time_taken: timeTaken,
    });
    
    // Show results
    setResults(response.data);
    setCurrentStep('results');
  } catch (error) {
    console.error('Failed to submit quiz:', error);
  }
};
```

---

## 📤 File Upload Integration (Create Quiz)

### CreateQuizPage Component

```typescript
// src/components/CreateQuizPage.tsx
import api from '../services/api';

const handleFileUpload = async () => {
  try {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', quizTitle);
    formData.append('num_questions', numQuestions);
    formData.append('difficulty', difficulty);
    
    // You can also add category/level/subject IDs if needed
    // formData.append('category_id', '2');
    
    const response = await api.post('/quiz/generate/file/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Quiz generated successfully
    setGeneratedQuiz(response.data.quiz);
    setStep('complete');
  } catch (error) {
    console.error('Failed to generate quiz from file:', error);
  }
};
```

---

## 👤 Profile Integration

### ProfilePage Component

```typescript
// src/components/ProfilePage.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  const fetchProfileData = async () => {
    try {
      const [profileRes, analyticsRes, activityRes, achievementsRes] = 
        await Promise.all([
          api.get('/user/profile/'),
          api.get('/user/analytics/'),
          api.get('/user/activity/'),
          api.get('/user/achievements/'),
        ]);
      
      setProfile(profileRes.data);
      setAnalytics(analyticsRes.data);
      setRecentActivity(activityRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };
  
  const updateProfile = async (updates: any) => {
    try {
      const formData = new FormData();
      Object.keys(updates).forEach(key => {
        formData.append(key, updates[key]);
      });
      
      const response = await api.patch('/user/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  return (
    // Use profile, analytics, recentActivity, achievements data
  );
};
```

---

## 🎮 Real-time XP and Level Updates

```typescript
// After quiz submission
const handleQuizSubmit = async () => {
  const response = await api.post('/quiz/submit/', submitData);
  
  // Show XP earned animation
  const { xp_earned, new_level, new_xp } = response.data;
  
  if (new_level > currentLevel) {
    // Show level up notification
    showLevelUpModal(new_level);
  }
  
  // Update local state
  setUserXP(new_xp);
  setUserLevel(new_level);
};
```

---

## 📊 Analytics Display

```typescript
// Display analytics data
const AnalyticsDashboard = ({ analytics }: any) => {
  return (
    <div>
      <h3>Performance Overview</h3>
      <div>
        <p>Total Quizzes: {analytics.total_quizzes_taken}</p>
        <p>Accuracy: {analytics.overall_accuracy}%</p>
        <p>Time Spent: {Math.floor(analytics.total_time_spent / 60)} minutes</p>
      </div>
      
      <h3>Difficulty Breakdown</h3>
      <div>
        <p>Easy: {analytics.easy_quizzes_taken}</p>
        <p>Medium: {analytics.medium_quizzes_taken}</p>
        <p>Hard: {analytics.hard_quizzes_taken}</p>
      </div>
      
      <h3>Category Performance</h3>
      {Object.entries(analytics.category_stats).map(([cat, stats]: any) => (
        <div key={cat}>
          <p>{cat}: {stats.avg_score}% avg</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 🏆 Achievements Display

```typescript
const AchievementsList = ({ achievements, allAchievements }: any) => {
  const unlockedIds = achievements.map((a: any) => a.achievement.id);
  
  return (
    <div className="achievements-grid">
      {allAchievements.map((achievement: any) => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        
        return (
          <div 
            key={achievement.id}
            className={`achievement ${isUnlocked ? 'unlocked' : 'locked'}`}
          >
            <h4>{achievement.title}</h4>
            <p>{achievement.description}</p>
            <span>{achievement.xp_reward} XP</span>
            {isUnlocked && <span>✓ Unlocked</span>}
          </div>
        );
      })}
    </div>
  );
};

// Fetch all achievements
const fetchAchievements = async () => {
  const [allRes, userRes] = await Promise.all([
    api.get('/achievements/'),
    api.get('/user/achievements/'),
  ]);
  
  setAllAchievements(allRes.data);
  setUserAchievements(userRes.data);
};
```

---

## 🔄 Complete Flow Example

### Full Quiz Taking Flow

```typescript
const QuizFlow = () => {
  // 1. Login
  await api.post('/auth/login/', { username, password });
  
  // 2. Get categories
  const categories = await api.get('/categories/');
  
  // 3. Get levels
  const levels = await api.get('/levels/?category=Computer Science');
  
  // 4. Get subjects
  const subjects = await api.get('/subjects/?level=Programming');
  
  // 5. Create config
  const config = await api.post('/quiz/config/', {
    category: 'Computer Science',
    level: 'Programming',
    subject: 'Data Structures',
    number_of_questions: 10,
    difficulty: 'medium',
  });
  
  // 6. Generate quiz
  const quiz = await api.post('/quiz/generate/', {
    config_id: config.data.id,
  });
  
  // 7. Take quiz
  const quizData = await api.get(`/quizzes/${quiz.data.quiz.id}/take/`);
  
  // 8. Submit answers
  const result = await api.post('/quiz/submit/', {
    quiz_id: quiz.data.quiz.id,
    answers: [...answers],
    time_taken: 300,
  });
  
  // 9. Show results
  console.log('Score:', result.data.attempt.score_percentage);
  console.log('XP Earned:', result.data.xp_earned);
};
```

---

## 🐛 Error Handling

```typescript
// Centralized error handler
const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        alert('Invalid data. Please check your input.');
        break;
      case 401:
        alert('Please login to continue.');
        window.location.href = '/login';
        break;
      case 404:
        alert('Resource not found.');
        break;
      case 500:
        alert('Server error. Please try again later.');
        break;
      default:
        alert('An error occurred.');
    }
  } else if (error.request) {
    // Request made but no response
    alert('Network error. Please check your connection.');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
};

// Usage
try {
  await api.post('/quiz/submit/', data);
} catch (error) {
  handleApiError(error);
}
```

---

## ✅ Testing API Connection

Create `src/services/apiTest.ts`:

```typescript
import api from './api';

export const testApiConnection = async () => {
  try {
    // Test public endpoint
    const categories = await api.get('/categories/');
    console.log('✅ API connection successful');
    console.log('Categories:', categories.data);
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

// Call on app startup
testApiConnection();
```

---

## 📝 Environment Variables (Frontend)

Create `.env` in frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Update `api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

---

## 🚀 Production Deployment

### Backend
```bash
# Update .env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Frontend
```bash
# Update .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 📚 Additional Resources

- Backend API docs: `/backend/API_DOCUMENTATION.md`
- Backend setup: `/backend/README.md`
- Quick reference: `/backend/QUICK_REFERENCE.md`

---

**🎉 You're all set! The backend and frontend are now fully integrated.**
