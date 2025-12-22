from django.core.management.base import BaseCommand
from quiz_app.models import Category, Level, Subject, Achievement


class Command(BaseCommand):
    help = 'Populate initial categories, levels, subjects, and achievements'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating initial data...')
        
        # Create Categories
        categories_data = [
            {
                'name': 'Academics',
                'description': 'Study materials for 10th and 12th grade students',
                'icon': 'GraduationCap',
                'color': 'from-blue-400 to-blue-600'
            },
            {
                'name': 'Computer Science',
                'description': 'Core CS topics and programming concepts',
                'icon': 'Code2',
                'color': 'from-purple-400 to-purple-600'
            },
            {
                'name': 'Government Exams',
                'description': 'Preparation for competitive government exams',
                'icon': 'Briefcase',
                'color': 'from-green-400 to-green-600'
            },
        ]
        
        # Create categories using try/except for MongoDB compatibility
        for cat_data in categories_data:
            try:
                category = Category.objects.get(name=cat_data['name'])
                self.stdout.write(f'Category already exists: {category.name}')
            except Category.DoesNotExist:
                category = Category(
                    name=cat_data['name'],
                    description=cat_data['description'],
                    icon=cat_data['icon'],
                    color=cat_data['color']
                )
                category.save()
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
        
        # Re-fetch categories to get proper IDs for MongoDB
        academics = Category.objects.get(name='Academics')
        cse = Category.objects.get(name='Computer Science')
        govt = Category.objects.get(name='Government Exams')
        
        # Create Levels and Subjects for Academics
        academic_levels = [
            {
                'name': '10th Grade',
                'subjects': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Social Science']
            },
            {
                'name': '12th Grade',
                'subjects': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science']
            },
        ]
        
        for level_data in academic_levels:
            try:
                level = Level.objects.get(name=level_data['name'], category_id=academics.id)
                self.stdout.write(f'Level already exists: {level.name}')
            except Level.DoesNotExist:
                level = Level(
                    name=level_data['name'],
                    category_id=academics.id,
                    description=f"{level_data['name']} academic subjects"
                )
                level.save()
                self.stdout.write(self.style.SUCCESS(f'Created level: {level.name}'))
            
            # Re-fetch level to get proper ID
            level = Level.objects.get(name=level_data['name'], category_id=academics.id)
            
            for subject_name in level_data['subjects']:
                try:
                    subject = Subject.objects.get(name=subject_name, level_id=level.id)
                    self.stdout.write(f'  Subject already exists: {subject.name}')
                except Subject.DoesNotExist:
                    subject = Subject(
                        name=subject_name,
                        level_id=level.id,
                        description=f"{subject_name} for {level_data['name']}"
                    )
                    subject.save()
                    self.stdout.write(self.style.SUCCESS(f'  Created subject: {subject.name}'))
        
        # Create Levels and Subjects for Computer Science
        cse_levels = [
            {
                'name': 'Core Subjects',
                'subjects': ['Data Structures', 'Algorithms', 'Database Management', 'Operating Systems', 'Computer Networks', '.net']
            },
            {
                'name': 'Programming',
                'subjects': ['C/C++', 'Java', 'Python', 'Web Development', 'Object Oriented Programming']
            },
        ]
        
        for level_data in cse_levels:
            try:
                level = Level.objects.get(name=level_data['name'], category_id=cse.id)
                self.stdout.write(f'Level already exists: {level.name}')
            except Level.DoesNotExist:
                level = Level(
                    name=level_data['name'],
                    category_id=cse.id,
                    description=f"Computer Science {level_data['name']}"
                )
                level.save()
                self.stdout.write(self.style.SUCCESS(f'Created level: {level.name}'))
            
            # Re-fetch level to get proper ID
            level = Level.objects.get(name=level_data['name'], category_id=cse.id)
            
            for subject_name in level_data['subjects']:
                try:
                    subject = Subject.objects.get(name=subject_name, level_id=level.id)
                    self.stdout.write(f'  Subject already exists: {subject.name}')
                except Subject.DoesNotExist:
                    subject = Subject(
                        name=subject_name,
                        level_id=level.id,
                        description=f"{subject_name} concepts and applications"
                    )
                    subject.save()
                    self.stdout.write(self.style.SUCCESS(f'  Created subject: {subject.name}'))
        
        # Create Levels and Subjects for Government Exams
        govt_levels = [
            {
                'name': 'National Level',
                'subjects': ['UPSC Civil Services', 'SSC CGL', 'SSC CHSL', 'Railway Exams', 'Banking Exams']
            },
            {
                'name': 'State Level',
                'subjects': ['State PSC', 'Police Exams', 'Teaching Exams', 'Clerk Exams', 'Other State Exams']
            },
        ]
        
        for level_data in govt_levels:
            try:
                level = Level.objects.get(name=level_data['name'], category_id=govt.id)
                self.stdout.write(f'Level already exists: {level.name}')
            except Level.DoesNotExist:
                level = Level(
                    name=level_data['name'],
                    category_id=govt.id,
                    description=f"{level_data['name']} government examinations"
                )
                level.save()
                self.stdout.write(self.style.SUCCESS(f'Created level: {level.name}'))
            
            # Re-fetch level to get proper ID
            level = Level.objects.get(name=level_data['name'], category_id=govt.id)
            
            for subject_name in level_data['subjects']:
                try:
                    subject = Subject.objects.get(name=subject_name, level_id=level.id)
                    self.stdout.write(f'  Subject already exists: {subject.name}')
                except Subject.DoesNotExist:
                    subject = Subject(
                        name=subject_name,
                        level_id=level.id,
                        description=f"Preparation for {subject_name}"
                    )
                    subject.save()
                    self.stdout.write(self.style.SUCCESS(f'  Created subject: {subject.name}'))
        
        # Create Achievements
        achievements_data = [
            {
                'title': 'First Steps',
                'description': 'Complete your first quiz',
                'icon': 'Award',
                'color': 'from-blue-400 to-blue-600',
                'xp_reward': 50,
                'criteria_type': 'quizzes_taken',
                'criteria_value': 1
            },
            {
                'title': 'Week Warrior',
                'description': '7-day streak',
                'icon': 'Target',
                'color': 'from-orange-400 to-orange-600',
                'xp_reward': 100,
                'criteria_type': 'streak_days',
                'criteria_value': 7
            },
            {
                'title': 'Knowledge Seeker',
                'description': 'Take 25 quizzes',
                'icon': 'Brain',
                'color': 'from-purple-400 to-purple-600',
                'xp_reward': 200,
                'criteria_type': 'quizzes_taken',
                'criteria_value': 25
            },
            {
                'title': 'Perfect Score',
                'description': 'Score 100% on a quiz',
                'icon': 'Trophy',
                'color': 'from-green-400 to-green-600',
                'xp_reward': 150,
                'criteria_type': 'perfect_score',
                'criteria_value': 1
            },
            {
                'title': 'Quiz Master',
                'description': 'Create 10 quizzes',
                'icon': 'Trophy',
                'color': 'from-yellow-400 to-yellow-600',
                'xp_reward': 250,
                'criteria_type': 'quizzes_created',
                'criteria_value': 10
            },
            {
                'title': 'Speed Demon',
                'description': 'Complete quiz in record time',
                'icon': 'Zap',
                'color': 'from-cyan-400 to-cyan-600',
                'xp_reward': 100,
                'criteria_type': 'speed_record',
                'criteria_value': 1
            },
            {
                'title': 'Consistent Learner',
                'description': '30-day streak',
                'icon': 'Trophy',
                'color': 'from-indigo-400 to-indigo-600',
                'xp_reward': 500,
                'criteria_type': 'streak_days',
                'criteria_value': 30
            },
            {
                'title': 'Champion',
                'description': 'Reach level 10',
                'icon': 'Crown',
                'color': 'from-pink-400 to-pink-600',
                'xp_reward': 1000,
                'criteria_type': 'user_level',
                'criteria_value': 10
            },
        ]
        
        for achievement_data in achievements_data:
            try:
                achievement = Achievement.objects.get(title=achievement_data['title'])
                self.stdout.write(f'Achievement already exists: {achievement.title}')
            except Achievement.DoesNotExist:
                achievement = Achievement(
                    title=achievement_data['title'],
                    description=achievement_data['description'],
                    icon=achievement_data['icon'],
                    color=achievement_data['color'],
                    xp_reward=achievement_data['xp_reward'],
                    criteria_type=achievement_data['criteria_type'],
                    criteria_value=achievement_data['criteria_value']
                )
                achievement.save()
                self.stdout.write(self.style.SUCCESS(f'Created achievement: {achievement.title}'))
        
        self.stdout.write(self.style.SUCCESS('Initial data populated successfully!'))
