from django.urls import path
from .views import (
    # Authentication
    RegisterView, LoginView, LogoutView, ChangePasswordView,
    # Category Hierarchy
    CategoryListView, LevelListView, SubjectListView,
    # User Profile
    UserProfileView,
    # Quiz Configuration
    QuizConfigView,
    # Quiz Generation
    QuizGenerateView, QuizGenerateFromFileView,
    # Quiz Management
    RecommendedQuizzes, QuizListView, QuizDetailView, QuizTakeView,
    # Quiz Attempts
    QuizStartView, QuizSubmitView, QuizAttemptDetailView, UserQuizHistoryView,
    # Analytics
    UserAnalyticsView, RecentActivityView, UserPerformanceView,
    # Achievements
    AchievementListView, UserAchievementsView,
    # Leaderboard
    LeaderboardView,
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Category hierarchy endpoints
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('levels/', LevelListView.as_view(), name='level-list'),
    path('subjects/', SubjectListView.as_view(), name='subject-list'),
    
    # User profile endpoints
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Quiz configuration endpoints
    path('quiz/config/', QuizConfigView.as_view(), name='quiz-config'),
    
    # Quiz generation endpoints
    path('quiz/generate/', QuizGenerateView.as_view(), name='quiz-generate'),
    path('quiz/generate/file/', QuizGenerateFromFileView.as_view(), name='quiz-generate-file'),
    
    # Quiz management endpoints
    path('quizzes/recommended/', RecommendedQuizzes.as_view(), name='quiz-recommended'),
    path('quizzes/', QuizListView.as_view(), name='quiz-list'),
    path('quizzes/<int:quiz_id>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:quiz_id>/take/', QuizTakeView.as_view(), name='quiz-take'),
    
    # Quiz attempt endpoints
    path('quiz/start/', QuizStartView.as_view(), name='quiz-start'),
    path('quiz/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
    path('quiz/attempts/<int:attempt_id>/', QuizAttemptDetailView.as_view(), name='quiz-attempt-detail'),
    path('quiz/history/', UserQuizHistoryView.as_view(), name='quiz-history'),
    
    # Analytics endpoints
    path('user/analytics/', UserAnalyticsView.as_view(), name='user-analytics'),
    path('user/activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('user/performance/', UserPerformanceView.as_view(), name='user-performance'),
    
    # Achievement endpoints
    path('achievements/', AchievementListView.as_view(), name='achievement-list'),
    path('user/achievements/', UserAchievementsView.as_view(), name='user-achievements'),
    
    # Leaderboard endpoint
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]

