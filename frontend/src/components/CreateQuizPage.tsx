import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Upload,
  FileText,
  Brain,
  Settings,
  Zap,
  CheckCircle,
  X,
  Loader2,
  Sparkles,
  Book,
  Target,
  AlertCircle,
  UploadCloud // Added for FileUploadQuizPage functionality
} from 'lucide-react';
import { quizAPI } from '../services/api';
import { useDropzone } from 'react-dropzone'; // Added for FileUploadQuizPage functionality

interface CreateQuizPageProps {
  onBack: () => void;
  onNavigateToTakeQuiz: (quizId: number) => void;
}

interface GeneratedQuiz {
  id: number;
  title: string;
  questions_count: number;
  difficulty: string;
}

export function CreateQuizPage({ onBack, onNavigateToTakeQuiz }: CreateQuizPageProps) {
  const [step, setStep] = useState<'upload' | 'configure' | 'generating' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false' | 'mixed'>('multiple-choice');
  const [error, setError] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // States for file upload from FileUploadQuizPage
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setFileError(null);
    setSelectedFile(acceptedFiles[0]); // Set selectedFile for compatibility with existing logic
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setFileError('File is larger than 50MB');
      } else {
        setFileError(rejection.errors[0].message);
      }
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFiles([]); // Clear the files array
  };

  const handleContinue = async () => {
    if (step === 'upload' && selectedFile) {
      setStep('configure');
      setError(null);
    } else if (step === 'configure') {
      if (!selectedFile) {
        setError('Please upload a file first');
        return;
      }

      const questionsCount = parseInt(numQuestions);
      if (isNaN(questionsCount) || questionsCount < 1 || questionsCount > 100) {
        setError('Please enter a valid number of questions (1-100)');
        return;
      }

      setStep('generating');
      setError(null);
      setIsGenerating(true);
      setIsUploading(true); // Set uploading state

      try {
        const result = await quizAPI.generateQuizFromFile(selectedFile, {
          title: quizTitle || `Quiz from ${selectedFile.name}`,
          num_questions: questionsCount,
          difficulty: difficulty
        });

        console.log('Quiz generation result:', result);
        console.log('Quiz ID from result:', result.quiz_id, 'Type:', typeof result.quiz_id);

        setGeneratedQuiz({
          id: result.quiz_id,
          title: result.title,
          questions_count: result.questions_count,
          difficulty: difficulty
        });
        setStep('complete');
      } catch (err: any) {
        console.error('Quiz generation error:', err);
        setError(err.message || 'Failed to generate quiz. Please try again.');
        setFileError(err.message || 'Failed to generate quiz from file.'); // Set file-specific error
        setStep('configure');
      } finally {
        setIsGenerating(false);
        setIsUploading(false); // Reset uploading state
      }
    }
  };

  const handleCreateAnother = () => {
    setStep('upload');
    setSelectedFile(null);
    setQuizTitle('');
    setNumQuestions('10');
    setDifficulty('medium');
    setError(null);
    setGeneratedQuiz(null);
    setFiles([]); // Clear files
    setFileError(null); // Clear file error
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DFF4FF] to-[#B9E7FF]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#003B73]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md border border-[#003B73]/10 hover:shadow-lg transition-all text-[#003B73]"
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
            <div className="text-[#003B73] text-xl font-semibold">Create AI-Powered Quiz</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === 'upload' ? 'bg-gradient-to-br from-[#003B73] to-[#0056A8] text-white shadow-lg' :
                ['configure', 'generating', 'complete'].includes(step) ? 'bg-green-500 text-white' :
                  'bg-white border-2 border-[#003B73]/20 text-[#003B73]/40'
                }`}>
                {['configure', 'generating', 'complete'].includes(step) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <span className={`hidden md:block ${step === 'upload' ? 'text-[#003B73]' : 'text-[#003B73]/60'}`}>
                Upload Material
              </span>
            </div>

            <div className="w-16 h-1 bg-[#003B73]/20 rounded-full">
              <div className={`h-full bg-gradient-to-r from-[#003B73] to-[#0056A8] rounded-full transition-all ${['configure', 'generating', 'complete'].includes(step) ? 'w-full' : 'w-0'
                }`} />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === 'configure' ? 'bg-gradient-to-br from-[#003B73] to-[#0056A8] text-white shadow-lg' :
                ['generating', 'complete'].includes(step) ? 'bg-green-500 text-white' :
                  'bg-white border-2 border-[#003B73]/20 text-[#003B73]/40'
                }`}>
                {['generating', 'complete'].includes(step) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Settings className="w-6 h-6" />
                )}
              </div>
              <span className={`hidden md:block ${step === 'configure' ? 'text-[#003B73]' : 'text-[#003B73]/60'}`}>
                Configure Quiz
              </span>
            </div>

            <div className="w-16 h-1 bg-[#003B73]/20 rounded-full">
              <div className={`h-full bg-gradient-to-r from-[#003B73] to-[#0056A8] rounded-full transition-all ${['complete'].includes(step) ? 'w-full' : 'w-0'
                }`} />
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === 'complete' ? 'bg-green-500 text-white shadow-lg' :
                step === 'generating' ? 'bg-gradient-to-br from-[#003B73] to-[#0056A8] text-white shadow-lg' :
                  'bg-white border-2 border-[#003B73]/20 text-[#003B73]/40'
                }`}>
                <Zap className="w-6 h-6" />
              </div>
              <span className={`hidden md:block ${['generating', 'complete'].includes(step) ? 'text-[#003B73]' : 'text-[#003B73]/60'}`}>
                Generate Quiz
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-[#003B73] text-2xl mb-2">Upload Your Study Material</h2>
                <p className="text-[#003B73]/70">
                  Upload documents, notes, or any learning material and our AI will generate a quiz for you.
                  <br />
                  <span className="font-semibold">Note:</span> Quizzes generated this way are for practice and will not affect your profile stats, XP, or rank.
                </p>
              </div>

              {/* File Upload Area - using react-dropzone */}
              <div
                {...getRootProps()}
                className={`p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isDragActive ? 'border-[#003B73] bg-[#DFF4FF]' : 'border-[#003B73]/30 hover:border-[#003B73]/50'
                  }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="w-16 h-16 mx-auto text-[#003B73]/50 mb-4" />
                {isDragActive ? (
                  <p className="text-[#003B73]">Drop the files here ...</p>
                ) : (
                  <p className="text-[#003B73]">Drag & drop a file here, or click to select a file</p>
                )}
                <p className="text-sm text-[#003B73]/60 mt-2">Supported formats: PDF, DOCX, TXT. Max file size: 50MB.</p>
              </div>

              {files.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[#003B73]">Selected File:</h3>
                  <div className="flex items-center justify-center gap-4 p-4 mt-2 bg-white/50 rounded-xl border border-[#003B73]/10">
                    <FileText className="w-6 h-6 text-[#003B73]" />
                    <span className="text-[#003B73]">{files[0].name}</span>
                    <button onClick={() => setFiles([])}>
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              )}

              {fileError && <p className="text-red-500 mt-4">{fileError}</p>}


              {/* Continue Button */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <button
                    onClick={handleContinue}
                    className="w-full py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Continue to Configuration
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'configure' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-[#003B73] text-2xl mb-2">Configure Your Quiz</h2>
                <p className="text-[#003B73]/70">
                  Customize the quiz parameters to match your learning goals
                </p>
              </div>

              <div className="space-y-6">
                {/* Quiz Title */}
                <div>
                  <label className="block text-[#003B73] mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter a title for your quiz"
                    className="w-full px-4 py-3.5 bg-gradient-to-r from-[#DFF4FF]/50 to-white border border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all"
                  />
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-[#003B73] mb-2">
                    Number of Questions (1-100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numQuestions}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 100)) {
                        setNumQuestions(val);
                      }
                    }}
                    placeholder="Enter number of questions"
                    className="w-full px-4 py-3.5 bg-gradient-to-r from-[#DFF4FF]/50 to-white border border-[#003B73]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]/30 transition-all"
                  />
                  <p className="text-[#003B73]/60 mt-2">Enter a number between 1 and 100</p>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-[#003B73] mb-3">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-3 rounded-2xl transition-all ${difficulty === level
                          ? 'bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white shadow-lg'
                          : 'bg-white border-2 border-[#003B73]/20 text-[#003B73] hover:border-[#003B73]/40'
                          }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Type - Only MCQ */}
                <div>
                  <label className="block text-[#003B73] mb-3">Question Type</label>
                  <div className="p-4 bg-gradient-to-r from-[#DFF4FF]/50 to-white border-2 border-[#003B73]/20 rounded-2xl text-center">
                    <div className="flex items-center justify-center gap-2 text-[#003B73]">
                      <CheckCircle className="w-5 h-5" />
                      <span>Multiple Choice Questions (MCQ Only)</span>
                    </div>
                    <p className="text-[#003B73]/60 mt-2">All questions will be multiple choice format</p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                  </motion.div>
                )}

                {/* Generate Button */}
                <div className="pt-4">
                  <button
                    onClick={handleContinue}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="w-5 h-5" />
                    <span>Generate Quiz with AI</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 bg-gradient-to-br from-[#003B73] to-[#0056A8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-[#003B73] text-2xl mb-4">AI is Generating Your Quiz</h2>
              <p className="text-[#003B73]/70 mb-8">
                Analyzing your material and creating personalized questions...
              </p>
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-3 h-3 bg-[#003B73] rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-3 h-3 bg-[#003B73] rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-3 h-3 bg-[#003B73] rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 'complete' && generatedQuiz && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#003B73]/10 p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-[#003B73] text-2xl mb-4">Quiz Generated Successfully!</h2>
              {generatedQuiz.questions_count < parseInt(numQuestions) && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-orange-500 mb-4"
                >
                  Note: Only {generatedQuiz.questions_count} questions were generated out of your request for {parseInt(numQuestions)}.
                </motion.p>
              )}
              <p className="text-[#003B73]/70 mb-8">
                Your AI-powered quiz is ready. {generatedQuiz.questions_count} multiple choice questions have been generated based on your material.
              </p>

              {/* Quiz Summary */}
              <div className="bg-gradient-to-r from-[#DFF4FF]/30 to-white rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                <h3 className="text-[#003B73] mb-4">Quiz Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#003B73]/70">Title:</span>
                    <span className="text-[#003B73]">{generatedQuiz.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#003B73]/70">Questions:</span>
                    <span className="text-[#003B73]">{generatedQuiz.questions_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#003B73]/70">Difficulty:</span>
                    <span className="text-[#003B73] capitalize">{generatedQuiz.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#003B73]/70">Type:</span>
                    <span className="text-[#003B73]">Multiple Choice (MCQ)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#003B73]/70">Quiz ID:</span>
                    <span className="text-[#003B73]">#{generatedQuiz.id}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    if (generatedQuiz) {
                      onNavigateToTakeQuiz(generatedQuiz.id);
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-[#003B73] to-[#0056A8] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  <span>Take Quiz Now</span>
                </button>
                <button
                  onClick={handleCreateAnother}
                  className="px-8 py-4 bg-white border-2 border-[#003B73] text-[#003B73] rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Create Another</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}