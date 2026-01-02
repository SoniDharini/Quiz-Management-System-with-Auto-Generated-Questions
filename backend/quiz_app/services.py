from django.utils import timezone
from .models import Achievement, UserAchievement, UserProfile, QuizAttempt

def check_achievements(user, event_type, context=None):
    """
    Evaluate achievements for a user based on an event.
    
    Args:
        user: The User instance
        event_type: String identifier for the event (e.g., 'quiz_completed', 'streak_updated')
        context: Dictionary containing additional data (e.g., {'attempt': attempt_instance})
    """
    if context is None:
        context = {}
        
    profile = user.profile
    
    # 1. Fetch relevant achievements based on event_type to optimize
    # For simplicity, we might fetch all relevant criteria types
    # or mapp event_type to criteria_type.
    
    criteria_map = {
        'quiz_completed': ['quizzes_taken', 'perfect_score', 'fast_quiz'],
        'streak_updated': ['streak_days'],
        'quiz_created': ['quizzes_created'],
        'level_updated': ['level_reached']
    }
    
    relevant_criteria = criteria_map.get(event_type, [])
    if not relevant_criteria:
        return

    # Fetch locked achievements with these criteria
    # We exclude achievements the user already has
    existing_achievement_ids = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
    
    potential_achievements = Achievement.objects.filter(
        criteria_type__in=relevant_criteria
    ).exclude(id__in=existing_achievement_ids)

    newly_unlocked = []

    for achievement in potential_achievements:
        is_unlocked = False
        
        if achievement.criteria_type == 'quizzes_taken':
            if profile.total_quizzes_taken >= achievement.criteria_value:
                is_unlocked = True
                
        elif achievement.criteria_type == 'streak_days':
            # Check current streak or longest streak? "Maintain a X-day streak" usually implies touching it once.
            # We'll check both to be safe/generous, but usually it's current or longest.
            if profile.current_streak >= achievement.criteria_value or profile.longest_streak >= achievement.criteria_value:
                is_unlocked = True
                
        elif achievement.criteria_type == 'perfect_score':
            # Check if this specific attempt was perfect
            attempt = context.get('attempt')
            if attempt and attempt.score_percentage == 100:
                is_unlocked = True
            # OR check if user has ANY perfect score in history (if we track count in profile, but we don't explicitly yet)
            # For now, 'Perfect Score' triggers on the event of getting one.
            # If user already got one before this system, this might not catch it unless valid history check.
            # But prompt says "unlock when user scores 100% on any quiz", implying the action trigger.
                
        elif achievement.criteria_type == 'quizzes_created':
            if profile.total_quizzes_created >= achievement.criteria_value:
                is_unlocked = True
                
        elif achievement.criteria_type == 'fast_quiz':
            attempt = context.get('attempt')
            if attempt and attempt.time_taken and attempt.time_taken <= achievement.criteria_value:
                # Also ensure it's a real quiz, e.g. min 5 questions
                if attempt.total_questions >= 5:
                    is_unlocked = True

        elif achievement.criteria_type == 'level_reached':
            if profile.level >= achievement.criteria_value:
                is_unlocked = True

        if is_unlocked:
            UserAchievement.objects.create(user=user, achievement=achievement)
            newly_unlocked.append(achievement)
            
            # Award XP for the achievement itself?
            # UserProfile has add_xp method.
            if achievement.xp_reward > 0:
                profile.add_xp(achievement.xp_reward)

    return newly_unlocked
