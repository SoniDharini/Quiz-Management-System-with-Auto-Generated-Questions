const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

// Authentication APIs
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data.user_id);
    localStorage.setItem('username', data.username);
    return data;
  },

  register: async (username: string, email: string, password: string, password2: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, password2 })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data.user_id);
    localStorage.setItem('username', data.username);
    return data;
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    return response.ok;
  },

  changePassword: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }
    return response.json();
  }
};

// User Profile APIs
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/user/profile/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  getRecentActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/user/activity/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch recent activity');
    return response.json();
  },

  getUserPerformance: async () => {
    const response = await fetch(`${API_BASE_URL}/user/performance/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user performance');
    return response.json();
  },

  getUserAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/user/analytics/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user analytics');
    return response.json();
  },

  getOverallPerformance: async () => {
    const response = await fetch(`${API_BASE_URL}/user/performance/overall/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch overall performance');
    return response.json();
  },

  getCategoryDistribution: async () => {
    const response = await fetch(`${API_BASE_URL}/user/performance/category-distribution/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch category distribution');
    return response.json();
  },

  getPerformanceByCategory: async () => {
    const response = await fetch(`${API_BASE_URL}/user/performance/by-category/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch performance by category');
    return response.json();
  },

  getUserProgress: async () => {
    const response = await fetch(`${API_BASE_URL}/user/performance/progress/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user progress');
    return response.json();
  },

  getLeaderboard: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  getAllAchievements: async () => {
    const response = await fetch(`${API_BASE_URL}/achievements/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch all achievements');
    return response.json();
  },

  getUserAchievements: async () => {
    const response = await fetch(`${API_BASE_URL}/user/achievements/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user achievements');
    return response.json();
  },

  deleteAccount: async () => {
    const response = await fetch(`${API_BASE_URL}/user/delete/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return true;
  }
};

// Category Hierarchy APIs
export const categoryAPI = {
  getCategories: async () => {
    console.log('API: Fetching categories from', `${API_BASE_URL}/categories/`);
    const response = await fetch(`${API_BASE_URL}/categories/`);
    console.log('API: Categories response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Categories error:', errorText);
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    console.log('API: Categories data:', data);
    return data;
  },

  getLevels: async (categoryId?: number) => {
    const url = categoryId
      ? `${API_BASE_URL}/levels/?category_id=${categoryId}`
      : `${API_BASE_URL}/levels/`;
    console.log('API: Fetching levels from', url);
    const response = await fetch(url);
    console.log('API: Levels response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Levels error:', errorText);
      throw new Error('Failed to fetch levels');
    }
    const data = await response.json();
    console.log('API: Levels data:', data);
    return data;
  },

  getSubjects: async (levelId?: number) => {
    const url = levelId
      ? `${API_BASE_URL}/subjects/?level_id=${levelId}`
      : `${API_BASE_URL}/subjects/`;
    console.log('API: Fetching subjects from', url);
    const response = await fetch(url);
    console.log('API: Subjects response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Subjects error:', errorText);
      throw new Error('Failed to fetch subjects');
    }
    const data = await response.json();
    console.log('API: Subjects data:', data);
    return data;
  }
};

// Quiz APIs
export const quizAPI = {
  // Create quiz configuration
  createConfig: async (configData: {
    category: number;
    level: number;
    subject: number;
    number_of_questions: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    const response = await fetch(`${API_BASE_URL}/quiz/config/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(configData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  // Generate AI quiz from configuration
  generateQuiz: async (configId: number, title?: string) => {
    const response = await fetch(`${API_BASE_URL}/quiz/generate/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ config_id: configId, title })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate quiz');
    }
    return response.json();
  },

  // Generate AI quiz from subject selection (without config)
  generateQuizFromSubject: async (subjectId: number, difficulty: string, numQuestions: number, title?: string) => {
    console.log('API: Generating quiz from subject:', { subjectId, difficulty, numQuestions, title });
    const response = await fetch(`${API_BASE_URL}/quiz/generate/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        subject_id: subjectId,
        difficulty,
        num_questions: numQuestions,
        title
      })
    });
    console.log('API: Generate quiz response status:', response.status);
    if (!response.ok) {
      const error = await response.json();
      console.error('API: Generate quiz error:', error);
      throw new Error(error.error || 'Failed to generate quiz');
    }
    const data = await response.json();
    console.log('API: Generated quiz data:', data);
    return data;
  },

  // Get all quizzes
  getQuizzes: async () => {
    const response = await fetch(`${API_BASE_URL}/quizzes/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },

  // Get recommended quizzes
  getRecommendedQuizzes: async () => {
    const response = await fetch(`${API_BASE_URL}/quizzes/recommended/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch recommended quizzes');
    return response.json();
  },

  // Get quiz for taking (without answers)
  getQuizToTake: async (quizId: number) => {
    console.log('API: Fetching quiz', quizId, 'from', `${API_BASE_URL}/quizzes/${quizId}/take/`);
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/take/`, {
      headers: getAuthHeaders()
    });
    console.log('API: Quiz fetch response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Quiz fetch error:', errorText);
      throw new Error('Failed to fetch quiz');
    }
    const data = await response.json();
    console.log('API: Quiz data received:', data);
    return data;
  },

  // Get quiz detail (with answers - for review)
  getQuizDetail: async (quizId: number) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch quiz details');
    return response.json();
  },

  // Start quiz attempt
  startQuiz: async (quizId: number) => {
    const response = await fetch(`${API_BASE_URL}/quiz/start/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quiz_id: quizId })
    });
    if (!response.ok) throw new Error('Failed to start quiz');
    return response.json();
  },

  // Submit quiz answers
  submitQuiz: async (attemptId: number, answers: { question_id: number; selected_option: number }[], timeTaken?: number) => {
    const response = await fetch(`${API_BASE_URL}/quiz/submit/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        attempt_id: attemptId,
        answers,
        time_taken: timeTaken
      })
    });
    if (!response.ok) throw new Error('Failed to submit quiz');
    return response.json();
  },

  // Get quiz history
  getQuizHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/quiz/history/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch quiz history');
    return response.json();
  },

  // Generate quiz from uploaded file using OpenAI
  generateQuizFromFile: async (file: File, options: {
    title: string;
    num_questions: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    const token = getAuthToken();
    console.log('generateQuizFromFile - Token exists:', !!token);

    if (!token) {
      throw new Error('Not authenticated. Please login again.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', options.title);
    formData.append('num_questions', options.num_questions.toString());
    formData.append('difficulty', options.difficulty);

    console.log('Sending file upload request with auth token');
    const response = await fetch(`${API_BASE_URL}/quiz/generate/file/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`
      },
      body: formData
    });

    console.log('File upload response status:', response.status);
    if (!response.ok) {
      const error = await response.json();
      console.error('File upload error:', error);
      throw new Error(error.error || 'Failed to generate quiz from file');
    }
    return response.json();
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getStoredUsername = (): string | null => {
  return localStorage.getItem('username');
};
