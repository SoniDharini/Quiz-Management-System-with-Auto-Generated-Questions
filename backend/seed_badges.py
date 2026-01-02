
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_backend.settings')
django.setup()

from quiz_app.models import Achievement

BADGES = [
    {
        "title": "First Steps",
        "description": "Complete your first quiz",
        "icon": "Award",
        "color": "from-blue-400 to-blue-600",
        "xp_reward": 50,
        "criteria_type": "quizzes_taken",
        "criteria_value": 1
    },
    {
        "title": "Week Warrior",
        "description": "Maintain a 7-day quiz streak",
        "icon": "Target",
        "color": "from-orange-400 to-orange-600",
        "xp_reward": 200,
        "criteria_type": "streak_days",
        "criteria_value": 7
    },
    {
        "title": "Knowledge Seeker",
        "description": "Complete 25 quizzes",
        "icon": "Brain",
        "color": "from-purple-400 to-purple-600",
        "xp_reward": 500,
        "criteria_type": "quizzes_taken",
        "criteria_value": 25
    },
    {
        "title": "Perfect Score",
        "description": "Score 100% on any quiz",
        "icon": "Trophy",
        "color": "from-green-400 to-green-600",
        "xp_reward": 100,
        "criteria_type": "perfect_score",
        "criteria_value": 1
    },
    {
        "title": "Quiz Master",
        "description": "Create 10 quizzes",
        "icon": "Trophy",
        "color": "from-yellow-400 to-yellow-600",
        "xp_reward": 300,
        "criteria_type": "quizzes_created",
        "criteria_value": 10
    },
    {
        "title": "Speed Demon",
        "description": "Complete a quiz in under 60 seconds (min 5 questions)",
        "icon": "Zap",
        "color": "from-cyan-400 to-cyan-600",
        "xp_reward": 150,
        "criteria_type": "fast_quiz",
        "criteria_value": 60 # seconds
    },
    {
        "title": "Consistent Learner",
        "description": "Maintain a 30-day quiz streak",
        "icon": "Trophy",
        "color": "from-indigo-400 to-indigo-600",
        "xp_reward": 1000,
        "criteria_type": "streak_days",
        "criteria_value": 30
    },
    {
        "title": "Champion",
        "description": "Reach level 10",
        "icon": "Crown",
        "color": "from-pink-400 to-pink-600",
        "xp_reward": 2000,
        "criteria_type": "level_reached",
        "criteria_value": 10
    }
]

def seed_badges():
    print("Seeding achievements...")
    created_count = 0
    updated_count = 0
    
    for badge_data in BADGES:
        obj, created = Achievement.objects.update_or_create(
            title=badge_data['title'],
            defaults=badge_data
        )
        if created:
            created_count += 1
            print(f"Created: {badge_data['title']}")
        else:
            updated_count += 1
            print(f"Updated: {badge_data['title']}")
            
    print(f"\nDone! Created: {created_count}, Updated: {updated_count}")

if __name__ == "__main__":
    seed_badges()
