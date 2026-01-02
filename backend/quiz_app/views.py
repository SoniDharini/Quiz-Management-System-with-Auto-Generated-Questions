import random
import json
import io
import traceback
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q, Count, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.parsers import MultiPartParser, FormParser
from openai import OpenAI

from .models import (
    Category, Level, Subject, QuizConfig, Quiz, Question,
    QuizAttempt, Answer, UserProfile, Achievement, UserAchievement, QuizAnalytics
)
from .serializers import (
    CategorySerializer, LevelSerializer, SubjectSerializer, QuizConfigSerializer,
    QuizSerializer, QuizListSerializer, QuizTakeSerializer, QuestionSerializer,
    UserSerializer, UserProfileSerializer, QuizAttemptSerializer, AnswerSerializer,
    QuizSubmitSerializer, AchievementSerializer, UserAchievementSerializer,
    QuizAnalyticsSerializer, RecentActivitySerializer, QuizResultSerializer
)

# Configure OpenAI client lazily to avoid initialization errors
_openai_client = None

def get_openai_client():
    """Lazy initialization of OpenAI client"""
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _openai_client


def extract_text_from_file(file):
    """Extract text content from uploaded files (PDF, DOCX, TXT)"""
    filename = file.name.lower()
    content = ""
    
    print(f"DEBUG extract_text_from_file: Processing file '{file.name}'")
    print(f"DEBUG extract_text_from_file: File size: {file.size} bytes")
    
    try:
        if filename.endswith('.pdf'):
            # Handle PDF files
            print("DEBUG: Processing as PDF")
            try:
                from PyPDF2 import PdfReader
                pdf_reader = PdfReader(io.BytesIO(file.read()))
                for page in pdf_reader.pages:
                    content += page.extract_text() or ""
            except ImportError:
                raise ValueError("PDF support not installed. Run: pip install PyPDF2")
        
        elif filename.endswith('.docx'):
            # Handle Word documents
            print("DEBUG: Processing as DOCX")
            try:
                from docx import Document
                doc = Document(io.BytesIO(file.read()))
                for para in doc.paragraphs:
                    content += para.text + "\n"
            except ImportError:
                raise ValueError("DOCX support not installed. Run: pip install python-docx")
        
        elif filename.endswith('.doc'):
            raise ValueError("Legacy .doc files are not supported. Please convert to .docx or .pdf")
        
        elif filename.endswith('.txt'):
            # Handle text files
            print("DEBUG: Processing as TXT")
            content = file.read().decode('utf-8')
            print(f"DEBUG: TXT file content length: {len(content)}")
        
        else:
            # Try to read as text
            print("DEBUG: Attempting to process as generic text")
            content = file.read().decode('utf-8')
        
        # Reset file pointer for saving
        file.seek(0)
        
        # Limit content length for API
        final_content = content[:5000] if content else ""
        print(f"DEBUG: Final content length: {len(final_content)}")
        return final_content
    
    except UnicodeDecodeError:
        raise ValueError("Unable to read file. Please ensure it's a valid text, PDF, or DOCX file.")
    except Exception as e:
        print(f"DEBUG: Exception in extract_text_from_file: {e}")
        import traceback
        traceback.print_exc()
        raise ValueError(f"Error reading file: {str(e)}")

# ==================== AUTHENTICATION VIEWS ====================

class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username,
                'email': user.email,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(ObtainAuthToken):
    """User login endpoint"""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Update user profile activity
        profile = user.profile
        profile.check_streak()
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'level': profile.level,
            'xp': profile.xp
        })

class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    """Change user password endpoint"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        # Validate inputs
        if not old_password or not new_password or not confirm_password:
            return Response(
                {'error': 'All fields (old_password, new_password, confirm_password) are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if old password is correct
        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new passwords match
        if new_password != confirm_password:
            return Response(
                {'error': 'New password and confirm password do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new password is same as old
        if user.check_password(new_password):
            return Response(
                {'error': 'New password must be different from old password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password strength (minimum 8 characters)
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Delete existing token to force re-login
        user.auth_token.delete()
        
        return Response({
            'message': 'Password changed successfully. Please login again.',
            'status': 'success'
        }, status=status.HTTP_200_OK)

# ==================== CATEGORY HIERARCHY VIEWS ====================

class CategoryListView(APIView):
    """List all categories"""
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class LevelListView(APIView):
    """List levels by category"""
    permission_classes = [AllowAny]

    def get(self, request):
        category_name = request.query_params.get('category')
        category_id = request.query_params.get('category_id')
        
        if category_id:
            levels = Level.objects.filter(category_id=category_id)
        elif category_name:
            try:
                category = Category.objects.get(name=category_name)
                levels = Level.objects.filter(category=category)
            except Category.DoesNotExist:
                return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            levels = Level.objects.all()
        
        serializer = LevelSerializer(levels, many=True)
        return Response(serializer.data)

class SubjectListView(APIView):
    """List subjects by level"""
    permission_classes = [AllowAny]

    def get(self, request):
        level_name = request.query_params.get('level')
        level_id = request.query_params.get('level_id')
        
        if level_id:
            subjects = Subject.objects.filter(level_id=level_id)
        elif level_name:
            try:
                level = Level.objects.get(name=level_name)
                subjects = Subject.objects.filter(level=level)
            except Level.DoesNotExist:
                return Response({'error': 'Level not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            subjects = Subject.objects.all()
        
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

# ==================== USER PROFILE VIEWS ====================

class UserProfileView(APIView):
    """Get and update user profile"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        try:
            profile = request.user.profile
            profile.check_streak()
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Create profile if doesn't exist
            profile = UserProfile.objects.create(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)

    def patch(self, request):
        profile = request.user.profile
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==================== QUIZ CONFIGURATION VIEWS ====================

class QuizConfigView(APIView):
    """Create and retrieve quiz configurations"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Accept both id and name for category, level, subject
        data = request.data.copy()
        
        # Handle category
        if 'category' in data and isinstance(data['category'], str):
            try:
                category = Category.objects.get(name=data['category'])
                data['category'] = category.id
            except Category.DoesNotExist:
                return Response({'error': f'Category "{data["category"]}" not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle level
        if 'level' in data and isinstance(data['level'], str):
            try:
                level = Level.objects.get(name=data['level'])
                data['level'] = level.id
            except Level.DoesNotExist:
                return Response({'error': f'Level "{data["level"]}" not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle subject
        if 'subject' in data and isinstance(data['subject'], str):
            try:
                subject = Subject.objects.get(name=data['subject'])
                data['subject'] = subject.id
            except Subject.DoesNotExist:
                return Response({'error': f'Subject "{data["subject"]}" not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = QuizConfigSerializer(data=data)
        if serializer.is_valid():
            config = serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        configs = QuizConfig.objects.filter(user=request.user)
        serializer = QuizConfigSerializer(configs, many=True)
        return Response(serializer.data)

# ==================== AI QUIZ GENERATION VIEWS ====================

# ... (imports)

# Define topic constraints for Class 10 Mathematics
TOPIC_MAP = {
    "Academics": {
        "10th Grade": {
            "Mathematics": {
                "easy": [
                    "Real Numbers: Euclid Division Lemma basics",
                    "Real Numbers: HCF and LCM, Terminating decimals",
                    "Polynomials: Factorization, Zeros of quadratic polynomials",
                    "Polynomials: Basic identity relations",
                    "Linear Equations: Graphical solutions, Substitution & elimination methods",
                    "Quadratic Equations: Factorization, Middle term splitting",
                    "Arithmetic Progressions: nth term, Sum of first n terms",
                    "Geometry: Basic Proportionality Theorem, Similarity, Basic angle properties",
                    "Coordinate Geometry: Distance formula, Midpoint formula",
                    "Trigonometry: Trigonometric ratios (0°–90°), Identity proofs",
                    "Circles: Tangent theorem, Properties of tangents",
                    "Statistics: Mean of ungrouped data, Frequency distribution (basic)",
                    "Linear Equations: Substitution method (easy)",
                    "Coordinate Geometry: Midpoint and section formula",
                    "Triangles: Area of triangle using coordinates",
                    "Coordinate Geometry: Slope of line and equations of lines",
                    "Surface Areas & Volumes: Cylinder/Cone/Sphere (direct problems)",
                    "Trigonometry: Values of sin, cos, tan for specific angles",
                    "Surface Areas & Volumes: Volume of cylinder and cone",
                    "Probability: Simple probability problems with dice/coin"
                ],
                "medium": [
                    "Real Numbers: Fundamental Theorem of Arithmetic, HCF/LCM via prime factorization",
                    "Polynomials: Polynomial division, Factor theorem, Word problems",
                    "Linear Equations: Consistency cases, Cross-multiplication method",
                    "Quadratic Equations: Word problems, Discriminant analysis",
                    "Arithmetic Progressions: Word problems, Sum of n terms in a given sequence",
                    "Geometry: Proof of similarity, Advanced BPT applications",
                    "Coordinate Geometry: Area of triangle using coordinates, Section formula",
                    "Trigonometry: Trigonometric identities, Equations with multiple steps",
                    "Circles: Secants and tangents, Angle properties in circles",
                    "Statistics: Median and Mode, Cumulative frequency",
                    "Coordinate Geometry: Finding the equation of a line",
                    "Linear Equations: Word problems with money/speed/age",
                    "Surface Areas & Volumes: Combination of solids, mixed TSA/volume",
                    "Trigonometry: Prove identities with multiple terms",
                    "Triangles: Advanced similarity problems",
                    "Probability: Conditional probability, Random variable problems",
                    "Coordinate Geometry: Equation of straight lines",
                    "Polynomials: Advanced factorization problems",
                    "Surface Areas & Volumes: Volume of frustum",
                    "Statistics: Variance and standard deviation"
                ],
                "hard": [
                    "Real Numbers: Proof of irrationality using Euclid’s algorithm",
                    "Polynomials: Advanced factorization, Polynomial equations with parameters",
                    "Linear Equations: Complex word problems with constraints, Advanced consistency",
                    "Quadratic Equations: Advanced parameter-based problems, Roots and nature of roots",
                    "Arithmetic Progressions: Mixed problems with conditions",
                    "Geometry: Full similarity proof problems, Pythagoras converse",
                    "Coordinate Geometry: Coordinate geometry with proofs, Area and section formula",
                    "Trigonometry: Complex identities, Solving trigonometric equations",
                    "Circles: Proofs related to angles in cyclic quadrilaterals, Tangent-secant theorem",
                    "Statistics: Box plot construction, Combined mean/median/mode problems",
                    "Probability: Multi-step counting, tricky sample space problems",
                    "Surface Areas & Volumes: Recasting/melting combined solids",
                    "Coordinate Geometry: Finding area of triangle from coordinates",
                    "Polynomials: Long division, Parameterized polynomials",
                    "Linear Equations: Systems of equations with inequalities",
                    "Statistics: Advanced regression problems",
                    "Surface Areas & Volumes: Volume of frustum and complex solids",
                    "Trigonometry: Solving for multiple unknowns in identity proofs",
                    "Circles: Angle between two tangents from external point",
                    "Coordinate Geometry: Proofs with locus of points"
                ]
            }
        },
        "12th Grade": {
            "Mathematics": {
                "easy": [
                    "Differentiation: Basic derivatives (power rule, product rule)",
                    "Matrices: Determinants, Basic operations",
                    "Vectors: Addition, Subtraction, Scalar multiplication",
                    "Probability: Simple events, Conditional probability",
                    "Differential Equations: First-order linear equations",
                    "Relations and Functions: Domain, Range, Types of functions",
                    "Permutations & Combinations: Basic counting techniques",
                    "Trigonometry: Standard angles, Simple identities",
                    "Coordinate Geometry: Line equation, Circle equation basics",
                    "Calculus: Limits and continuity"
                ],
                "medium": [
                    "Differentiation: Application of derivatives, Maxima and minima",
                    "Matrices: Inverse of matrices, Cramer’s Rule",
                    "Vectors: Dot product, Cross product",
                    "Probability: Binomial distribution, Poisson distribution",
                    "Differential Equations: Second-order equations, Applications",
                    "Relations and Functions: Composition, Inverse of functions",
                    "Permutations & Combinations: Advanced counting problems",
                    "Trigonometry: Prove and apply identities, Angle transformations",
                    "Coordinate Geometry: Conic sections, Hyperbola, Parabola equations",
                    "Calculus: Integration by parts"
                ],
                "hard": [
                    "Differentiation: Implicit differentiation, Higher-order derivatives",
                    "Matrices: Eigenvalues, Eigenvectors",
                    "Vectors: Vector calculus, Applications in 3D geometry",
                    "Probability: Advanced combinatorial probability, Random variables",
                    "Differential Equations: Non-homogeneous equations, Complex solutions",
                    "Relations and Functions: Proofs of inverse relations, Limit applications",
                    "Permutations & Combinations: Advanced theorems and proofs",
                    "Trigonometry: Complex identities, Multiple-angle formulas",
                    "Coordinate Geometry: Parametric equations of conics",
                    "Calculus: Advanced integration techniques, Improper integrals"
                ]
            }
        }
    },
    "Computer Science": {
        "easy": [
            "Data Structures: Arrays, Linked Lists",
            "Algorithms: Sorting algorithms (Bubble, Merge)",
            "Object-Oriented Programming: Classes and objects",
            "Operating Systems: Processes, Threads",
            "Networking: OSI model basics",
            "SQL: Select queries, Joins",
            "Python: Variables, Loops, Functions",
            "Java: Classes and Methods",
            "C++: Arrays, Functions",
            "Web Development: HTML, CSS"
        ],
        "medium": [
            "Data Structures: Trees, Heaps, Hashmaps",
            "Algorithms: Quick Sort, Merge Sort, Binary Search",
            "Object-Oriented Programming: Inheritance, Polymorphism",
            "Operating Systems: Memory management, File systems",
            "Networking: TCP/IP, Routing algorithms",
            "SQL: Subqueries, Joins, Aggregates",
            "Python: Libraries (NumPy, Pandas)",
            "Java: Exception handling, Multithreading",
            "C++: OOP, Standard Template Library",
            "Web Development: AJAX, Node.js"
        ],
        "hard": [
            "Data Structures: Graphs, Advanced tree operations",
            "Algorithms: Dynamic programming, Greedy algorithms",
            "Object-Oriented Programming: Design patterns",
            "Operating Systems: Virtual memory, Deadlock prevention",
            "Networking: Advanced protocols, Network design",
            "SQL: Normalization, Advanced queries",
            "Python: Generators, Decorators",
            "Java: Streams, Lambda functions",
            "C++: Memory management, Pointers",
            "Web Development: Full-stack development, React"
        ]
    },
    "Government Exams": {
        "easy": [
            "General Knowledge: History basics, Important dates",
            "Current Affairs: Prime Minister, President",
            "English: Vocabulary, Synonyms, Antonyms",
            "Mathematics: Basic arithmetic, Percentage",
            "General Science: Basic physics, chemistry, biology"
        ],
        "medium": [
            "General Knowledge: Freedom Struggle, Ancient and Medieval India",
            "Current Affairs: National and international issues",
            "English: Sentence correction, Error spotting",
            "General Science: Physics laws, Chemical reactions",
            "Mathematics: Time and work, Speed, Distance"
        ],
        "hard": [
            "General Knowledge: Indian polity, Indian constitution",
            "Current Affairs: International relations, Government schemes",
            "English: Reading comprehension, Idioms/Phrases",
            "Mathematics: Data interpretation, Advanced algebra",
            "General Science: Environmental Science, Advanced Physics"
        ]
    }
}

class QuizGenerateView(APIView):
    """Generate quiz using OpenAI based on configuration"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # ... (rest of the code for getting config)
        config_id = request.data.get('config_id')
        
        if config_id:
            # Config-based generation
            try:
                config = QuizConfig.objects.get(id=config_id, user=request.user)
                category = config.category
                level = config.level
                subject = config.subject
                difficulty = config.difficulty
                num_questions = config.number_of_questions
                custom_title = request.data.get('title', '')
            except QuizConfig.DoesNotExist:
                return Response({'error': 'Quiz configuration not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Direct parameter-based generation
            subject_id = request.data.get('subject_id')
            difficulty = request.data.get('difficulty', 'medium')
            num_questions = int(request.data.get('num_questions', 10))
            if num_questions > 100:
                num_questions = 100
            custom_title = request.data.get('title', '')
            
            if not subject_id:
                return Response({'error': 'subject_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                subject = Subject.objects.get(id=subject_id)
                level = subject.level
                category = level.category
            except Subject.DoesNotExist:
                return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

        topic_list = []
        try:
            topic_list = TOPIC_MAP.get(category.name, {}).get(level.name, {}).get(subject.name, {}).get(difficulty, [])
        except KeyError:
            pass

        if not topic_list:
            topic_list = [subject.name]

        all_questions_data = []
        num_topics = len(topic_list)
        questions_per_topic = num_questions // num_topics
        extra_questions = num_questions % num_topics

        for i, topic in enumerate(topic_list):
            num_to_generate = questions_per_topic + (1 if i < extra_questions else 0)
            if num_to_generate == 0:
                continue

            retries = 3
            while retries > 0:
                try:
                    prompt = f"""Generate {num_to_generate} multiple-choice questions for a quiz on the topic '{topic}' 
                    (Subject: {subject.name}, Category: {category.name}, Level: {level.name}).

                    Difficulty: {difficulty}
                    Standard: Indian curriculum

                    Return ONLY a valid JSON array with this exact structure:
                    [
                        {{
                            "question": "Question text here?",
                            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                            "correct_answer": 0,
                            "explanation": "Explanation of the correct answer"
                        }}
                    ]

                    Important:
                    - Each question must have exactly 4 options
                    - correct_answer must be the index (0-3) of the correct option
                    - Make questions relevant to {difficulty} difficulty level
                    - Provide clear explanations
                    """
                    
                    max_tokens_per_question = 300
                    calculated_max_tokens = num_to_generate * max_tokens_per_question
                    max_tokens = min(calculated_max_tokens, 4000)

                    response = get_openai_client().chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are an expert quiz generator. Return only valid JSON arrays."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=max_tokens
                    )
                    
                    ai_content = response.choices[0].message.content.strip()
                    
                    if '```json' in ai_content:
                        ai_content = ai_content.split('```json')[1]
                        ai_content = ai_content.split('```')[0]
                    elif ai_content.startswith('```'):
                        ai_content = ai_content.split('```')[1]
                    
                    start_index = ai_content.find('[')
                    end_index = ai_content.rfind(']')

                    if start_index != -1 and end_index != -1:
                        ai_content = ai_content[start_index:end_index+1]
                    
                    questions_data = json.loads(ai_content)
                    all_questions_data.extend(questions_data)
                    break 

                except Exception as e:
                    retries -= 1
                    print(f"DEBUG: Exception in quiz generation for topic '{topic}': {e}. Retries left: {retries}")
                    if retries == 0:
                        print(f"Failed to generate questions for topic '{topic}' after multiple retries.")
                        # Optionally, you could add a placeholder or skip this topic.
                        # For now, we just log and continue.
                        pass
        
        random.shuffle(all_questions_data)

        # Create Quiz
        quiz_title = custom_title or f"{subject.name} - {difficulty.capitalize()} Quiz"
        quiz = Quiz.objects.create(
            title=quiz_title,
            category=category,
            level=level,
            subject=subject,
            difficulty=difficulty,
            quiz_type='ai_generated',
            is_ai_generated=True,
            is_published=True,
            created_by=request.user,
            time_limit=num_questions * 60  # 60 seconds per question
        )

        
        # Create Questions
        for idx, q_data in enumerate(all_questions_data):
            Question.objects.create(
                quiz=quiz,
                question_text=q_data['question'],
                options=q_data['options'],
                correct_answer=q_data['correct_answer'],
                explanation=q_data.get('explanation', ''),
                order=idx + 1
            )
        
        # Update user profile
        profile = request.user.profile
        profile.total_quizzes_created += 1
        profile.save()
        
        serializer = QuizSerializer(quiz)
        return Response({
            'message': 'Quiz generated successfully',
            'quiz_id': quiz.id,
            'title': quiz.title,
            'questions_count': quiz.questions.count(),
            'difficulty': quiz.difficulty,
            'quiz': serializer.data
        }, status=status.HTTP_201_CREATED)

class QuizGenerateFromFileView(APIView):
    """Generate quiz from uploaded file (PDF, DOCX, TXT)"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        title = request.data.get('title', 'Untitled Quiz')
        num_questions = int(request.data.get('num_questions', 10))
        if num_questions > 100:
            num_questions = 100
        difficulty = request.data.get('difficulty', 'medium')
        category_id = request.data.get('category_id')
        level_id = request.data.get('level_id')
        subject_id = request.data.get('subject_id')
        
        if not file:
            return Response({'error': 'File is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 50MB)
        if file.size > 50 * 1024 * 1024:
            return Response({'error': 'File size must be less than 50MB'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.txt', '.doc']
        file_ext = '.' + file.name.split('.')[-1].lower() if '.' in file.name else ''
        if file_ext not in allowed_extensions:
            return Response({
                'error': f'Invalid file type. Allowed types: PDF, DOCX, TXT'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract text from file
        try:
            file_content = extract_text_from_file(file)
            print(f"DEBUG: Extracted {len(file_content)} characters from file")
            print(f"DEBUG: First 200 chars: {file_content[:200]}")
            if not file_content or len(file_content.strip()) < 50:
                return Response({
                    'error': 'Could not extract enough text from the file. Please ensure the file contains readable text.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            print(f"DEBUG: ValueError in extraction: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"DEBUG: Exception in extraction: {e}")
            return Response({'error': f'Unable to read file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare OpenAI prompt
        print(f"DEBUG: Preparing OpenAI prompt with {len(file_content)} characters of file content.")
        print(f"DEBUG: File content (first 500 chars): {file_content[:500]}...")
        
        prompt = f"""Based on the following study material, generate {num_questions} multiple-choice questions.
        
        Difficulty: {difficulty}
        
        Study Material:
        {file_content}
        
        Return ONLY a valid JSON array with this structure:
        [
            {{
                "question": "Question text?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct_answer": 0,
                "explanation": "Explanation"
            }}
        ]
        """
        
        try:
            response = get_openai_client().chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert quiz generator. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            ai_content = response.choices[0].message.content.strip()
            print(f"DEBUG: Raw AI response content (first 500 chars): {ai_content[:500]}...")

            # Try to extract JSON if wrapped in markdown
            if '```json' in ai_content:
                ai_content = ai_content.split('```json')[1]
                ai_content = ai_content.split('```')[0]
            elif ai_content.startswith('```'):
                ai_content = ai_content.split('```')[1]

            # Find the start and end of the JSON array
            start_index = ai_content.find('[')
            end_index = ai_content.rfind(']')

            if start_index != -1 and end_index != -1:
                ai_content = ai_content[start_index:end_index+1]
            
            print(f"DEBUG: AI response content after extraction attempts (first 500 chars): {ai_content[:500]}...")

            questions_data = json.loads(ai_content)
            
            # Get default category, level, subject if not provided
            # Use filter().first() and get pk directly for MongoDB compatibility
            default_category = Category.objects.all()[:1]
            default_level = Level.objects.all()[:1]
            default_subject = Subject.objects.all()[:1]
            
            if not default_category or not default_level or not default_subject:
                return Response({
                    'error': 'No categories/levels/subjects found. Please run populate_data first.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get actual objects
            default_category = default_category[0] if default_category else None
            default_level = default_level[0] if default_level else None
            default_subject = default_subject[0] if default_subject else None
            
            if not default_category or not default_level or not default_subject:
                return Response({
                    'error': 'No categories/levels/subjects found. Please run populate_data first.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Create Quiz with foreign key assignments
            quiz = Quiz(
                title=title,
                difficulty=difficulty,
                quiz_type='file_upload',
                is_ai_generated=True,
                is_published=True,  # Explicitly set to ensure quiz is accessible
                is_temporary=True, # Mark as temporary
                created_by=request.user,
                uploaded_file=file
            )
            # Assign foreign keys directly using the objects we already have
            quiz.category = default_category if not category_id else Category.objects.get(pk=category_id)
            quiz.level = default_level if not level_id else Level.objects.get(pk=level_id)
            quiz.subject = default_subject if not subject_id else Subject.objects.get(pk=subject_id)
            quiz.save()
            
            for idx, q_data in enumerate(questions_data):
                Question.objects.create(
                    quiz=quiz,
                    question_text=q_data['question'],
                    options=q_data['options'],
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data.get('explanation', ''),
                    order=idx + 1
                )
            
            profile = request.user.profile
            profile.total_quizzes_created += 1
            profile.save()
            
            serializer = QuizSerializer(quiz)
            return Response({
                'message': 'Quiz generated from file successfully',
                'quiz_id': quiz.id,
                'title': quiz.title,
                'questions_count': quiz.questions.count(),
                'difficulty': quiz.difficulty,
                'quiz': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Print full traceback for debugging
            traceback.print_exc()
            return Response({
                'error': 'Failed to generate quiz from file',
                'details': str(e),
                'type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==================== QUIZ MANAGEMENT VIEWS ====================

class RecommendedQuizzes(APIView):
    """
    Generate personalized quiz recommendations for the logged-in user.
    Recommendations are based on preferred categories, attempt history, and popularity.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Response({"error": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Fetch user's preferred categories and recent activity
        preferred_category_names = [cat.strip() for cat in profile.category_preference.split(',') if cat.strip()]
        
        # Get the most recent category from the user's last 5 attempts
        recent_attempts = QuizAttempt.objects.filter(user=user, status='completed').order_by('-completed_at').select_related('quiz__category', 'quiz__subject')[:5]
        
        recent_categories = [attempt.quiz.category.name for attempt in recent_attempts if attempt.quiz.category]
        most_recent_category = recent_categories[0] if recent_categories else None

        recent_subjects = [attempt.quiz.subject.name for attempt in recent_attempts if attempt.quiz.subject]
        most_recent_subject = recent_subjects[0] if recent_subjects else None

        # If user has no preferences or recent activity, return empty list (don't trigger recommendations)
        if not preferred_category_names and not recent_subjects:
            return Response([])

        # 2. Fetch all quizzes and user's recent attempts
        # STRICT MODE: Only fetch quizzes that match the user's recent SUBJECTS.
        # This prevents "Chemistry" from showing up when user did "Biology".
        all_quizzes = list(Quiz.objects.filter(
            is_published=True,
            is_temporary=False,
            subject__name__in=recent_subjects # STRICT FILTER
        ).select_related('category', 'subject'))
        
        attempted_quizzes_map = {attempt.quiz_id: attempt.completed_at for attempt in recent_attempts}

        # 3. Score each quiz
        scored_quizzes = []
        for quiz in all_quizzes:
            score = 0
            
            # Rule 1: Prioritize preferred categories (Keep as tie-breaker)
            if quiz.category.name in preferred_category_names:
                score += 10
            
            # Rule 2: Boost for MOST recent subject
            if quiz.subject.name == most_recent_subject:
                score += 50 
            
            # Rule 3: Factor in popularity
            score += quiz.popularity_score
            
            # Rule 4: Deprioritize recently attempted quizzes
            if quiz.id in attempted_quizzes_map:
                days_since_attempt = (timezone.now() - attempted_quizzes_map[quiz.id]).days
                if days_since_attempt <= 1:
                    score -= 50
                elif days_since_attempt <= 7:
                    score -= 20
                else:
                    score -= 5
            else:
                score += 10 # Bonus for unattempted quizzes
            
            scored_quizzes.append({'quiz': quiz, 'score': score})

        # 4. Sort quizzes by score
        scored_quizzes.sort(key=lambda x: x['score'], reverse=True)
        
        # 5. Build the final list of recommendations
        final_recommendations = []
        recommended_ids = set()
        recommended_combos = set()

        # Add from scored quizzes first
        for item in scored_quizzes:
            if len(final_recommendations) >= 5:
                break
            quiz = item['quiz']
            combo = (quiz.category.id, quiz.level.id, quiz.difficulty)
            if quiz.id not in recommended_ids and combo not in recommended_combos:
                final_recommendations.append(quiz)
                recommended_ids.add(quiz.id)
                recommended_combos.add(combo)
        
        # If still fewer than 5, add trending quizzes
        if len(final_recommendations) < 5:
            trending_quizzes = Quiz.objects.filter(is_published=True) \
                .exclude(id__in=recommended_ids) \
                .order_by('-popularity_score')[:10]
            
            for quiz in trending_quizzes:
                if len(final_recommendations) >= 5:
                    break
                combo = (quiz.category.id, quiz.level.id, quiz.difficulty)
                if quiz.id not in recommended_ids and combo not in recommended_combos:
                    final_recommendations.append(quiz)
                    recommended_ids.add(quiz.id)
                    recommended_combos.add(combo)

        # 6. Return the final list
        serializer = QuizListSerializer(final_recommendations, many=True)
        return Response(serializer.data)

class QuizListView(APIView):
    """List all published quizzes"""
    permission_classes = [AllowAny]

    def get(self, request):
        quizzes = Quiz.objects.filter(is_published=True).select_related(
            'category', 'level', 'subject', 'created_by'
        )
        
        # Filter by query params
        category = request.query_params.get('category')
        level = request.query_params.get('level')
        subject = request.query_params.get('subject')
        difficulty = request.query_params.get('difficulty')
        
        if category:
            quizzes = quizzes.filter(category__name=category)
        if level:
            quizzes = quizzes.filter(level__name=level)
        if subject:
            quizzes = quizzes.filter(subject__name=subject)
        if difficulty:
            quizzes = quizzes.filter(difficulty=difficulty)
        
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data)

class QuizDetailView(APIView):
    """Get quiz details (for quiz creator/admin)"""
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            serializer = QuizSerializer(quiz)
            return Response(serializer.data)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)

class QuizTakeView(APIView):
    """
    Get quiz for taking.
    - If user has an 'in_progress' attempt, questions are returned in original order.
    - If user is starting a new quiz, questions are shuffled.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id, is_published=True)
            
            # Check for an existing 'in_progress' attempt
            in_progress_attempt = QuizAttempt.objects.filter(
                quiz=quiz,
                user=request.user,
                status='in_progress'
            ).first()
            
            if not in_progress_attempt:
                # User is starting a new quiz, so shuffle questions
                questions = list(quiz.questions.all())
                random.shuffle(questions)
                # Attach shuffled questions to the quiz object for the serializer
                quiz.questions_for_serializer = questions
            
            # If resuming, serializer will use default ordered questions
            serializer = QuizTakeSerializer(quiz)
            return Response(serializer.data)
            
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)

# ==================== QUIZ ATTEMPT VIEWS ====================

class QuizStartView(APIView):
    """Start a new quiz attempt"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        quiz_id = request.data.get('quiz_id')
        
        try:
            quiz = Quiz.objects.get(id=quiz_id, is_published=True)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create quiz attempt
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            total_questions=quiz.total_questions,
            status='in_progress'
        )
        
        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class QuizSubmitView(APIView):
    """Submit quiz answers and get results"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = QuizSubmitSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        attempt_id = serializer.validated_data['attempt_id']
        answers_data = serializer.validated_data['answers']
        time_taken = serializer.validated_data.get('time_taken', 0)
        
        try:
            attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user, status='in_progress')
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Active quiz attempt not found'}, status=status.HTTP_404_NOT_FOUND)
            
        quiz = attempt.quiz

        # Update attempt details
        attempt.time_taken = time_taken
        attempt.status = 'completed'
        attempt.completed_at = timezone.now()
        
        # Save answers
        for answer_data in answers_data:
            try:
                question = Question.objects.get(id=answer_data['question_id'], quiz=quiz)
                Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_option=answer_data['selected_option']
                )
            except Question.DoesNotExist:
                continue
        
        # Calculate score and save attempt
        attempt.calculate_score()
        attempt.save()
        
        # If the quiz is temporary, don't update user profile stats
        if not quiz.is_temporary:
            # Update user profile
            profile = request.user.profile
            profile.total_quizzes_taken += 1
            profile.total_questions_answered += attempt.total_questions
            profile.total_correct_answers += attempt.correct_answers
            profile.add_xp(attempt.xp_earned)
            profile.update_streak()
            streak_lost = getattr(profile, 'streak_was_just_reset', False)
            
            # Update analytics
            analytics, created = QuizAnalytics.objects.get_or_create(user=request.user)
            analytics.total_quizzes_taken += 1
            analytics.total_questions_answered += attempt.total_questions
            analytics.total_correct_answers += attempt.correct_answers
            
            if quiz.difficulty == 'easy':
                analytics.easy_quizzes_taken += 1
            elif quiz.difficulty == 'medium':
                analytics.medium_quizzes_taken += 1
            else:
                analytics.hard_quizzes_taken += 1
            
            analytics.total_time_spent += time_taken
            if analytics.total_quizzes_taken > 0:
                analytics.average_quiz_time = analytics.total_time_spent // analytics.total_quizzes_taken
            
            analytics.save()
        else:
            profile = request.user.profile
            streak_lost = False # Default value for temporary quizzes

        # Return results
        attempt_serializer = QuizAttemptSerializer(attempt)
        quiz_serializer = QuizResultSerializer(quiz)
        return Response({
            'message': 'Quiz submitted successfully',
            'attempt': attempt_serializer.data,
            'quiz': quiz_serializer.data,
            'xp_earned': attempt.xp_earned,
            'new_level': profile.level,
            'new_xp': profile.xp,
            'streak_lost': streak_lost,
            'current_streak': profile.current_streak,
            'longest_streak': profile.longest_streak
        }, status=status.HTTP_200_OK)

class QuizAttemptDetailView(APIView):
    """Get details of a specific quiz attempt"""
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        try:
            attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user)
            serializer = QuizAttemptSerializer(attempt)
            return Response(serializer.data)
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)

class UserQuizHistoryView(APIView):
    """Get user's quiz attempt history"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user, quiz__is_temporary=False).select_related('quiz')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

# ==================== ANALYTICS VIEWS ====================

class UserAnalyticsView(APIView):
    """Get user analytics"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analytics, created = QuizAnalytics.objects.get_or_create(user=request.user)
        serializer = QuizAnalyticsSerializer(analytics)
        return Response(serializer.data)

class UserPerformanceView(APIView):
    """Get user performance data"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        analytics, created = QuizAnalytics.objects.get_or_create(user=user)

        total_quizzes_attempted = QuizAttempt.objects.filter(user=user).count()
        total_quizzes_completed = QuizAttempt.objects.filter(user=user, status='completed').count()
        
        total_correct_answers = analytics.total_correct_answers
        total_questions_answered = analytics.total_questions_answered
        total_incorrect_answers = total_questions_answered - total_correct_answers
        
        accuracy = (total_correct_answers / total_questions_answered * 100) if total_questions_answered > 0 else 0

        # Category-wise performance for the most recent quiz in each specified category
        categories_to_check = ["Academics", "Computer Engineering", "Government Exams"]
        category_performance_list = []
        
        for cat_name in categories_to_check:
            last_attempt_in_cat = QuizAttempt.objects.filter(
                user=user, 
                status='completed', 
                quiz__category__name=cat_name
            ).order_by('-completed_at').first()
            
            if last_attempt_in_cat:
                category_performance_list.append({
                    'category': cat_name,
                    'average_score': last_attempt_in_cat.score_percentage
                })

        category_wise_performance = {
            'most_recent_quiz': {
                'quiz_title': 'Most Recent Quizzes by Category',
                'categories': category_performance_list
            }
        } if category_performance_list else None


        # Subject-wise performance based on the category of the last quiz
        last_attempt = QuizAttempt.objects.filter(user=user, status='completed').order_by('-completed_at').first()
        subject_wise_performance = None

        if last_attempt:
            last_quiz_category = last_attempt.quiz.category
            subjects_in_category = Subject.objects.filter(level__category=last_quiz_category)
            
            subject_performance_list = []
            for subject in subjects_in_category:
                last_attempt_for_subject = QuizAttempt.objects.filter(
                    user=user,
                    status='completed',
                    quiz__subject=subject
                ).order_by('-completed_at').first()

                if last_attempt_for_subject:
                    subject_performance_list.append({
                        'subject': subject.name,
                        'score': last_attempt_for_subject.score_percentage
                    })

            subject_wise_performance = {
                'most_recent_quiz': {
                    'quiz_title': f'Performance in {last_quiz_category.name}',
                    'subjects': subject_performance_list
                }
            }


        data = {
            'overall': {
                'total_quizzes_attempted': total_quizzes_attempted,
                'total_quizzes_completed': total_quizzes_completed,
                'total_correct_answers': total_correct_answers,
                'total_incorrect_answers': total_incorrect_answers,
                'accuracy': accuracy,
                'average_score': profile.average_score,
                'highest_score': QuizAttempt.objects.filter(user=user, status='completed').aggregate(Avg('score_percentage'))['score_percentage__avg'] or 0,
            },
            'category_wise_performance': category_wise_performance,
            'subject_wise_performance': subject_wise_performance
        }
        return Response(data)


class RecentActivityView(APIView):
    """Get recent user activity"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        
        activities = []

        # 1. Recent quiz attempts
        recent_attempts = QuizAttempt.objects.filter(user=user, status='completed').order_by('-completed_at')[:7]
        for attempt in recent_attempts:
            activities.append({
                'id': f"attempt-{attempt.id}",
                'type': 'quiz_taken',
                'title': attempt.quiz.title,
                'score': attempt.score_percentage,
                'date_obj': attempt.completed_at,
                'xp': attempt.xp_earned,
                'category': attempt.quiz.category.name,
                'subject': attempt.quiz.subject.name,
            })

        # 2. Recent quizzes created
        recent_quizzes_created = Quiz.objects.filter(created_by=user).order_by('-created_at')[:7]
        for quiz in recent_quizzes_created:
            activities.append({
                'id': f"quiz-{quiz.id}",
                'type': 'quiz_created',
                'title': quiz.title,
                'date_obj': quiz.created_at,
                'xp': 100,  # Fixed XP for creating a quiz
                'category': quiz.category.name,
                'subject': quiz.subject.name,
            })
            
        # 3. Recent achievements unlocked
        recent_achievements = UserAchievement.objects.filter(user=user).order_by('-unlocked_at')[:7]
        for ua in recent_achievements:
            activities.append({
                'id': f"achieve-{ua.id}",
                'type': 'achievement',
                'title': f"{ua.achievement.name} Unlocked",
                'date_obj': ua.unlocked_at,
                'xp': 100,  # Fixed XP for unlocking an achievement
            })

        # Sort all activities by date
        activities.sort(key=lambda x: x['date_obj'], reverse=True)
        
        # Take the top 7 most recent activities
        recent_activities = activities[:7]
        
        # Format date for display
        for activity in recent_activities:
            time_diff = now - activity['date_obj']
            if time_diff.days > 0:
                activity['date'] = f"{time_diff.days} days ago"
            elif time_diff.seconds // 3600 > 0:
                activity['date'] = f"{time_diff.seconds // 3600} hours ago"
            elif time_diff.seconds // 60 > 0:
                activity['date'] = f"{time_diff.seconds // 60} minutes ago"
            else:
                activity['date'] = "Just now"
            del activity['date_obj']  # Remove temporary date object

        serializer = RecentActivitySerializer(recent_activities, many=True)
        return Response(serializer.data)

# ==================== ACHIEVEMENT VIEWS ====================

class AchievementListView(APIView):
    """List all achievements"""
    permission_classes = [AllowAny]

    def get(self, request):
        achievements = Achievement.objects.all()
        serializer = AchievementSerializer(achievements, many=True)
        return Response(serializer.data)

class UserAchievementsView(APIView):
    """Get user's unlocked achievements"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_achievements = UserAchievement.objects.filter(user=request.user)
        serializer = UserAchievementSerializer(user_achievements, many=True)
        return Response(serializer.data)

class LeaderboardView(APIView):
    """Get leaderboard data"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = UserProfile.objects.order_by('-level', '-xp')
        data = []
        for profile in profiles:
            data.append({
                'id': profile.user.id,
                'username': profile.user.username,
                'total_xp': profile.xp,
                'level': profile.level,
            })
        return Response(data)
