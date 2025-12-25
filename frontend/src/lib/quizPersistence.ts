// src/lib/quizPersistence.ts

export interface QuizState {
  quizId: number;
  currentQuestionIndex: number;
  selectedAnswers: { [key: number]: number };
  remainingTime: number;
  attemptId: number | null;
}

const ONGOING_QUIZ_KEY = 'ongoingQuiz';

export const saveQuizState = (state: QuizState): void => {
  try {
    const stateJson = JSON.stringify(state);
    localStorage.setItem(ONGOING_QUIZ_KEY, stateJson);
  } catch (error) {
    console.error('Error saving quiz state to localStorage:', error);
  }
};

export const loadQuizState = (): QuizState | null => {
  try {
    const stateJson = localStorage.getItem(ONGOING_QUIZ_KEY);
    if (stateJson === null) {
      return null;
    }
    return JSON.parse(stateJson) as QuizState;
  } catch (error) {
    console.error('Error loading quiz state from localStorage:', error);
    return null;
  }
};

export const clearQuizState = (): void => {
  try {
    localStorage.removeItem(ONGOING_QUIZ_KEY);
  } catch (error) {
    console.error('Error clearing quiz state from localStorage:', error);
  }
};
