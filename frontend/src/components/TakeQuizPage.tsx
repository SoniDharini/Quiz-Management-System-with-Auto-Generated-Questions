import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Code2,
  Briefcase,
  ChevronRight,
  Target,
  Brain,
  Cpu,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Award,
  Sparkles,
  Zap,
  Pause,
} from 'lucide-react';
import { quizAPI, categoryAPI } from '../services/api';
import { saveQuizState, loadQuizState, clearQuizState, QuizState } from '../lib/quizPersistence';

interface TakeQuizPageProps {
  onBack: () => void;
}


type Step = 'category' | 'subcategory' | 'subject' | 'configure' | 'quiz' | 'results';

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}
export function TakeQuizPage({ onBack }: TakeQuizPageProps) {
  const navigate = useNavigate();
  const { quizId: quizIdFromUrl } = useParams();
  const preselectedQuizId = quizIdFromUrl ? parseInt(quizIdFromUrl) : null;
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<string>('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedQuiz, setLoadedQuiz] = useState<any>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  // API data state
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState<any[]>([]);
  const [streakInfo, setStreakInfo] = useState<{ lost: boolean, current: number } | null>(null);

  // Load recommended quizzes on mount
  useEffect(() => {
    const fetchRecommendedQuizzes = async () => {
      try {
        const data = await quizAPI.getRecommendedQuizzes();
        setRecommendedQuizzes(data);
      } catch (error) {
        console.error('Failed to load recommended quizzes:', error);
      }
    };

    fetchRecommendedQuizzes();
  }, []);

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching categories...');
        const data = await categoryAPI.getCategories();
        console.log('Categories loaded:', data);
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Don't show alert on mount, just log the error
        // User can still use file upload flow
      } finally {
        setIsLoading(false);
      }
    };

    if (currentStep === 'category') {
      fetchCategories();
    }
  }, [currentStep]);
  // If a quiz ID is preselected, check for saved state or load the quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      if (preselectedQuizId && preselectedQuizId > 0) {
        const savedState = loadQuizState();

        // If there's a saved state for this specific quiz, restore it
        if (savedState && savedState.quizId === preselectedQuizId) {
          console.log('Restoring saved quiz state:', savedState);
          setLoadedQuiz({ id: savedState.quizId }); // Initially set ID to trigger loading
          await loadQuizById(savedState.quizId, savedState);
        } else {
          // Otherwise, load the quiz from scratch
          console.log('Loading preselected quiz from scratch:', preselectedQuizId);
          await loadQuizById(preselectedQuizId);
        }
      } else {
        console.log('No preselected quiz, showing category selection');
        setCurrentStep('category');
      }
    };

    initializeQuiz();
  }, [preselectedQuizId]);

  // Timer countdown logic
  useEffect(() => {
    if (currentStep === 'quiz' && loadedQuiz && !quizCompleted && !isPaused) {
      if (timeLeft <= 0) {
        handleSubmitQuiz();
        return;
      }

      const timerId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [currentStep, loadedQuiz, quizCompleted, timeLeft, isPaused]);

  // Save quiz state on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (currentStep === 'quiz' && loadedQuiz && !quizCompleted) {
        saveQuizState({
          quizId: loadedQuiz.id,
          currentQuestionIndex,
          selectedAnswers,
          remainingTime: timeLeft,
          attemptId,
        });
        // Note: Most modern browsers don't show this message
        event.returnValue = 'Your quiz progress will be saved.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStep, loadedQuiz, quizCompleted, currentQuestionIndex, selectedAnswers, timeLeft, attemptId]);

  const loadQuizById = async (quizId: number, restoredState: QuizState | null = null) => {
    try {
      setIsLoadingQuiz(true);
      const quizData = await quizAPI.getQuizToTake(quizId);
      setLoadedQuiz(quizData);

      // Set metadata for navigation and display
      setSelectedCategory(quizData.category.toString());
      setSelectedSubcategory(quizData.level.toString());
      setSelectedSubject(quizData.subject.toString());

      if (restoredState) {
        // If we are restoring from a saved state
        setTimeLeft(restoredState.remainingTime);
        setSelectedAnswers(restoredState.selectedAnswers);
        setCurrentQuestionIndex(restoredState.currentQuestionIndex);
        setAttemptId(restoredState.attemptId);
      } else {
        // If starting a new quiz, initialize state
        const newAttempt = await quizAPI.startQuiz(quizId);
        setAttemptId(newAttempt.id);
        setTimeLeft(quizData.time_limit || 600);
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        clearQuizState(); // Clear any previous state
      }

      setCurrentStep('quiz');
      setIsPaused(false); // Ensure quiz is not paused on load
    } catch (error) {
      console.error('Failed to load quiz:', error);
      alert('Failed to load quiz. Please try again.');
      if (currentStep !== 'quiz') {
        onBack();
      }
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Load levels when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      const fetchLevels = async () => {
        try {
          setIsLoading(true);
          const categoryId = parseInt(selectedCategory);
          const data = await categoryAPI.getLevels(categoryId);
          setLevels(data);
        } catch (error) {
          console.error('Failed to load levels:', error);
          alert('Failed to load levels. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchLevels();
    }
  }, [selectedCategory]);

  // Load subjects when a level is selected
  useEffect(() => {
    if (selectedSubcategory) {
      const fetchSubjects = async () => {
        try {
          setIsLoading(true);
          const levelId = parseInt(selectedSubcategory);
          const data = await categoryAPI.getSubjects(levelId);
          setSubjects(data);
        } catch (error) {
          console.error('Failed to load subjects:', error);
          alert('Failed to load subjects. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubjects();
    }
  }, [selectedSubcategory]);

  const subcategories: Record<string, { id: string; name: string; subjects: string[] }[]> = {
    academics: [
      {
        id: '10th',
        name: '10th Grade',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology']
      },
      {
        id: '12th',
        name: '12th Grade',
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology']
      }
    ],
    cse: [
      {
        id: 'core',
        name: 'Core Subjects',
        subjects: ['Data Structures', 'Algorithms', 'Database Management', 'Operating Systems', 'Computer Networks']
      },
      {
        id: 'programming',
        name: 'Programming',
        subjects: ['C/C++', 'Java', 'Python', 'Web Development', 'Object Oriented Programming']
      }
    ],
    government: [
      {
        id: 'national',
        name: 'National Level',
        subjects: ['UPSC Civil Services', 'SSC CGL', 'SSC CHSL', 'Railway Exams', 'Banking Exams']
      },
      {
        id: 'state',
        name: 'State Level',
        subjects: ['State PSC', 'Police Exams', 'Teaching Exams', 'Clerk Exams', 'Other State Exams']
      }
    ]
  };

  // Comprehensive question bank organized by subject
  const questionBank: Record<string, QuizQuestion[]> = {
    // ACADEMICS - 10th Grade Physics
    'Physics-10th': [
      { id: 1, question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 1 },
      { id: 2, question: 'The formula for kinetic energy is:', options: ['mgh', '1/2 mv²', 'Fd', 'P/V'], correctAnswer: 1 },
      { id: 3, question: 'What is the speed of light in vacuum?', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10⁵ m/s', '3×10⁷ m/s'], correctAnswer: 0 },
      { id: 4, question: 'Ohm\'s law states that V equals:', options: ['I/R', 'IR', 'I+R', 'I-R'], correctAnswer: 1 },
      { id: 5, question: 'The unit of electric current is:', options: ['Volt', 'Ampere', 'Ohm', 'Coulomb'], correctAnswer: 1 },
      { id: 6, question: 'What type of lens is used to correct myopia?', options: ['Convex', 'Concave', 'Bifocal', 'Cylindrical'], correctAnswer: 1 },
      { id: 7, question: 'The SI unit of power is:', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 2 },
      { id: 8, question: 'What is the acceleration due to gravity on Earth?', options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11 m/s²'], correctAnswer: 0 },
      { id: 9, question: 'The law of conservation of energy states that energy can be:', options: ['Created only', 'Destroyed only', 'Neither created nor destroyed', 'Both created and destroyed'], correctAnswer: 2 },
      { id: 10, question: 'What is the principle on which a lever works?', options: ['Moment of force', 'Conservation of energy', 'Newton\'s third law', 'Archimedes principle'], correctAnswer: 0 }
    ],

    // ACADEMICS - 10th Grade Chemistry
    'Chemistry-10th': [
      { id: 1, question: 'What is the chemical symbol for Gold?', options: ['Go', 'Au', 'Gd', 'Ag'], correctAnswer: 1 },
      { id: 2, question: 'The pH of a neutral solution is:', options: ['0', '7', '14', '10'], correctAnswer: 1 },
      { id: 3, question: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], correctAnswer: 1 },
      { id: 4, question: 'Which gas is released when metals react with acids?', options: ['Oxygen', 'Hydrogen', 'Nitrogen', 'Carbon dioxide'], correctAnswer: 1 },
      { id: 5, question: 'The chemical formula for water is:', options: ['H₂O', 'O₂', 'CO₂', 'H₂SO₄'], correctAnswer: 0 },
      { id: 6, question: 'What is the valency of oxygen?', options: ['1', '2', '3', '4'], correctAnswer: 1 },
      { id: 7, question: 'Which element is the most abundant in Earth\'s crust?', options: ['Iron', 'Oxygen', 'Silicon', 'Aluminum'], correctAnswer: 1 },
      { id: 8, question: 'What type of bond is formed when electrons are shared?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correctAnswer: 1 },
      { id: 9, question: 'The molecular formula of methane is:', options: ['CH₄', 'C₂H₆', 'C₃H₈', 'C₄H₁₀'], correctAnswer: 0 },
      { id: 10, question: 'What is the process of converting solid directly to gas called?', options: ['Evaporation', 'Sublimation', 'Condensation', 'Deposition'], correctAnswer: 1 }
    ],

    // ACADEMICS - 10th Grade Mathematics
    'Mathematics-10th': [
      { id: 1, question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correctAnswer: 2 },
      { id: 2, question: 'The value of π (pi) is approximately:', options: ['3.14', '2.71', '1.41', '1.73'], correctAnswer: 0 },
      { id: 3, question: 'What is the formula for the area of a circle?', options: ['2πr', 'πr²', 'πd', '4πr²'], correctAnswer: 1 },
      { id: 4, question: 'If a triangle has sides 3, 4, and 5, it is:', options: ['Equilateral', 'Isosceles', 'Right-angled', 'Scalene'], correctAnswer: 2 },
      { id: 5, question: 'The sum of angles in a triangle is:', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1 },
      { id: 6, question: 'What is the HCF of 12 and 18?', options: ['2', '3', '6', '9'], correctAnswer: 2 },
      { id: 7, question: 'The quadratic formula is used to find:', options: ['Area', 'Volume', 'Roots of equation', 'Slope'], correctAnswer: 2 },
      { id: 8, question: 'What is 25% of 80?', options: ['15', '20', '25', '30'], correctAnswer: 1 },
      { id: 9, question: 'The slope of a horizontal line is:', options: ['0', '1', 'Undefined', 'Infinite'], correctAnswer: 0 },
      { id: 10, question: 'What is the value of sin 90°?', options: ['0', '0.5', '1', '√3/2'], correctAnswer: 2 }
    ],

    // ACADEMICS - 10th Grade Biology
    'Biology-10th': [
      { id: 1, question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'], correctAnswer: 1 },
      { id: 2, question: 'Which gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2 },
      { id: 3, question: 'The basic unit of life is:', options: ['Tissue', 'Organ', 'Cell', 'Organism'], correctAnswer: 2 },
      { id: 4, question: 'Photosynthesis takes place in:', options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'], correctAnswer: 1 },
      { id: 5, question: 'DNA stands for:', options: ['Deoxyribonucleic Acid', 'Dinitrogen Oxide', 'Double Nucleic Acid', 'Dynamic Nuclear Acid'], correctAnswer: 0 },
      { id: 6, question: 'The human body has how many chromosomes?', options: ['23', '46', '48', '52'], correctAnswer: 1 },
      { id: 7, question: 'Which blood group is universal donor?', options: ['A+', 'B+', 'AB+', 'O-'], correctAnswer: 3 },
      { id: 8, question: 'The process by which plants make food is called:', options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'], correctAnswer: 1 },
      { id: 9, question: 'Which organ pumps blood in the human body?', options: ['Liver', 'Kidney', 'Heart', 'Lungs'], correctAnswer: 2 },
      { id: 10, question: 'Mendel is known as the father of:', options: ['Biology', 'Genetics', 'Botany', 'Zoology'], correctAnswer: 1 }
    ],

    // ACADEMICS - 12th Grade Physics
    'Physics-12th': [
      { id: 1, question: 'What is the SI unit of electric charge?', options: ['Ampere', 'Coulomb', 'Volt', 'Ohm'], correctAnswer: 1 },
      { id: 2, question: 'Faraday\'s law is related to:', options: ['Electrostatics', 'Electromagnetic induction', 'Magnetism', 'Thermodynamics'], correctAnswer: 1 },
      { id: 3, question: 'The phenomenon of photoelectric effect was explained by:', options: ['Newton', 'Faraday', 'Einstein', 'Bohr'], correctAnswer: 2 },
      { id: 4, question: 'What is the unit of magnetic flux?', options: ['Tesla', 'Weber', 'Gauss', 'Henry'], correctAnswer: 1 },
      { id: 5, question: 'In a semiconductor, the forbidden energy gap is:', options: ['Zero', 'Very small', 'Very large', 'Infinite'], correctAnswer: 1 },
      { id: 6, question: 'Which phenomenon proves the wave nature of light?', options: ['Photoelectric effect', 'Interference', 'Compton effect', 'Pair production'], correctAnswer: 1 },
      { id: 7, question: 'The principle of a transformer is based on:', options: ['Coulomb\'s law', 'Mutual induction', 'Self induction', 'Ohm\'s law'], correctAnswer: 1 },
      { id: 8, question: 'de Broglie wavelength is associated with:', options: ['Electromagnetic waves', 'Sound waves', 'Matter waves', 'Mechanical waves'], correctAnswer: 2 },
      { id: 9, question: 'The work function of a metal is measured in:', options: ['Joule', 'Electron volt', 'Watt', 'Coulomb'], correctAnswer: 1 },
      { id: 10, question: 'Which device converts light energy to electrical energy?', options: ['LED', 'Solar cell', 'Transformer', 'Generator'], correctAnswer: 1 }
    ],

    // ACADEMICS - 12th Grade Chemistry
    'Chemistry-12th': [
      { id: 1, question: 'What is the coordination number of an atom in FCC structure?', options: ['6', '8', '12', '4'], correctAnswer: 2 },
      { id: 2, question: 'Raoult\'s law is applicable to:', options: ['Ideal solutions', 'Non-ideal solutions', 'Electrolytes', 'Gases'], correctAnswer: 0 },
      { id: 3, question: 'The IUPAC name of CH₃COOH is:', options: ['Ethanoic acid', 'Methanoic acid', 'Propanoic acid', 'Acetic acid'], correctAnswer: 0 },
      { id: 4, question: 'Which type of isomerism is shown by [Co(NH₃)₆]Cl₃?', options: ['Geometrical', 'Optical', 'Ionization', 'Linkage'], correctAnswer: 2 },
      { id: 5, question: 'The catalyst used in Haber\'s process is:', options: ['Vanadium pentoxide', 'Iron', 'Platinum', 'Nickel'], correctAnswer: 1 },
      { id: 6, question: 'Which is the strongest reducing agent among alkali metals?', options: ['Li', 'Na', 'K', 'Cs'], correctAnswer: 0 },
      { id: 7, question: 'The hybridization of carbon in benzene is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], correctAnswer: 1 },
      { id: 8, question: 'Wurtz reaction is used to prepare:', options: ['Alkenes', 'Alkanes', 'Alkynes', 'Alcohols'], correctAnswer: 1 },
      { id: 9, question: 'Which polymer is used in making non-stick cookware?', options: ['PVC', 'Teflon', 'Bakelite', 'Nylon'], correctAnswer: 1 },
      { id: 10, question: 'The EMF of a standard hydrogen electrode is:', options: ['1 V', '0.5 V', '0 V', '-1 V'], correctAnswer: 2 }
    ],

    // ACADEMICS - 12th Grade Mathematics
    'Mathematics-12th': [
      { id: 1, question: 'The derivative of sin(x) is:', options: ['-cos(x)', 'cos(x)', 'tan(x)', '-sin(x)'], correctAnswer: 1 },
      { id: 2, question: 'The integral of 1/x is:', options: ['x', 'ln|x| + C', '1/x² + C', 'e^x + C'], correctAnswer: 1 },
      { id: 3, question: 'A matrix is singular if its determinant is:', options: ['1', '-1', '0', 'Infinity'], correctAnswer: 2 },
      { id: 4, question: 'The inverse of a function exists if it is:', options: ['One-one', 'Onto', 'Bijective', 'Continuous'], correctAnswer: 2 },
      { id: 5, question: 'The dot product of two perpendicular vectors is:', options: ['1', '-1', '0', 'Undefined'], correctAnswer: 2 },
      { id: 6, question: 'What is the limit of sin(x)/x as x approaches 0?', options: ['0', '1', 'Infinity', 'Does not exist'], correctAnswer: 1 },
      { id: 7, question: 'The order of the differential equation d²y/dx² + (dy/dx)³ = 0 is:', options: ['1', '2', '3', '4'], correctAnswer: 1 },
      { id: 8, question: 'The area of a region bounded by curves is found using:', options: ['Differentiation', 'Integration', 'Limits', 'Matrices'], correctAnswer: 1 },
      { id: 9, question: 'If A is a 3x3 matrix, then |adj(A)| equals:', options: ['|A|', '|A|²', '|A|³', '1/|A|'], correctAnswer: 1 },
      { id: 10, question: 'The maximum value of sin(x) + cos(x) is:', options: ['1', '√2', '2', '√3'], correctAnswer: 1 }
    ],

    // ACADEMICS - 12th Grade Biology
    'Biology-12th': [
      { id: 1, question: 'The site of transcription in eukaryotes is:', options: ['Cytoplasm', 'Nucleus', 'Ribosome', 'Mitochondria'], correctAnswer: 1 },
      { id: 2, question: 'Which enzyme is responsible for DNA replication?', options: ['RNA polymerase', 'DNA polymerase', 'Ligase', 'Helicase'], correctAnswer: 1 },
      { id: 3, question: 'The structural gene is regulated by:', options: ['Operator', 'Promoter', 'Operon', 'Regulator gene'], correctAnswer: 0 },
      { id: 4, question: 'Hardy-Weinberg equilibrium is related to:', options: ['Evolution', 'Population genetics', 'Molecular biology', 'Ecology'], correctAnswer: 1 },
      { id: 5, question: 'Which technique is used for DNA amplification?', options: ['Gel electrophoresis', 'PCR', 'Hybridization', 'Blotting'], correctAnswer: 1 },
      { id: 6, question: 'Restriction enzymes are used in:', options: ['Protein synthesis', 'Genetic engineering', 'Cell division', 'Respiration'], correctAnswer: 1 },
      { id: 7, question: 'The central dogma of molecular biology is:', options: ['DNA → RNA → Protein', 'RNA → DNA → Protein', 'Protein → RNA → DNA', 'DNA → Protein → RNA'], correctAnswer: 0 },
      { id: 8, question: 'ELISA is used for:', options: ['DNA detection', 'Antigen-antibody detection', 'Cell counting', 'Chromosome mapping'], correctAnswer: 1 },
      { id: 9, question: 'Bt cotton is resistant to:', options: ['Fungi', 'Bacteria', 'Insects', 'Viruses'], correctAnswer: 2 },
      { id: 10, question: 'The first transgenic animal was:', options: ['Sheep', 'Mouse', 'Cow', 'Pig'], correctAnswer: 1 }
    ],

    // COMPUTER SCIENCE - Data Structures
    'Data Structures': [
      { id: 1, question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 1 },
      { id: 2, question: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Array', 'Tree'], correctAnswer: 1 },
      { id: 3, question: 'In a binary tree, each node can have at most how many children?', options: ['1', '2', '3', 'Unlimited'], correctAnswer: 1 },
      { id: 4, question: 'What is the worst-case time complexity of quicksort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 2 },
      { id: 5, question: 'Which traversal method uses a stack?', options: ['BFS', 'DFS', 'Level Order', 'Spiral'], correctAnswer: 1 },
      { id: 6, question: 'What is a hash collision?', options: ['Two keys mapping to same index', 'Hash function error', 'Memory overflow', 'Key not found'], correctAnswer: 0 },
      { id: 7, question: 'The height of a balanced binary tree with n nodes is:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1 },
      { id: 8, question: 'Which data structure is used in BFS?', options: ['Stack', 'Queue', 'Heap', 'Tree'], correctAnswer: 1 },
      { id: 9, question: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 2 },
      { id: 10, question: 'A linked list is a:', options: ['Linear data structure', 'Non-linear data structure', 'Primitive data type', 'None of these'], correctAnswer: 0 }
    ],

    // COMPUTER SCIENCE - Algorithms
    'Algorithms': [
      { id: 1, question: 'What is the best-case time complexity of bubble sort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 0 },
      { id: 2, question: 'Which algorithm uses divide and conquer?', options: ['Bubble sort', 'Merge sort', 'Selection sort', 'Insertion sort'], correctAnswer: 1 },
      { id: 3, question: 'Dijkstra\'s algorithm is used for:', options: ['Sorting', 'Shortest path', 'Pattern matching', 'Searching'], correctAnswer: 1 },
      { id: 4, question: 'What is the time complexity of linear search?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctAnswer: 2 },
      { id: 5, question: 'Which sorting algorithm is most efficient for small datasets?', options: ['Quick sort', 'Merge sort', 'Insertion sort', 'Heap sort'], correctAnswer: 2 },
      { id: 6, question: 'Dynamic programming is based on:', options: ['Greedy approach', 'Divide and conquer', 'Memoization', 'Backtracking'], correctAnswer: 2 },
      { id: 7, question: 'What does NP stand for in computational complexity?', options: ['Not Polynomial', 'Nondeterministic Polynomial', 'New Problem', 'Non-Practical'], correctAnswer: 1 },
      { id: 8, question: 'Which algorithm is used for finding minimum spanning tree?', options: ['Dijkstra', 'Kruskal', 'Floyd-Warshall', 'Bellman-Ford'], correctAnswer: 1 },
      { id: 9, question: 'The Tower of Hanoi problem can be solved using:', options: ['Iteration', 'Recursion', 'Greedy method', 'Dynamic programming'], correctAnswer: 1 },
      { id: 10, question: 'What is the average case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 1 }
    ],

    // COMPUTER SCIENCE - Database Management
    'Database Management': [
      { id: 1, question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'], correctAnswer: 0 },
      { id: 2, question: 'Which key uniquely identifies a record in a table?', options: ['Foreign Key', 'Primary Key', 'Candidate Key', 'Super Key'], correctAnswer: 1 },
      { id: 3, question: 'What is normalization in databases?', options: ['Deleting data', 'Organizing data to reduce redundancy', 'Encrypting data', 'Backing up data'], correctAnswer: 1 },
      { id: 4, question: 'Which SQL command is used to retrieve data?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 2 },
      { id: 5, question: 'ACID properties ensure:', options: ['Data security', 'Transaction reliability', 'Fast queries', 'Data compression'], correctAnswer: 1 },
      { id: 6, question: 'What is a foreign key?', options: ['A unique identifier', 'A reference to primary key in another table', 'An encrypted key', 'A duplicate key'], correctAnswer: 1 },
      { id: 7, question: 'Which normal form eliminates transitive dependency?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctAnswer: 2 },
      { id: 8, question: 'What does DDL stand for?', options: ['Data Definition Language', 'Data Delete Language', 'Database Definition Language', 'Data Description Language'], correctAnswer: 0 },
      { id: 9, question: 'JOIN operation is used to:', options: ['Delete records', 'Combine rows from two tables', 'Update records', 'Create tables'], correctAnswer: 1 },
      { id: 10, question: 'Which is NOT a type of database model?', options: ['Relational', 'Hierarchical', 'Network', 'Sequential'], correctAnswer: 3 }
    ],

    // COMPUTER SCIENCE - Python
    'Python': [
      { id: 1, question: 'What is the correct file extension for Python files?', options: ['.python', '.py', '.pt', '.pyt'], correctAnswer: 1 },
      { id: 2, question: 'Which keyword is used to define a function in Python?', options: ['function', 'def', 'func', 'define'], correctAnswer: 1 },
      { id: 3, question: 'What is the output of print(2 ** 3)?', options: ['5', '6', '8', '9'], correctAnswer: 2 },
      { id: 4, question: 'Which of these is a mutable data type in Python?', options: ['tuple', 'string', 'list', 'int'], correctAnswer: 2 },
      { id: 5, question: 'What does PEP stand for?', options: ['Python Enhancement Proposal', 'Python Execution Plan', 'Python Error Protocol', 'Python Extension Package'], correctAnswer: 0 },
      { id: 6, question: 'Which method is used to add an element to a list?', options: ['add()', 'append()', 'insert()', 'push()'], correctAnswer: 1 },
      { id: 7, question: 'What is the correct syntax for a comment in Python?', options: ['// comment', '/* comment */', '# comment', '<!-- comment -->'], correctAnswer: 2 },
      { id: 8, question: 'Which of these is used for exception handling?', options: ['if-else', 'try-except', 'switch-case', 'while-do'], correctAnswer: 1 },
      { id: 9, question: 'What is the output of len([1, 2, 3])?', options: ['1', '2', '3', '4'], correctAnswer: 2 },
      { id: 10, question: 'Which operator is used for floor division?', options: ['/', '//', '%', '**'], correctAnswer: 1 }
    ],

    // COMPUTER SCIENCE - Java
    'Java': [
      { id: 1, question: 'What is the extension of Java bytecode files?', options: ['.java', '.class', '.jar', '.exe'], correctAnswer: 1 },
      { id: 2, question: 'Which keyword is used to inherit a class in Java?', options: ['inherits', 'extends', 'implements', 'super'], correctAnswer: 1 },
      { id: 3, question: 'What is the size of int in Java?', options: ['2 bytes', '4 bytes', '8 bytes', '16 bytes'], correctAnswer: 1 },
      { id: 4, question: 'Which method is the entry point of a Java program?', options: ['start()', 'run()', 'main()', 'execute()'], correctAnswer: 2 },
      { id: 5, question: 'What is encapsulation?', options: ['Wrapping data and code together', 'Multiple inheritance', 'Method overloading', 'Type casting'], correctAnswer: 0 },
      { id: 6, question: 'Which package is automatically imported in Java?', options: ['java.util', 'java.io', 'java.lang', 'java.net'], correctAnswer: 2 },
      { id: 7, question: 'What is the default value of a boolean variable?', options: ['true', 'false', '0', 'null'], correctAnswer: 1 },
      { id: 8, question: 'Which keyword is used to prevent method overriding?', options: ['static', 'final', 'abstract', 'const'], correctAnswer: 1 },
      { id: 9, question: 'What does JVM stand for?', options: ['Java Virtual Machine', 'Java Variable Method', 'Java Version Manager', 'Java Visual Mode'], correctAnswer: 0 },
      { id: 10, question: 'Which collection does not allow duplicate elements?', options: ['List', 'Set', 'Map', 'Queue'], correctAnswer: 1 }
    ],

    // GOVERNMENT EXAMS - UPSC Civil Services
    'UPSC Civil Services': [
      { id: 1, question: 'The Constitution of India was adopted on:', options: ['26 Jan 1950', '26 Nov 1949', '15 Aug 1947', '26 Jan 1949'], correctAnswer: 1 },
      { id: 2, question: 'Who is known as the Father of the Indian Constitution?', options: ['Mahatma Gandhi', 'B.R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Patel'], correctAnswer: 1 },
      { id: 3, question: 'The President of India is elected by:', options: ['Direct election', 'Electoral College', 'Parliament', 'Prime Minister'], correctAnswer: 1 },
      { id: 4, question: 'Which article of the Constitution deals with Right to Education?', options: ['Article 19', 'Article 21A', 'Article 32', 'Article 14'], correctAnswer: 1 },
      { id: 5, question: 'The term of Lok Sabha is:', options: ['4 years', '5 years', '6 years', '7 years'], correctAnswer: 1 },
      { id: 6, question: 'Which is the highest civilian award in India?', options: ['Padma Bhushan', 'Bharat Ratna', 'Padma Vibhushan', 'Padma Shri'], correctAnswer: 1 },
      { id: 7, question: 'The Supreme Court of India was established in:', options: ['1947', '1949', '1950', '1952'], correctAnswer: 2 },
      { id: 8, question: 'Who appoints the Chief Justice of India?', options: ['Prime Minister', 'President', 'Parliament', 'Law Minister'], correctAnswer: 1 },
      { id: 9, question: 'The Planning Commission was replaced by:', options: ['NITI Aayog', 'Finance Commission', 'Election Commission', 'Law Commission'], correctAnswer: 0 },
      { id: 10, question: 'Which state has the largest number of Lok Sabha seats?', options: ['Maharashtra', 'Bihar', 'Uttar Pradesh', 'West Bengal'], correctAnswer: 2 }
    ],

    // GOVERNMENT EXAMS - SSC CGL
    'SSC CGL': [
      { id: 1, question: 'Who was the first President of India?', options: ['Dr. Rajendra Prasad', 'Dr. S. Radhakrishnan', 'Jawaharlal Nehru', 'Sardar Patel'], correctAnswer: 0 },
      { id: 2, question: 'The Reserve Bank of India was nationalized in:', options: ['1947', '1949', '1950', '1935'], correctAnswer: 1 },
      { id: 3, question: 'Which river is known as the Sorrow of Bihar?', options: ['Ganga', 'Kosi', 'Yamuna', 'Gandak'], correctAnswer: 1 },
      { id: 4, question: 'The Battle of Plassey was fought in:', options: ['1757', '1764', '1765', '1772'], correctAnswer: 0 },
      { id: 5, question: 'Who is known as the Iron Man of India?', options: ['Mahatma Gandhi', 'Sardar Patel', 'Subhas Chandra Bose', 'Bhagat Singh'], correctAnswer: 1 },
      { id: 6, question: 'The headquarters of RBI is located in:', options: ['New Delhi', 'Kolkata', 'Mumbai', 'Chennai'], correctAnswer: 2 },
      { id: 7, question: 'Who wrote the National Anthem of India?', options: ['Bankim Chandra Chatterjee', 'Rabindranath Tagore', 'Sarojini Naidu', 'Muhammad Iqbal'], correctAnswer: 1 },
      { id: 8, question: 'The first Five Year Plan was launched in:', options: ['1947', '1950', '1951', '1956'], correctAnswer: 2 },
      { id: 9, question: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 1 },
      { id: 10, question: 'The Red Fort was built by:', options: ['Akbar', 'Shah Jahan', 'Aurangzeb', 'Humayun'], correctAnswer: 1 }
    ]
  };

  // Get questions based on selected subject and configuration
  const getQuizQuestions = (): QuizQuestion[] => {
    // Build the key based on subject and subcategory (grade level)
    let key = selectedSubject;

    // For academic subjects, append the grade level
    if (selectedCategory === 'academics') {
      if (['Physics', 'Chemistry', 'Mathematics', 'Biology'].includes(selectedSubject)) {
        key = `${selectedSubject}-${selectedSubcategory}`;
      }
    }

    const availableQuestions = questionBank[key] || questionBank['Data Structures'] || [];
    const requestedCount = parseInt(numQuestions) || 10;

    // Return requested number of questions (cycle if needed)
    const questions: QuizQuestion[] = [];
    for (let i = 0; i < requestedCount; i++) {
      questions.push(availableQuestions[i % availableQuestions.length]);
    }

    return questions.map((q, idx) => ({ ...q, id: idx + 1 }));
  };

  // Use loaded quiz if available, otherwise use hardcoded questions
  const quizQuestions = loadedQuiz?.questions?.map((q: any, idx: number) => ({
    id: q.id || idx + 1,
    question: q.question_text || q.question,
    options: q.options,
    correctAnswer: q.correct_answer
  })) || getQuizQuestions();

  console.log('Current quiz questions:', quizQuestions);
  console.log('Loaded quiz:', loadedQuiz);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep('subcategory');
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setCurrentStep('subject');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentStep('configure');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedSubject || !numQuestions || parseInt(numQuestions) < 5 || parseInt(numQuestions) > 100) {
      return;
    }

    try {
      setIsGeneratingQuiz(true);
      const subjectId = parseInt(selectedSubject);

      console.log('Generating quiz with params:', {
        subjectId,
        difficulty,
        numQuestions: parseInt(numQuestions)
      });

      const result = await quizAPI.generateQuizFromSubject(
        subjectId,
        difficulty,
        parseInt(numQuestions)
      );

      console.log('Quiz generation result:', result);
      console.log('Quiz ID:', result.quiz_id);

      // Load the generated quiz
      if (result.quiz_id) {
        // Before loading a new quiz, check if another is in progress
        const ongoingQuiz = loadQuizState();
        if (ongoingQuiz) {
          alert('You have an ongoing quiz. Please complete it before starting a new one.');
          // Optionally, navigate to the ongoing quiz
          // navigate(`/take-quiz/${ongoingQuiz.quizId}`);
          return;
        }
        console.log('Loading quiz with ID:', result.quiz_id);
        await loadQuizById(result.quiz_id);
      } else {
        throw new Error('No quiz_id returned from server');
      }
    } catch (error: any) {
      console.error('Failed to generate quiz:', error);
      alert(`Failed to generate quiz: ${error.message}`);
      setCurrentStep('configure'); // Go back to configure on error
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handlePauseQuiz = () => {
    if (!loadedQuiz) return;

    saveQuizState({
      quizId: loadedQuiz.id,
      currentQuestionIndex,
      selectedAnswers,
      remainingTime: timeLeft,
      attemptId,
    });

    setIsPaused(true);
    // onBack(); // or navigate to a specific "paused" screen
    navigate('/');
    alert('Quiz paused. You can resume it from the homepage.');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!loadedQuiz || !attemptId) return;
    const answers = Object.keys(selectedAnswers).map(questionIndex => ({
      question_id: quizQuestions[parseInt(questionIndex)].id,
      selected_option: selectedAnswers[parseInt(questionIndex)]
    }));

    try {
      const results = await quizAPI.submitQuiz(attemptId, answers);
      setQuizResults(results);
      if (results.streak_lost !== undefined) {
        setStreakInfo({ lost: results.streak_lost, current: results.current_streak });
      }
      setCurrentStep('results');
      setQuizCompleted(true);
      clearQuizState(); // Quiz finished, clear the saved state
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleBackNavigation = () => {
    if (currentStep === 'category') {
      onBack();
    } else if (currentStep === 'subcategory') {
      setCurrentStep('category');
      setSelectedCategory('');
    } else if (currentStep === 'subject') {
      setCurrentStep('subcategory');
      setSelectedSubcategory('');
    } else if (currentStep === 'configure') {
      setCurrentStep('subject');
      setSelectedSubject('');
    } else if (currentStep === 'quiz') {
      setCurrentStep('configure');
    } else if (currentStep === 'results') {
      onBack();
    }
  };

  // Recommended Quizzes View
  const renderRecommendedQuizzes = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto mb-16"
    >
      <div className="text-center mb-12">
        <h1 className="text-[#003B73]">Recommended For You</h1>
        <p className="text-[#003B73]/70 max-w-2xl mx-auto">
          Quizzes tailored to your preferences and recent activity
        </p>
      </div>
      {recommendedQuizzes.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          {recommendedQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              onClick={() => loadQuizById(quiz.id)}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#003B73]/10 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
              whileHover={{ y: -8, scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative z-10">
                <h2 className="text-[#003B73] text-center mb-3">{quiz.title}</h2>
                <p className="text-[#003B73]/70 text-center mb-4">
                  {quiz.category_details?.name} - {quiz.difficulty}
                </p>
                <div className="flex justify-center">
                  <motion.div
                    className="flex items-center gap-2 text-[#003B73]"
                    whileHover={{ x: 5 }}
                  >
                    <span>Take Quiz</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#003B73]/70">
            No recommendations yet. Set your preferred categories in your profile for personalized suggestions!
          </p>
        </div>
      )}
    </motion.div>
  );

  // Category Selection View
  const renderCategorySelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto"
    >
      <div className="text-center mb-12">
        <motion.div
          className="inline-flex items-center gap-2 mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Target className="w-8 h-8 text-[#003B73]" />
          <h1 className="text-[#003B73]">Choose Your Category</h1>
        </motion.div>
        <p className="text-[#003B73]/70 max-w-2xl mx-auto">
          Select a category to begin your learning journey
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-3 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B73] mx-auto"></div>
            <p className="mt-4 text-[#003B73]/70">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-[#003B73]/70">No categories available</p>
          </div>
        ) : (
          categories.map((category, index) => {
            // Map icon based on category name
            const getIcon = (name: string) => {
              if (name.toLowerCase().includes('computer') || name.toLowerCase().includes('cs')) return Code2;
              if (name.toLowerCase().includes('government') || name.toLowerCase().includes('exam')) return Briefcase;
              return GraduationCap;
            };
            const IconComponent = getIcon(category.name);

            return (
              <motion.div
                key={category.id}
                onClick={() => handleCategorySelect(category.id.toString())}
                className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-[#003B73]/10 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                whileHover={{ y: -8, scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#003B73]/5 to-[#B9E7FF]/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg mx-auto"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className="w-10 h-10 text-white" />
                  </motion.div>

                  <h2 className="text-[#003B73] text-center mb-3">{category.name}</h2>
                  <p className="text-[#003B73]/70 text-center mb-4">
                    {category.description || 'Explore this category'}
                  </p>

                  <div className="flex justify-center">
                    <motion.div
                      className="flex items-center gap-2 text-[#003B73]"
                      whileHover={{ x: 5 }}
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#003B73]/5 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );

  // Subcategory Selection View
  const renderSubcategorySelection = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-[#003B73] mb-3">Select Level</h1>
          <p className="text-[#003B73]/70">
            Choose your preferred level
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B73] mx-auto"></div>
              <p className="mt-4 text-[#003B73]/70">Loading levels...</p>
            </div>
          ) : levels.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-[#003B73]/70">No levels available for this category</p>
            </div>
          ) : (
            levels.map((level, index) => (
              <motion.div
                key={level.id}
                onClick={() => handleSubcategorySelect(level.id.toString())}
                className="group bg-white/80 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#003B73]/10 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-[#003B73] mb-2">{level.name}</h3>
                    <p className="text-[#003B73]/60">
                      {level.description || 'Explore this level'}
                    </p>
                  </div>
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-[#B9E7FF] to-[#003B73]/20 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="w-6 h-6 text-[#003B73]" />
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  };

  // Subject Selection View
  const renderSubjectSelection = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-[#003B73] mb-3">Choose Subject</h1>
          <p className="text-[#003B73]/70">
            Select a subject to start your quiz
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B73] mx-auto"></div>
              <p className="mt-4 text-[#003B73]/70">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-[#003B73]/70">No subjects available for this level</p>
            </div>
          ) : (
            subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                onClick={() => handleSubjectSelect(subject.id.toString())}
                className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#003B73]/10 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                whileHover={{ y: -5, scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-2xl flex items-center justify-center mb-4 mx-auto"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-[#003B73] text-center mb-2">{subject.name}</h3>
                <p className="text-[#003B73]/60 text-center mb-4">
                  {subject.description || 'Start learning'}
                </p>

                <div className="flex justify-center gap-2">
                  <span className="px-2 py-1 bg-[#DFF4FF] text-[#003B73] rounded-lg border border-[#003B73]/10">
                    Medium
                  </span>
                  <span className="px-2 py-1 bg-[#DFF4FF] text-[#003B73] rounded-lg border border-[#003B73]/10 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    10 min
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  };

  // Quiz Configuration View
  const renderQuizConfig = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-[#003B73] mb-3">Configure Your Quiz</h1>
          <p className="text-[#003B73]/70">
            Customize your quiz settings before you begin
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#003B73]/10 space-y-8">
          {/* Number of Questions */}
          <div>
            <label className="block text-[#003B73] mb-3">Number of Questions (5-100)</label>
            <input
              type="number"
              min="5"
              max="100"
              value={numQuestions}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (parseInt(val) >= 5 && parseInt(val) <= 100)) {
                  setNumQuestions(val);
                }
              }}
              placeholder="Enter number of questions"
              className="w-full px-6 py-4 bg-gradient-to-r from-[#DFF4FF]/50 to-white border-2 border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all text-[#003B73]"
            />
            <p className="text-[#003B73]/60 mt-2">Choose between 5 and 100 questions</p>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-[#003B73] mb-3">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-4 rounded-2xl transition-all ${difficulty === level
                      ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white shadow-lg border-2 border-[#003B73]'
                      : 'bg-white border-2 border-[#003B73]/20 text-[#003B73] hover:border-[#003B73]/40 hover:shadow-md'
                    }`}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {level === 'easy' && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${difficulty === level ? 'bg-white/20' : 'bg-green-100'
                        }`}>
                        <span className={difficulty === level ? 'text-white' : 'text-green-600'}>😊</span>
                      </div>
                    )}
                    {level === 'medium' && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${difficulty === level ? 'bg-white/20' : 'bg-yellow-100'
                        }`}>
                        <span className={difficulty === level ? 'text-white' : 'text-yellow-600'}>🤔</span>
                      </div>
                    )}
                    {level === 'hard' && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${difficulty === level ? 'bg-white/20' : 'bg-red-100'
                        }`}>
                        <span className={difficulty === level ? 'text-white' : 'text-red-600'}>🔥</span>
                      </div>
                    )}
                    <span className="font-medium">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quiz Summary */}
          <div className="p-6 bg-gradient-to-r from-[#DFF4FF]/50 to-white rounded-2xl border-2 border-[#003B73]/10">
            <h4 className="text-[#003B73] mb-4">Quiz Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#003B73]/60">Subject</p>
                  <p className="text-[#003B73]">{selectedSubject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#003B73]/60">Questions</p>
                  <p className="text-[#003B73]">{numQuestions || '10'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#003B73]/60">Difficulty</p>
                  <p className="text-[#003B73]">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#003B73]/60">Estimated Time</p>
                  <p className="text-[#003B73]">{numQuestions ? Math.ceil(parseInt(numQuestions) * 1) : 10} min</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Quiz Button */}
        <div className="flex justify-center mt-8 gap-4">
          <motion.button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz || !numQuestions || parseInt(numQuestions) < 5 || parseInt(numQuestions) > 100}
            className={`flex items-center gap-3 px-10 py-5 rounded-2xl shadow-lg transition-all ${!isGeneratingQuiz && numQuestions && parseInt(numQuestions) >= 5 && parseInt(numQuestions) <= 100
                ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            whileHover={!isGeneratingQuiz && numQuestions && parseInt(numQuestions) >= 5 && parseInt(numQuestions) <= 100 ? { scale: 1.05 } : {}}
            whileTap={!isGeneratingQuiz && numQuestions && parseInt(numQuestions) >= 5 && parseInt(numQuestions) <= 100 ? { scale: 0.95 } : {}}
          >
            {isGeneratingQuiz ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Start Quiz</span>
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Quiz View
  const renderQuiz = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Quiz Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-[#003B73]">{selectedSubject}</h2>
                <p className="text-[#003B73]/60">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#DFF4FF] rounded-xl border border-[#003B73]/10">
                <Clock className="w-5 h-5 text-[#003B73]" />
                <span className="text-[#003B73]">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl shadow-md">
                <Flame className="w-5 h-5 text-white" />
                <span className="text-white">
                  {Object.keys(selectedAnswers).length}/{quizQuestions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#DFF4FF] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#003B73] to-[#0056A8]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-[#003B73]/10 mb-8"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#B9E7FF] to-[#DFF4FF] rounded-lg flex items-center justify-center">
                  <span className="text-[#003B73]">Q{currentQuestionIndex + 1}</span>
                </div>
                <h3 className="text-[#003B73] flex-1">{currentQuestion.question}</h3>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option: string, index: number) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === index;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                        ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] border-[#003B73] text-white shadow-lg'
                        : 'bg-white/50 border-[#003B73]/10 text-[#003B73] hover:border-[#003B73]/30 hover:shadow-md'
                      }`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white bg-white/20' : 'border-[#003B73]/30'
                        }`}>
                        <span className={isSelected ? 'text-white' : 'text-[#003B73]/60'}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span>{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${currentQuestionIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-[#003B73] border-2 border-[#003B73]/20 hover:shadow-lg'
              }`}
            whileHover={currentQuestionIndex > 0 ? { scale: 1.05 } : {}}
            whileTap={currentQuestionIndex > 0 ? { scale: 0.95 } : {}}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              onClick={handlePauseQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
            {currentQuestionIndex === quizQuestions.length - 1 ? (
              <motion.button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length !== quizQuestions.length}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg transition-all ${Object.keys(selectedAnswers).length === quizQuestions.length
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                whileHover={Object.keys(selectedAnswers).length === quizQuestions.length ? { scale: 1.05 } : {}}
                whileTap={Object.keys(selectedAnswers).length === quizQuestions.length ? { scale: 0.95 } : {}}
              >
                <CheckCircle2 className="w-5 h-5" />
                Submit Quiz
              </motion.button>
            ) : (
              <motion.button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10">
          <h4 className="text-[#003B73] mb-4">Question Navigator</h4>
          <div className="grid grid-cols-10 gap-2">
            {quizQuestions.map((_: any, index: number) => {
              const isAnswered = selectedAnswers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <motion.button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${isCurrent
                      ? 'bg-gradient-to-br from-[#003B73] to-[#0056A8] border-[#003B73] text-white shadow-md'
                      : isAnswered
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-white border-[#003B73]/20 text-[#003B73]/60 hover:border-[#003B73]/40'
                    }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {index + 1}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  // Results View
  const renderResults = () => {
    if (!quizResults) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#003B73] border-t-transparent rounded-full mb-4"
          />
          <p className="text-[#003B73] text-lg">Calculating your results...</p>
        </div>
      );
    }

    const { attempt, quiz } = quizResults;
    const isPassed = attempt.score_percentage >= 60;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Results Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-2xl ${isPassed
                ? 'bg-gradient-to-br from-green-400 to-green-600'
                : 'bg-gradient-to-br from-orange-400 to-orange-600'
              }`}>
              {isPassed ? (
                <Trophy className="w-16 h-16 text-white" />
              ) : (
                <Target className="w-16 h-16 text-white" />
              )}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#003B73] mb-3"
          >
            {isPassed ? 'Congratulations!' : 'Good Effort!'}
          </motion.h1>

          {streakInfo && streakInfo.lost && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[#003B73]/70">
              You lost your previous streak, but you've started a new one of {streakInfo.current} day!
            </motion.p>
          )}
          {streakInfo && !streakInfo.lost && streakInfo.current > 1 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[#003B73]/70">
              You've extended your streak to {streakInfo.current} days! Keep it up!
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#003B73]/70"
          >
            {isPassed
              ? 'You passed the quiz! Keep up the excellent work.'
              : 'Keep practicing to improve your score.'}
          </motion.p>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#003B73] mb-2">Score</h3>
            <p className="text-4xl text-[#003B73]">{attempt.formatted_score_percentage}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#003B73] mb-2">Correct Answers</h3>
            <p className="text-4xl text-[#003B73]">{attempt.correct_answers}/{attempt.total_questions}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-[#003B73]/10 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#003B73] mb-2">XP Earned</h3>
            <p className="text-4xl text-[#003B73]">+{attempt.xp_earned}</p>
          </motion.div>
        </div>

        {/* Review Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-[#003B73]/10 mb-8"
        >
          <h3 className="text-[#003B73] mb-6">Answer Review</h3>
          <div className="space-y-4">
            {quiz.questions.map((question: any, index: number) => {
              const userAnswer = attempt.answers.find((a: any) => a.question === question.id);
              const isCorrect = userAnswer?.selected_option === question.correct_answer;

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-xl border-2 ${isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#003B73] mb-2">
                        <span className="font-semibold">Q{index + 1}:</span> {question.question_text}
                      </p>
                      <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Your answer: {userAnswer ? question.options[userAnswer.selected_option] : "Not answered"}
                      </p>
                      {!isCorrect && (
                        <p className="text-green-700 mt-1">
                          Correct answer: {question.options[question.correct_answer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <motion.button
            onClick={() => {
              // Reset state for a new quiz
              setCurrentStep('category'); // Go back to the beginning
              setSelectedCategory('');
              setSelectedSubcategory('');
              setSelectedSubject('');
              setLoadedQuiz(null);
              setQuizResults(null);
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
              setSelectedAnswers({});
              clearQuizState(); // Make sure no state persists
            }}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Target className="w-5 h-5" />
            Try Another Quiz
          </motion.button>

          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#003B73] text-[#003B73] rounded-2xl shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF]">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#003B73]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border border-[#003B73]/10 hover:shadow-lg transition-all text-[#003B73]"
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#B9E7FF] to-[#003B73] rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[#003B73]">Take Quiz</div>
                <p className="text-[#003B73]/60">Test Your Knowledge</p>
              </div>
            </div>

            {currentStep !== 'quiz' && currentStep !== 'results' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white">Ready to Learn</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {isLoadingQuiz ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#003B73] border-t-transparent rounded-full mb-4"
              />
              <p className="text-[#003B73] text-lg">Loading your quiz...</p>
            </div>
          ) : (
            <>
              {currentStep === 'category' && recommendedQuizzes.length > 0 && renderRecommendedQuizzes()}
              {currentStep === 'category' && renderCategorySelection()}
              {currentStep === 'subcategory' && renderSubcategorySelection()}
              {currentStep === 'subject' && renderSubjectSelection()}
              {currentStep === 'configure' && renderQuizConfig()}
              {currentStep === 'quiz' && renderQuiz()}
              {currentStep === 'results' && renderResults()}
            </>
          )}
        </AnimatePresence>
      </main>    </div>
  );
}
