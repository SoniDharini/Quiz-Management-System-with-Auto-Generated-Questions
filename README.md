# 🎯 AI-Powered Quiz Management System

A comprehensive, full-stack quiz management platform with AI-generated questions, gamification features, and a beautiful modern UI. Create, take, and track quizzes across multiple categories including Academics, Computer Science, and Government Exam preparation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![Django](https://img.shields.io/badge/django-4.2-green.svg)

---

## ✨ Features

### 🤖 AI-Powered Quiz Generation
- **OpenAI Integration** - Automatically generate questions using GPT-3.5 Turbo
- **Smart Question Bank** - 110+ hardcoded questions for instant testing
- **Customizable** - Choose number of questions (5-100) and difficulty level
- **Topic-Specific** - Questions tailored to selected subject and level

### 📚 Comprehensive Content
- **3 Main Categories:** Academics, Computer Science, Government Exams
- **Multiple Levels:** 10th Grade, 12th Grade, Core Subjects, Programming, National/State Level
- **17+ Subjects:** Physics, Chemistry, Data Structures, Python, UPSC, SSC CGL, and more

### 🎮 Gamification System
- **XP & Levels** - Earn experience points and level up
- **Streaks** - Daily activity tracking
- **Achievements** - Unlock badges and rewards
- **Leaderboard Ready** - Comprehensive analytics and statistics

### 🎨 Modern User Interface
- **Beautiful Design** - Gradient backgrounds, smooth animations
- **Responsive** - Works on desktop, tablet, and mobile
- **Intuitive Navigation** - Step-by-step quiz creation flow
- **Real-time Feedback** - Instant score calculation and results

### 🔐 User Management
- **Authentication** - Secure token-based login system
- **User Profiles** - Track progress, stats, and achievements
- **Password Management** - Secure password hashing and change functionality
- **Profile Customization** - Update bio, preferences, and more

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **MongoDB** - [Download MongoDB Compass](https://www.mongodb.com/products/compass)
- **OpenAI API Key** - [Get your key](https://platform.openai.com/api-keys) (optional for hardcoded questions)

### ⚡ 3-Minute Setup

#### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
cd Quiz-Management-System-with-Auto-Generated-Questions
```

#### 2️⃣ Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Populate initial data (categories, levels, subjects)
python manage.py populate_data

# Start backend server
python manage.py runserver
```

**Backend runs at:** `http://127.0.0.1:8000`

#### 3️⃣ Frontend Setup
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

#### 4️⃣ Configure OpenAI (Optional)

**For AI-Generated Questions:**

Edit `backend/.env`:
```env
OPENAI_API_KEY=your-actual-openai-api-key-here
```

**For Hardcoded Questions:**
- No configuration needed! The system includes 110+ pre-loaded questions
- Perfect for testing and offline usage

---

## 📖 User Guide

### Creating an Account

1. Open `http://localhost:5173` in your browser
2. Click **"Sign Up"**
3. Fill in your details (username, email, password)
4. Click **"Create Account"**

### Taking a Quiz

1. **Select Category** - Choose Academics, Computer Science, or Government Exams
2. **Select Level** - Pick your study level (10th Grade, Programming, etc.)
3. **Select Subject** - Choose a specific subject (Physics, Python, UPSC, etc.)
4. **Configure Quiz** - Set number of questions (5-100) and difficulty
5. **Start Quiz** - Click "Start Quiz" to begin
6. **Answer Questions** - Select your answers and navigate with Next/Previous
7. **Submit Quiz** - Review and submit when complete
8. **View Results** - See your score, XP earned, and detailed breakdown

### Viewing Your Profile

1. Click your username in the top right
2. View your:
   - Current level and XP
   - Total quizzes taken
   - Average score
   - Current streak
   - Achievements unlocked

---

## 🏗️ Project Structure

```
Quiz-Management-System/
├── backend/                    # Django REST API
│   ├── quiz_app/              # Main application
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API endpoints
│   │   ├── serializers.py     # Data serialization
│   │   ├── urls.py            # URL routing
│   │   └── management/        # Custom commands
│   │       └── commands/
│   │           └── populate_data.py  # Initial data loader
│   ├── quiz_backend/          # Django settings
│   │   ├── settings.py        # Configuration
│   │   └── urls.py            # Main URL config
│   ├── requirements.txt       # Python dependencies
│   ├── manage.py              # Django management script
│   └── .env                   # Environment variables
│
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── HomePage.tsx
│   │   │   ├── TakeQuizPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignUpPage.tsx
│   │   ├── services/          # API services
│   │   │   └── api.ts         # API calls
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── package.json           # Node dependencies
│   └── vite.config.ts         # Vite configuration
│
├── QUICKSTART.md              # Quick setup guide
├── SETUP_AND_TEST_GUIDE.md    # Detailed setup instructions
├── SYSTEM_ARCHITECTURE.md     # Technical architecture
├── HARDCODED_QUESTIONS_REFERENCE.md  # Question bank reference
└── README.md                  # This file
```

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Django 4.2.7
- **API:** Django REST Framework 3.14.0
- **Database:** MongoDB (via Djongo)
- **Authentication:** Token-based auth
- **AI:** OpenAI GPT-3.5 Turbo

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **UI Components:** shadcn/ui

### DevOps
- **Version Control:** Git
- **Package Management:** pip (Python), npm (Node.js)
- **Environment:** Python venv, Node.js

---

## 📡 API Endpoints

### Authentication
```http
POST   /api/auth/register/     # Register new user
POST   /api/auth/login/        # Login user
POST   /api/auth/logout/       # Logout user
POST   /api/auth/change-password/  # Change password
```

### Category Hierarchy
```http
GET    /api/categories/        # List all categories
GET    /api/levels/?category_id={id}     # Get levels for category
GET    /api/subjects/?level_id={id}      # Get subjects for level
```

### Quiz Management
```http
POST   /api/quiz/config/       # Create quiz configuration
POST   /api/quiz/generate/     # Generate AI quiz
GET    /api/quizzes/           # List all quizzes
GET    /api/quizzes/{id}/      # Get quiz details
GET    /api/quiz/{id}/take/    # Get quiz for taking
POST   /api/quiz/start/        # Start quiz attempt
POST   /api/quiz/submit/       # Submit quiz answers
GET    /api/quiz/history/      # Get user's quiz history
```

### User Profile
```http
GET    /api/user/profile/      # Get user profile
PATCH  /api/user/profile/      # Update user profile
GET    /api/user/analytics/    # Get user analytics
GET    /api/user/achievements/ # Get user achievements
```

---

## 🎮 How It Works

### AI Quiz Generation Flow

```
User Selects:
  Category: Computer Science
  Level: Programming
  Subject: Data Structures
  Questions: 15
  Difficulty: Medium
         ↓
Backend Creates QuizConfig
         ↓
Backend Calls OpenAI API:
  "Generate 15 medium-difficulty MCQ questions 
   on Data Structures under Computer Science - 
   Programming level..."
         ↓
OpenAI Returns:
  [
    {
      "question": "What is the time complexity of binary search?",
      "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      "correct_answer": 1,
      "explanation": "Binary search halves the search space..."
    },
    // ... 14 more questions
  ]
         ↓
Backend Saves Quiz + Questions
         ↓
Frontend Displays Quiz
         ↓
User Answers Questions
         ↓
Backend Calculates Score
         ↓
Backend Awards XP (based on difficulty)
         ↓
User Views Results
```

### Hardcoded Questions Mode

For instant testing without API:
- 110+ pre-loaded questions across 11 subjects
- Instant quiz generation (no waiting)
- Perfect for development and offline use
- No OpenAI API key required

---

## 📊 Database Schema

### Core Models

**Category** → **Level** → **Subject** → **Quiz** → **Question**

- **Category:** Top-level (Academics, Computer Science, Government Exams)
- **Level:** Sub-category (10th Grade, Programming, National Level, etc.)
- **Subject:** Specific topic (Physics, Python, UPSC, etc.)
- **Quiz:** Generated quiz instance
- **Question:** Individual quiz question with options
- **QuizAttempt:** User's attempt at a quiz
- **UserProfile:** Extended user data with gamification

---

## 🎯 Gamification Features

### XP System
```python
# Base XP per correct answer
base_xp = correct_answers * 10

# Difficulty multiplier
Easy: 1.0x
Medium: 1.5x
Hard: 2.0x

# Example: 12 correct answers on Medium quiz
XP = 12 * 10 * 1.5 = 180 XP
```

### Level Progression
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 220 XP (20% increase each level)
- And so on...

### Streaks
- Track daily quiz activity
- Maintain current streak
- Record longest streak

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python manage.py test
```

### Test API Endpoints
```bash
# Get categories
curl http://127.0.0.1:8000/api/categories/

# Get levels for category ID 1
curl http://127.0.0.1:8000/api/levels/?category_id=1
```

### Frontend Testing
```bash
cd frontend
npm run dev

# Open browser to http://localhost:5173
# Create account and take a quiz
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

**MongoDB connection error:**
```bash
# Ensure MongoDB is running
# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/quiz_management_db
```

**OpenAI API errors:**
- Verify API key is correct
- Check account has credits
- See error details in terminal

### Frontend Issues

**Dependencies not installing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Check CORS settings in `backend/quiz_backend/settings.py`
- Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 3 minutes
- **[SETUP_AND_TEST_GUIDE.md](SETUP_AND_TEST_GUIDE.md)** - Comprehensive setup guide
- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** - Technical architecture details
- **[HARDCODED_QUESTIONS_REFERENCE.md](HARDCODED_QUESTIONS_REFERENCE.md)** - Complete question bank
- **[backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - API reference
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Frontend integration

---

## 🚀 Deployment

### Backend (Django)

**Option 1: Heroku**
```bash
heroku create your-quiz-backend
heroku addons:create mongolab
git push heroku main
```

**Option 2: DigitalOcean/AWS**
- Set up Ubuntu server
- Install Python, MongoDB
- Use Gunicorn + Nginx
- Configure environment variables

### Frontend (React)

**Option 1: Vercel**
```bash
cd frontend
vercel deploy
```

**Option 2: Netlify**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables for Production

```env
# Backend .env
DEBUG=False
ALLOWED_HOSTS=your-domain.com
OPENAI_API_KEY=your-production-key
SECRET_KEY=your-strong-secret-key
MONGODB_URI=your-production-mongodb-uri
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- **OpenAI** - For GPT-3.5 Turbo API
- **Django** - For the robust backend framework
- **React** - For the powerful frontend library
- **Tailwind CSS** - For beautiful styling
- **Framer Motion** - For smooth animations
- **shadcn/ui** - For elegant UI components

---

## 📞 Support

For issues, questions, or suggestions:

- **Issues:** Open an issue on GitHub
- **Email:** your-email@example.com
- **Documentation:** See the docs folder

---

## 🎓 Educational Use

This project is perfect for:
- Learning full-stack development
- Understanding REST APIs
- Practicing React + TypeScript
- Exploring AI integration
- Building production-ready applications

---

## 🔮 Future Enhancements

- [ ] Add more question categories
- [ ] Implement real-time multiplayer quizzes
- [ ] Add video explanations for answers
- [ ] Create mobile apps (React Native)
- [ ] Add social features (share scores)
- [ ] Implement advanced analytics dashboard
- [ ] Add certificate generation
- [ ] Create study mode with flashcards
- [ ] Implement adaptive difficulty (AI adjusts based on performance)

---

## 📈 Project Stats

- **Backend Code:** ~3,000 lines
- **Frontend Code:** ~2,500 lines
- **API Endpoints:** 15+
- **Database Models:** 10+
- **Hardcoded Questions:** 110+
- **Supported Subjects:** 17+
- **Categories:** 3
- **Levels:** 6

---

**⭐ If you found this project helpful, please give it a star!**

---

**Built with ❤️ using Django, React, and OpenAI**

**Last Updated:** December 16, 2025
