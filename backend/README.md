# Quiz Management System - Backend

A comprehensive Django REST API backend for an AI-powered quiz management system with MongoDB support.

## Features

- **User Authentication**: Registration, login, logout with token-based authentication
- **Category Hierarchy**: Categories → Levels → Subjects
- **AI Quiz Generation**: Generate quizzes using OpenAI GPT-3.5
- **File Upload**: Create quizzes from uploaded study materials
- **Quiz Taking**: Complete quiz flow with timer support
- **Gamification**: XP system, levels, streaks, and achievements
- **Analytics**: Comprehensive user performance tracking
- **Profile Management**: User profiles with statistics

## Tech Stack

- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Database**: MongoDB (via Djongo)
- **AI**: OpenAI GPT-3.5 Turbo
- **Authentication**: Token-based auth

## Prerequisites

- Python 3.8+
- MongoDB Compass (or MongoDB server)
- OpenAI API Key

## Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Create virtual environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup MongoDB

- Install and start MongoDB (or use MongoDB Compass)
- Default connection: `mongodb://localhost:27017/quiz_management_db`

### 5. Configure environment variables

Edit `.env` file:

```env
# MongoDB Settings
MONGODB_URI=mongodb://localhost:27017/quiz_management_db
MONGODB_NAME=quiz_management_db

# Django Settings
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=your-openai-api-key-here

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**⚠️ IMPORTANT**: Get your OpenAI API key from https://platform.openai.com/api-keys

### 6. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Populate initial data

```bash
python manage.py populate_data
```

This creates:
- Categories (Academics, Computer Science, Government Exams)
- Levels and Subjects for each category
- Achievement definitions

### 8. Create superuser (optional)

```bash
python manage.py createsuperuser
```

### 9. Run the server

```bash
python manage.py runserver
```

Server will run on: `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user

### Category Hierarchy

- `GET /api/categories/` - List all categories
- `GET /api/levels/?category=<name>` - List levels by category
- `GET /api/subjects/?level=<name>` - List subjects by level

### User Profile

- `GET /api/user/profile/` - Get user profile
- `PATCH /api/user/profile/` - Update user profile
- `GET /api/user/analytics/` - Get user analytics
- `GET /api/user/activity/` - Get recent activity

### Quiz Configuration & Generation

- `POST /api/quiz/config/` - Create quiz configuration
- `POST /api/quiz/generate/` - Generate quiz from config (AI)
- `POST /api/quiz/generate/file/` - Generate quiz from uploaded file (AI)

### Quiz Management

- `GET /api/quizzes/` - List all quizzes
- `GET /api/quizzes/<id>/` - Get quiz details
- `GET /api/quizzes/<id>/take/` - Get quiz for taking (no answers)

### Quiz Attempts

- `POST /api/quiz/start/` - Start quiz attempt
- `POST /api/quiz/submit/` - Submit quiz answers
- `GET /api/quiz/attempts/<id>/` - Get attempt details
- `GET /api/quiz/history/` - Get user's quiz history

### Achievements

- `GET /api/achievements/` - List all achievements
- `GET /api/user/achievements/` - Get user's unlocked achievements

## API Request Examples

### Register User

```bash
POST /api/auth/register/
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password2": "securepass123"
}
```

### Generate AI Quiz

```bash
POST /api/quiz/config/
{
  "category": "Computer Science",
  "level": "Programming",
  "subject": "Data Structures",
  "number_of_questions": 10,
  "difficulty": "medium"
}

# Then use the config_id from response
POST /api/quiz/generate/
{
  "config_id": 1,
  "title": "Data Structures Quiz"
}
```

### Submit Quiz

```bash
POST /api/quiz/submit/
{
  "quiz_id": 1,
  "answers": [
    {"question_id": 1, "selected_option": 2},
    {"question_id": 2, "selected_option": 0}
  ],
  "time_taken": 300
}
```

## Database Schema

### Main Models

- **Category**: Top-level quiz domains
- **Level**: Sub-categories within categories
- **Subject**: Specific topics within levels
- **Quiz**: Quiz instances
- **Question**: Individual questions
- **QuizAttempt**: User quiz submissions
- **Answer**: Individual answer records
- **UserProfile**: Extended user info with gamification
- **Achievement**: Achievement definitions
- **QuizAnalytics**: User performance analytics

## Admin Panel

Access Django admin at: `http://localhost:8000/admin`

Manage:
- Users and profiles
- Categories, levels, subjects
- Quizzes and questions
- Quiz attempts and answers
- Achievements
- Analytics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/quiz_management_db` |
| `MONGODB_NAME` | Database name | `quiz_management_db` |
| `SECRET_KEY` | Django secret key | - |
| `DEBUG` | Debug mode | `True` |
| `OPENAI_API_KEY` | OpenAI API key | **Required** |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in `.env`
- Try: `mongodb://127.0.0.1:27017/quiz_management_db`

### OpenAI API Error

- Verify API key is valid
- Check OpenAI account has credits
- Ensure no rate limiting

### CORS Error

- Add frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`
- Check `corsheaders` is in `INSTALLED_APPS`

## Development

### Running Tests

```bash
python manage.py test
```

### Making Model Changes

```bash
python manage.py makemigrations
python manage.py migrate
```

### Clearing Database

```bash
# Drop MongoDB collection
# Or use MongoDB Compass to delete collections
python manage.py flush
python manage.py populate_data
```

## Production Deployment

1. Set `DEBUG=False`
2. Change `SECRET_KEY`
3. Configure production database
4. Set up proper CORS origins
5. Use environment-specific `.env`
6. Configure static/media file serving
7. Use HTTPS
8. Set up proper logging

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.
