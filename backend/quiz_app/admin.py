from django.contrib import admin
from .models import (
    Category, Level, Subject, QuizConfig, Quiz, Question,
    QuizAttempt, Answer, UserProfile, Achievement, UserAchievement, QuizAnalytics
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at']
    list_filter = ['category']
    search_fields = ['name']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'level', 'created_at']
    list_filter = ['level__category', 'level']
    search_fields = ['name']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'xp', 'current_streak', 'total_quizzes_taken']
    list_filter = ['level']
    search_fields = ['user__username', 'user__email']

@admin.register(QuizConfig)
class QuizConfigAdmin(admin.ModelAdmin):
    list_display = ['user', 'subject', 'difficulty', 'number_of_questions', 'created_at']
    list_filter = ['difficulty', 'category', 'created_at']
    search_fields = ['user__username']

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'subject', 'difficulty', 'is_published', 'created_by', 'created_at']
    list_filter = ['difficulty', 'quiz_type', 'is_published', 'category', 'created_at']
    search_fields = ['title', 'created_by__username']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'question_text_short', 'correct_answer', 'order']
    list_filter = ['quiz']
    search_fields = ['question_text']
    
    def question_text_short(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Question'

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'status', 'score_percentage', 'xp_earned', 'completed_at']
    list_filter = ['status', 'quiz__difficulty', 'completed_at']
    search_fields = ['user__username', 'quiz__title']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['attempt', 'question', 'selected_option', 'is_correct', 'answered_at']
    list_filter = ['is_correct']
    search_fields = ['attempt__user__username']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'criteria_type', 'criteria_value', 'xp_reward']
    list_filter = ['criteria_type']
    search_fields = ['title']

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'unlocked_at']
    list_filter = ['achievement', 'unlocked_at']
    search_fields = ['user__username', 'achievement__title']

@admin.register(QuizAnalytics)
class QuizAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_quizzes_taken', 'total_correct_answers', 'overall_accuracy', 'last_updated']
    search_fields = ['user__username']
