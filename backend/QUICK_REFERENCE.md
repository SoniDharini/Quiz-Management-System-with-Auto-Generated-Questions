# Quick Reference - Backend Commands

## 🚀 Setup Commands

```bash
# First time setup
cd backend
setup.bat

# Manual setup
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py populate_data
```

## 🏃 Running the Server

```bash
# Activate virtual environment (always do this first)
venv\Scripts\activate

# Run development server
python manage.py runserver

# Run on specific port
python manage.py runserver 8080

# Run on all interfaces
python manage.py runserver 0.0.0.0:8000
```

## 👤 User Management

```bash
# Create superuser (admin)
python manage.py createsuperuser

# Change user password
python manage.py changepassword <username>
```

## 🗄️ Database Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Reset database (DANGEROUS!)
python manage.py flush

# Populate initial data
python manage.py populate_data
```

## 🔍 Django Shell

```bash
# Open Django shell
python manage.py shell

# Example commands in shell:
from quiz_app.models import Category, Quiz, UserProfile
from django.contrib.auth.models import User

# Get all categories
categories = Category.objects.all()

# Get user
user = User.objects.get(username='john_doe')

# Get user profile
profile = user.profile

# Create category
cat = Category.objects.create(name='Test', description='Test category')
```

## 📊 Admin Panel

```bash
# Access at: http://localhost:8000/admin
# Login with superuser credentials
```

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test quiz_app

# Run with verbosity
python manage.py test --verbosity=2
```

## 🔧 Utility Commands

```bash
# Check for problems
python manage.py check

# Collect static files
python manage.py collectstatic

# Create app
python manage.py startapp <app_name>

# Show installed apps
python manage.py showmigrations
```

## 📝 Environment Variables

```bash
# Edit .env file with:
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=mongodb://localhost:27017/quiz_management_db
DEBUG=True
```

## 🔌 API Testing with curl

```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"pass123\",\"password2\":\"pass123\"}"

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"pass123\"}"

# Get categories (public)
curl http://localhost:8000/api/categories/

# Get profile (authenticated)
curl http://localhost:8000/api/user/profile/ \
  -H "Authorization: Token <your-token>"
```

## 🐛 Debugging

```bash
# View recent logs
python manage.py runserver --verbosity=2

# Check database connection
python manage.py dbshell

# Inspect models
python manage.py inspectdb
```

## 📦 Package Management

```bash
# Install new package
pip install <package-name>

# Update requirements.txt
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt

# Update package
pip install --upgrade <package-name>
```

## 🔄 MongoDB Commands

```bash
# Using MongoDB Compass GUI
# Or MongoDB Shell:

# Show databases
show dbs

# Use database
use quiz_management_db

# Show collections
show collections

# Query collection
db.quiz_app_category.find()

# Drop collection
db.quiz_app_category.drop()
```

## ⚡ Quick Workflow

```bash
# Daily workflow
venv\Scripts\activate              # 1. Activate environment
python manage.py runserver         # 2. Start server

# After model changes
python manage.py makemigrations    # 1. Create migrations
python manage.py migrate           # 2. Apply migrations

# After code changes
# Just save - auto-reload in DEBUG mode
# Or restart server: Ctrl+C then runserver again
```

## 🆘 Troubleshooting

```bash
# MongoDB not running
# → Start MongoDB service or MongoDB Compass

# Port already in use
python manage.py runserver 8001    # Use different port

# Import errors
pip install -r requirements.txt    # Reinstall dependencies

# Migration conflicts
python manage.py migrate --fake    # Fake migration (careful!)

# Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +  # Linux/Mac
# Or manually delete __pycache__ folders on Windows
```

## 📱 Common API Endpoints

```
Authentication:
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/

Categories:
GET    /api/categories/
GET    /api/levels/?category=<name>
GET    /api/subjects/?level=<name>

Quiz:
POST   /api/quiz/config/
POST   /api/quiz/generate/
GET    /api/quizzes/
GET    /api/quizzes/<id>/take/
POST   /api/quiz/submit/

Profile:
GET    /api/user/profile/
PATCH  /api/user/profile/
GET    /api/user/analytics/
```

## 🎯 Production Checklist

```bash
# Before deployment:
□ Set DEBUG=False in .env
□ Change SECRET_KEY
□ Configure production database
□ Set ALLOWED_HOSTS
□ Configure CORS_ALLOWED_ORIGINS
□ Set up static files serving
□ Enable HTTPS
□ Set up logging
□ Configure email backend
□ Run security checks: python manage.py check --deploy
```

---

**Need help?** Check:
- README.md (setup guide)
- API_DOCUMENTATION.md (API reference)
- IMPLEMENTATION_SUMMARY.md (feature overview)
