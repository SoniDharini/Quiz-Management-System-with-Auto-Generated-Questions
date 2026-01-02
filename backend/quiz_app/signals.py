from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile, QuizAttempt, Quiz
from .services import check_achievements

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

@receiver(post_save, sender=QuizAttempt)
def quiz_attempt_handler(sender, instance, created, **kwargs):
    """
    Check for achievements when a quiz attempt is saved (completed).
    """
    if instance.status == 'completed':
        # Refresh profile to ensure stats (handled by other logic/signals) are visible
        instance.user.profile.refresh_from_db()
        check_achievements(instance.user, 'quiz_completed', {'attempt': instance})

@receiver(post_save, sender=UserProfile)
def user_profile_handler(sender, instance, created, **kwargs):
    """
    Check for achievements when profile stats change (streak, level).
    """
    # Avoid infinite recursion if check_achievements saves profile (it might adding XP)
    # But check_achievements only calls add_xp if badge is NEW.
    # And add_xp calls save(), triggering this again.
    # This is okay as long as check_achievements is idempotent and returns empty list next time.
    if not created:
        check_achievements(instance.user, 'streak_updated')
        check_achievements(instance.user, 'level_updated')

@receiver(post_save, sender=Quiz)
def quiz_created_handler(sender, instance, created, **kwargs):
    """
    Check for achievements when a quiz is created.
    """
    if created:
        user = instance.created_by
        check_achievements(user, 'quiz_created')
