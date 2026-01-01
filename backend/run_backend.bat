@echo off
echo Starting backend server...
call .venv\Scripts\activate.bat
python manage.py runserver
