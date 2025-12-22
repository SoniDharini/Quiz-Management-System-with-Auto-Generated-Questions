# API Documentation - Quiz Management System

Complete API reference for the Quiz Management System backend.

---

## Base URL

```
http://localhost:8000/api
```

---

## Authentication

All endpoints except login, register, and public quiz lists require authentication.

**Authentication Header:**
```
Authorization: Token <your-auth-token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User

**Endpoint:** `POST /auth/register/`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password2": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "message": "User registered successfully"
}
```

---

### 1.2 Login User

**Endpoint:** `POST /auth/login/`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepass123"
}
```

**Response (200 OK):**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "level": 1,
  "xp": 0
}
```

---

### 1.3 Logout User

**Endpoint:** `POST /auth/logout/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Category Hierarchy Endpoints

### 2.1 List Categories

**Endpoint:** `GET /categories/`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Academics",
    "description": "Study materials for 10th and 12th grade students",
    "icon": "GraduationCap",
    "color": "from-blue-400 to-blue-600",
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Computer Science",
    "description": "Core CS topics and programming concepts",
    "icon": "Code2",
    "color": "from-purple-400 to-purple-600",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2.2 List Levels

**Endpoint:** `GET /levels/?category=<category_name>`

**Query Parameters:**
- `category` (optional): Filter by category name
- `category_id` (optional): Filter by category ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Core Subjects",
    "category": 2,
    "category_name": "Computer Science",
    "description": "",
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Programming",
    "category": 2,
    "category_name": "Computer Science",
    "description": "",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2.3 List Subjects

**Endpoint:** `GET /subjects/?level=<level_name>`

**Query Parameters:**
- `level` (optional): Filter by level name
- `level_id` (optional): Filter by level ID

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Data Structures",
    "level": 1,
    "level_name": "Core Subjects",
    "category_name": "Computer Science",
    "description": "",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## 3. User Profile Endpoints

### 3.1 Get User Profile

**Endpoint:** `GET /user/profile/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "profile_picture": null,
  "category_preference": "Computer Science",
  "bio": "",
  "level": 5,
  "xp": 1250,
  "xp_to_next_level": 2000,
  "total_quizzes_taken": 25,
  "total_quizzes_created": 5,
  "total_correct_answers": 180,
  "total_questions_answered": 250,
  "current_streak": 7,
  "longest_streak": 12,
  "average_score": 87.5,
  "last_activity_date": "2024-01-15",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 3.2 Update User Profile

**Endpoint:** `PATCH /user/profile/`

**Headers:** 
- `Authorization: Token <token>`
- `Content-Type: multipart/form-data` (if uploading image)

**Request Body (Form Data):**
```json
{
  "full_name": "John Michael Doe",
  "category_preference": "Academics",
  "bio": "Passionate learner",
  "profile_picture": <file>
}
```

**Response (200 OK):** Same as Get User Profile

---

## 4. Quiz Configuration & Generation

### 4.1 Create Quiz Configuration

**Endpoint:** `POST /quiz/config/`

**Headers:** `Authorization: Token <token>`

**Request Body:**
```json
{
  "category": "Computer Science",
  "level": "Programming",
  "subject": "Data Structures",
  "number_of_questions": 15,
  "difficulty": "medium"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 1,
  "category": 2,
  "category_name": "Computer Science",
  "level": 2,
  "level_name": "Programming",
  "subject": 5,
  "subject_name": "Data Structures",
  "number_of_questions": 15,
  "difficulty": "medium",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### 4.2 Generate AI Quiz from Configuration

**Endpoint:** `POST /quiz/generate/`

**Headers:** `Authorization: Token <token>`

**Request Body:**
```json
{
  "config_id": 1,
  "title": "Data Structures Advanced Quiz"
}
```

**Response (201 Created):**
```json
{
  "message": "Quiz generated successfully",
  "quiz": {
    "id": 10,
    "title": "Data Structures Advanced Quiz",
    "description": "",
    "category": 2,
    "category_name": "Computer Science",
    "level": 2,
    "level_name": "Programming",
    "subject": 5,
    "subject_name": "Data Structures",
    "difficulty": "medium",
    "quiz_type": "ai_generated",
    "uploaded_file": null,
    "is_ai_generated": true,
    "is_published": true,
    "time_limit": null,
    "created_by": 1,
    "created_by_username": "john_doe",
    "created_at": "2024-01-15T10:05:00Z",
    "updated_at": "2024-01-15T10:05:00Z",
    "total_questions": 15,
    "total_attempts": 0,
    "questions": [
      {
        "id": 1,
        "quiz": 10,
        "question_text": "What is the time complexity of binary search?",
        "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        "correct_answer": 1,
        "explanation": "Binary search divides the search space in half each iteration.",
        "order": 1,
        "created_at": "2024-01-15T10:05:00Z"
      }
    ]
  }
}
```

---

### 4.3 Generate Quiz from File Upload

**Endpoint:** `POST /quiz/generate/file/`

**Headers:** 
- `Authorization: Token <token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
```
file: <pdf/doc/txt file>
title: "Python Basics Quiz"
num_questions: 10
difficulty: "easy"
category_id: 2
level_id: 2
subject_id: 8
```

**Response (201 Created):** Similar to Generate AI Quiz

---

## 5. Quiz Management

### 5.1 List Quizzes

**Endpoint:** `GET /quizzes/`

**Query Parameters:**
- `category` (optional): Filter by category name
- `level` (optional): Filter by level name
- `subject` (optional): Filter by subject name
- `difficulty` (optional): Filter by difficulty (easy/medium/hard)

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "title": "Data Structures Advanced Quiz",
    "category_name": "Computer Science",
    "level_name": "Programming",
    "subject_name": "Data Structures",
    "difficulty": "medium",
    "quiz_type": "ai_generated",
    "is_published": true,
    "created_by_username": "john_doe",
    "created_at": "2024-01-15T10:05:00Z",
    "total_questions": 15
  }
]
```

---

### 5.2 Get Quiz Details

**Endpoint:** `GET /quizzes/<quiz_id>/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):** Full quiz object with all questions (including answers)

---

### 5.3 Get Quiz for Taking

**Endpoint:** `GET /quizzes/<quiz_id>/take/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):**
```json
{
  "id": 10,
  "title": "Data Structures Advanced Quiz",
  "description": "",
  "category_name": "Computer Science",
  "subject_name": "Data Structures",
  "difficulty": "medium",
  "time_limit": 600,
  "questions": [
    {
      "id": 1,
      "question_text": "What is the time complexity of binary search?",
      "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      "order": 1
    }
  ]
}
```
**Note:** `correct_answer` is NOT included

---

## 6. Quiz Attempts

### 6.1 Start Quiz Attempt

**Endpoint:** `POST /quiz/start/`

**Headers:** `Authorization: Token <token>`

**Request Body:**
```json
{
  "quiz_id": 10
}
```

**Response (201 Created):**
```json
{
  "id": 25,
  "user": 1,
  "user_username": "john_doe",
  "quiz": 10,
  "quiz_title": "Data Structures Advanced Quiz",
  "status": "in_progress",
  "started_at": "2024-01-15T11:00:00Z",
  "completed_at": null,
  "time_taken": null,
  "score": 0,
  "total_questions": 15,
  "correct_answers": 0,
  "score_percentage": 0.0,
  "xp_earned": 0,
  "answers": []
}
```

---

### 6.2 Submit Quiz

**Endpoint:** `POST /quiz/submit/`

**Headers:** `Authorization: Token <token>`

**Request Body:**
```json
{
  "quiz_id": 10,
  "answers": [
    {
      "question_id": 1,
      "selected_option": 1
    },
    {
      "question_id": 2,
      "selected_option": 2
    }
  ],
  "time_taken": 450
}
```

**Response (201 Created):**
```json
{
  "message": "Quiz submitted successfully",
  "attempt": {
    "id": 25,
    "user": 1,
    "user_username": "john_doe",
    "quiz": 10,
    "quiz_title": "Data Structures Advanced Quiz",
    "status": "completed",
    "started_at": "2024-01-15T11:00:00Z",
    "completed_at": "2024-01-15T11:07:30Z",
    "time_taken": 450,
    "score": 12,
    "total_questions": 15,
    "correct_answers": 12,
    "score_percentage": 80.0,
    "xp_earned": 180,
    "answers": [...]
  },
  "xp_earned": 180,
  "new_level": 5,
  "new_xp": 1430
}
```

---

### 6.3 Get Quiz Attempt Details

**Endpoint:** `GET /quiz/attempts/<attempt_id>/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):** Full attempt object with answers

---

### 6.4 Get Quiz History

**Endpoint:** `GET /quiz/history/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):**
```json
[
  {
    "id": 25,
    "quiz_title": "Data Structures Advanced Quiz",
    "status": "completed",
    "score_percentage": 80.0,
    "xp_earned": 180,
    "completed_at": "2024-01-15T11:07:30Z"
  }
]
```

---

## 7. Analytics

### 7.1 Get User Analytics

**Endpoint:** `GET /user/analytics/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "user": 1,
  "username": "john_doe",
  "total_quizzes_taken": 25,
  "total_quizzes_created": 5,
  "total_questions_answered": 250,
  "total_correct_answers": 180,
  "easy_quizzes_taken": 8,
  "medium_quizzes_taken": 12,
  "hard_quizzes_taken": 5,
  "category_stats": {
    "Computer Science": {"taken": 15, "avg_score": 85},
    "Academics": {"taken": 10, "avg_score": 90}
  },
  "total_time_spent": 12500,
  "average_quiz_time": 500,
  "overall_accuracy": 72.0,
  "last_updated": "2024-01-15T11:07:30Z"
}
```

---

### 7.2 Get Recent Activity

**Endpoint:** `GET /user/activity/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):**
```json
[
  {
    "id": 25,
    "type": "quiz_taken",
    "title": "Data Structures Advanced Quiz",
    "score": 80,
    "date": "2 hours ago",
    "xp": 180
  }
]
```

---

## 8. Achievements

### 8.1 List All Achievements

**Endpoint:** `GET /achievements/`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "First Steps",
    "description": "Complete your first quiz",
    "icon": "Award",
    "color": "from-blue-400 to-blue-600",
    "xp_reward": 50,
    "criteria_type": "quizzes_taken",
    "criteria_value": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 8.2 Get User Achievements

**Endpoint:** `GET /user/achievements/`

**Headers:** `Authorization: Token <token>`

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "user": 1,
    "achievement": 1,
    "achievement_details": {
      "id": 1,
      "title": "First Steps",
      "description": "Complete your first quiz",
      "icon": "Award",
      "color": "from-blue-400 to-blue-600",
      "xp_reward": 50
    },
    "unlocked_at": "2024-01-05T14:30:00Z"
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid data",
  "details": "..."
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "error": "Quiz not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate quiz",
  "details": "..."
}
```

---

## Rate Limiting

OpenAI API calls are subject to rate limiting. Implement appropriate error handling.

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Difficulty values: `easy`, `medium`, `hard`
3. Question options are 0-indexed (0-3)
4. XP calculations: base 10 per correct answer × difficulty multiplier
5. Profile picture uploads use multipart/form-data

---

## Frontend Integration Example

```javascript
// Login
const login = async (username, password) => {
  const response = await fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
};

// Get Categories
const getCategories = async () => {
  const response = await fetch('http://localhost:8000/api/categories/');
  return await response.json();
};

// Submit Quiz
const submitQuiz = async (quizId, answers, timeTaken) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8000/api/quiz/submit/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      quiz_id: quizId,
      answers: answers,
      time_taken: timeTaken
    })
  });
  return await response.json();
};
```

---

## Contact

For API issues or questions, please create an issue in the repository.
