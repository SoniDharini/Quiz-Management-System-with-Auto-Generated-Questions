@echo off
echo ============================================
echo Quiz Management System - Backend Setup
echo ============================================
echo.

echo Step 1: Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo Error: Failed to create virtual environment
    pause
    exit /b 1
)
echo Virtual environment created successfully!
echo.

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Step 3: Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo Step 4: Running migrations...
python manage.py makemigrations
python manage.py migrate
if errorlevel 1 (
    echo Error: Failed to run migrations
    pause
    exit /b 1
)
echo Migrations completed successfully!
echo.

echo Step 5: Populating initial data...
python manage.py populate_data
if errorlevel 1 (
    echo Warning: Failed to populate initial data
    echo You can run 'python manage.py populate_data' manually later
)
echo.

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo IMPORTANT: Before starting the server:
echo 1. Ensure MongoDB is running
echo 2. Update .env file with your OpenAI API key
echo 3. Update .env file with your MongoDB connection string
echo.
echo To start the server, run:
echo   python manage.py runserver
echo.
echo To create a superuser (admin), run:
echo   python manage.py createsuperuser
echo.
pause
