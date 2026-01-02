from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    Category, Level, Subject, QuizConfig, Quiz, Question,
    QuizAttempt, Answer, UserProfile, Achievement, UserAchievement, QuizAnalytics
)

# User Serializers
class UserSerializer(serializers.ModelSerializer):
    """Serializer for user registration and basic info"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        # Create associated profile
        # UserProfile creation is handled by post_save signal
        QuizAnalytics.objects.create(user=user)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    average_score = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'full_name', 'profile_picture', 
            'category_preference', 'bio', 'level', 'xp', 'xp_to_next_level',
            'total_quizzes_taken', 'total_quizzes_created', 'total_correct_answers',
            'total_questions_answered', 'current_streak', 'longest_streak',
            'average_score', 'last_quiz_date', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'level', 'xp', 'xp_to_next_level', 'total_quizzes_taken',
            'total_quizzes_created', 'total_correct_answers', 'total_questions_answered',
            'current_streak', 'longest_streak', 'created_at', 'updated_at'
        ]

# Category Hierarchy Serializers
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'color', 'created_at']

class LevelSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Level
        fields = ['id', 'name', 'category', 'category_name', 'description', 'created_at']

class SubjectSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    category_name = serializers.CharField(source='level.category.name', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'level', 'level_name', 'category_name', 'description', 'created_at']

# Quiz Configuration Serializers
class QuizConfigSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = QuizConfig
        fields = [
            'id', 'user', 'category', 'category_name', 'level', 'level_name',
            'subject', 'subject_name', 'number_of_questions', 'difficulty', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

# Question and Quiz Serializers
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question_text', 'options', 'correct_answer', 'explanation', 'order', 'created_at']
        read_only_fields = ['created_at']

class QuestionWithoutAnswerSerializer(serializers.ModelSerializer):
    """Question serializer without correct_answer for taking quizzes"""
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'options', 'order']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    total_questions = serializers.ReadOnlyField()
    total_attempts = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'category', 'category_name', 
            'level', 'level_name', 'subject', 'subject_name', 'difficulty',
            'quiz_type', 'uploaded_file', 'is_ai_generated', 'is_published',
            'time_limit', 'created_by', 'created_by_username', 'created_at',
            'updated_at', 'questions', 'total_questions', 'total_attempts'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class QuizListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for quiz lists"""
    category_details = CategorySerializer(source='category', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    total_questions = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'category_details', 'level_name', 'subject_name',
            'difficulty', 'quiz_type', 'is_published', 'created_by_username',
            'created_at', 'total_questions'
        ]

class QuizTakeSerializer(serializers.ModelSerializer):
    """Serializer for taking a quiz (questions without answers)"""
    questions = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'category', 'level', 'subject', 
            'category_name', 'subject_name', 'difficulty', 'time_limit', 'questions'
        ]
    
    def get_questions(self, obj):
        # Check if a custom (e.g., shuffled) question list is passed in the context
        if hasattr(obj, 'questions_for_serializer'):
            return QuestionWithoutAnswerSerializer(obj.questions_for_serializer, many=True).data
        # Fallback to the default ordered questions
        return QuestionWithoutAnswerSerializer(obj.questions.all(), many=True).data

class QuestionResultSerializer(serializers.ModelSerializer):
    """Question serializer with correct_answer for quiz results"""
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'options', 'correct_answer', 'explanation']

class QuizResultSerializer(serializers.ModelSerializer):
    """Serializer for quiz results, including questions with answers"""
    questions = QuestionResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'questions']

# Quiz Attempt Serializers
class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'attempt', 'question', 'question_text', 'selected_option', 'is_correct', 'answered_at']
        read_only_fields = ['is_correct', 'answered_at']

class AnswerSubmitSerializer(serializers.Serializer):
    """Serializer for submitting quiz answers"""
    question_id = serializers.IntegerField()
    selected_option = serializers.IntegerField(min_value=0, max_value=3)

class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    formatted_score_percentage = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'user', 'user_username', 'quiz', 'quiz_title', 'status',
            'started_at', 'completed_at', 'time_taken', 'score', 'total_questions',
            'correct_answers', 'xp_earned', 'answers', 'score_percentage', 'formatted_score_percentage'
        ]
        read_only_fields = [
            'user', 'started_at', 'completed_at', 'score', 'correct_answers',
            'xp_earned'
        ]

    def get_formatted_score_percentage(self, obj):
        return f"{obj.score_percentage:.1f}%"

class QuizSubmitSerializer(serializers.Serializer):
    """Serializer for quiz submission"""
    attempt_id = serializers.IntegerField()
    answers = AnswerSubmitSerializer(many=True)
    time_taken = serializers.IntegerField(required=False)

# Achievement Serializers
class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'title', 'description', 'icon', 'color', 'xp_reward', 'criteria_type', 'criteria_value', 'created_at']

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement_details = AchievementSerializer(source='achievement', read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['id', 'user', 'achievement', 'achievement_details', 'unlocked_at']
        read_only_fields = ['unlocked_at']

# Analytics Serializers
class QuizAnalyticsSerializer(serializers.ModelSerializer):
    overall_accuracy = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = QuizAnalytics
        fields = [
            'id', 'user', 'username', 'total_quizzes_taken', 'total_quizzes_created',
            'total_questions_answered', 'total_correct_answers', 'easy_quizzes_taken',
            'medium_quizzes_taken', 'hard_quizzes_taken', 'category_stats',
            'total_time_spent', 'average_quiz_time', 'overall_accuracy', 'last_updated'
        ]
        read_only_fields = ['last_updated']

# Recent Activity Serializer
class RecentActivitySerializer(serializers.Serializer):
    """Serializer for recent user activity"""
    id = serializers.CharField()
    type = serializers.CharField()
    title = serializers.CharField()
    score = serializers.FloatField(required=False)
    date = serializers.CharField()
    xp = serializers.IntegerField()
    category = serializers.CharField(required=False)
    topic = serializers.CharField(required=False, source='subject')

