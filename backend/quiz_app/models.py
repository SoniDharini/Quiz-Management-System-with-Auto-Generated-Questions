from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

# Category Hierarchy Models
class Category(models.Model):
    """Top-level quiz category (e.g., Academics, Computer Science, Government Exams)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Level(models.Model):
    """Sub-category within a category (e.g., Programming, Core Subjects)"""
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='levels')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']
        unique_together = ['category', 'name']

    def __str__(self):
        return f"{self.category.name} - {self.name}"

class Subject(models.Model):
    """Specific subject within a level (e.g., Data Structures, Python)"""
    name = models.CharField(max_length=100)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='subjects')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['level', 'name']
        unique_together = ['level', 'name']

    def __str__(self):
        return f"{self.level.category.name} - {self.level.name} - {self.name}"

# User Profile Extension
class UserProfile(models.Model):
    """Extended user profile with additional information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    category_preference = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    
    # Gamification fields
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    xp_to_next_level = models.IntegerField(default=100)
    total_quizzes_taken = models.IntegerField(default=0)
    total_quizzes_created = models.IntegerField(default=0)
    total_correct_answers = models.IntegerField(default=0)
    total_questions_answered = models.IntegerField(default=0)
    
    # Streak tracking
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_quiz_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    @property
    def average_score(self):
        """Calculate average score from all quiz attempts"""
        attempts = self.user.quiz_attempts.all()
        if not attempts:
            return 0
        total_score = sum(attempt.score_percentage for attempt in attempts)
        return round(total_score / len(attempts), 1)

    def update_streak(self, today=None):
        """
        Update the user's streak based on the last activity date.
        This method should be called *after* a quiz is taken.
        """
        if today is None:
            today = timezone.now().date()

        self.streak_was_just_reset = False
        if self.last_quiz_date:
            days_diff = (today - self.last_quiz_date).days
            if days_diff == 1:
                # Consecutive day
                self.current_streak += 1
            elif days_diff > 1:
                # Streak broken, new streak starts
                self.current_streak = 1
                self.streak_was_just_reset = True
            # If days_diff is 0, it means another quiz on the same day. Do nothing.
        else:
            # First quiz ever
            self.current_streak = 1
            self.streak_was_just_reset = True

        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.last_quiz_date = today
        self.save()

    def check_streak(self, today=None):
        """
        Check if the streak is broken and reset it if necessary.
        This method should be called when fetching user profile, before taking a quiz.
        """
        if today is None:
            today = timezone.now().date()
        
        if self.last_quiz_date:
            days_diff = (today - self.last_quiz_date).days
            if days_diff > 1:
                self.current_streak = 0
                self.save()

    def add_xp(self, xp_amount):
        """Add XP and handle level ups"""
        self.xp += xp_amount
        while self.xp >= self.xp_to_next_level:
            self.xp -= self.xp_to_next_level
            self.level += 1
            self.xp_to_next_level = int(self.xp_to_next_level * 1.2)  # 20% increase
        self.save()

# Quiz Configuration Models
class QuizConfig(models.Model):
    """Stores user's quiz configuration for AI generation"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_configs')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    number_of_questions = models.IntegerField(validators=[MinValueValidator(5), MaxValueValidator(100)])
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.subject.name} ({self.difficulty})"

# Quiz Models
class Quiz(models.Model):
    """Main quiz model"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    QUIZ_TYPE_CHOICES = [
        ('ai_generated', 'AI Generated'),
        ('manual', 'Manual'),
        ('file_upload', 'File Upload'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='quizzes')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='quizzes')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='quizzes')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPE_CHOICES, default='ai_generated')
    
    # File upload for create quiz
    uploaded_file = models.FileField(upload_to='quiz_materials/', null=True, blank=True)
    
    is_ai_generated = models.BooleanField(default=True)
    is_published = models.BooleanField(default=True)
    is_temporary = models.BooleanField(default=False)
    time_limit = models.IntegerField(null=True, blank=True, help_text="Time limit in seconds")
    popularity_score = models.IntegerField(default=0)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Quizzes"

    def __str__(self):
        return self.title

    @property
    def total_questions(self):
        return self.questions.count()

    @property
    def total_attempts(self):
        return self.attempts.count()

class Question(models.Model):
    """Quiz question model"""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    options = models.JSONField(help_text="List of 4 options")
    correct_answer = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(3)], 
                                        help_text="Index of correct option (0-3)")
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['quiz', 'order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"

# Quiz Attempt Models
class QuizAttempt(models.Model):
    """User's attempt at a quiz"""
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken = models.IntegerField(null=True, blank=True, help_text="Time taken in seconds")
    
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField(default=0)
    score_percentage = models.FloatField(default=0.0)
    
    xp_earned = models.IntegerField(default=0)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} ({self.status})"

    def calculate_score(self):
        """Calculate and update score based on answers"""
        correct = self.answers.filter(is_correct=True).count()
        self.correct_answers = correct
        self.total_questions = self.quiz.total_questions
        self.score_percentage = (correct / self.total_questions * 100) if self.total_questions > 0 else 0
        self.score = correct
        
        # Calculate XP (base 10 per correct answer, bonus for difficulty)
        base_xp = correct * 10
        if self.quiz.difficulty == 'easy':
            multiplier = 1.0
        elif self.quiz.difficulty == 'medium':
            multiplier = 1.5
        else:  # hard
            multiplier = 2.0
        
        self.xp_earned = int(base_xp * multiplier)
        self.save()

class Answer(models.Model):
    """User's answer to a specific question"""
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(3)])
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['attempt', 'question']
        ordering = ['answered_at']

    def __str__(self):
        return f"{self.attempt.user.username} - Q{self.question.order}"

    def save(self, *args, **kwargs):
        # Check if answer is correct
        self.is_correct = (self.selected_option == self.question.correct_answer)
        super().save(*args, **kwargs)

# Achievement System
class Achievement(models.Model):
    """Predefined achievements users can unlock"""
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    xp_reward = models.IntegerField(default=0)
    
    # Achievement criteria
    criteria_type = models.CharField(max_length=50, help_text="e.g., streak_days, quizzes_taken, perfect_score")
    criteria_value = models.IntegerField(help_text="Value to achieve")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class UserAchievement(models.Model):
    """Tracks which achievements users have unlocked"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.user.username} - {self.achievement.title}"

# Analytics Model
class QuizAnalytics(models.Model):
    """Aggregate analytics for a user"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    
    # Quiz statistics
    total_quizzes_taken = models.IntegerField(default=0)
    total_quizzes_created = models.IntegerField(default=0)
    total_questions_answered = models.IntegerField(default=0)
    total_correct_answers = models.IntegerField(default=0)
    
    # Performance by difficulty
    easy_quizzes_taken = models.IntegerField(default=0)
    medium_quizzes_taken = models.IntegerField(default=0)
    hard_quizzes_taken = models.IntegerField(default=0)
    
    # Category performance (stored as JSON)
    category_stats = models.JSONField(default=dict, blank=True)
    
    # Time statistics
    total_time_spent = models.IntegerField(default=0, help_text="Total time in seconds")
    average_quiz_time = models.IntegerField(default=0, help_text="Average time per quiz in seconds")
    
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s analytics"

    @property
    def overall_accuracy(self):
        if self.total_questions_answered == 0:
            return 0
        return round((self.total_correct_answers / self.total_questions_answered) * 100, 1)

