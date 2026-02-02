'use client';

import { useState, useEffect, useRef } from 'react';
import { generateQuestion, resetAnswerSequence, type QuizQuestion } from '@/lib/quizGenerator';

interface GameStats {
  correctAnswers: number;
  totalAnswers: number;
  totalTime: number;
  bestLevel: number;
  times: number[];
}

export function QuizGame() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timerInput, setTimerInput] = useState('5');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [maxTime, setMaxTime] = useState(5);
  const [operation, setOperation] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [stats, setStats] = useState<GameStats>({
    correctAnswers: 0,
    totalAnswers: 0,
    totalTime: 0,
    bestLevel: 0,
    times: [],
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const resetQuestionCounter = () => {
    resetAnswerSequence();
  };

  // Инициализация Audio Context при первом взаимодействии
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  // Таймер обратного отсчета
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
      if (timeLeft === 1 || timeLeft === 2) {
        playTickSound();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const playTickSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const startGame = (op: '+' | '-' | '*' | '/') => {
    const time = parseInt(timerInput) || 5;
    
    if (time <= 0) {
      setErrorMessage('Введите положительное число');
      return;
    }

    resetAnswerSequence();
    setOperation(op);
    setGameState('playing');
    setTimeLeft(time);
    setMaxTime(time);
    setErrorMessage('');
    setShowError(false);
    setStats({
      correctAnswers: 0,
      totalAnswers: 0,
      totalTime: 0,
      bestLevel: 0,
      times: [],
    });
    const newQuestion = generateQuestion(op);
    setQuestion(newQuestion);
    setQuestionStartTime(Date.now());
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!question || gameState !== 'playing') return;

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const userIsCorrect = isCorrect === question.isCorrect;

    const newStats = {
      ...stats,
      correctAnswers: userIsCorrect ? stats.correctAnswers + 1 : stats.correctAnswers,
      totalAnswers: stats.totalAnswers + 1,
      totalTime: stats.totalTime + timeTaken,
      bestLevel: userIsCorrect ? Math.max(stats.bestLevel, stats.correctAnswers + 1) : stats.bestLevel,
      times: userIsCorrect ? [...stats.times, timeTaken] : stats.times,
    };

    if (userIsCorrect) {
      // Правильный ответ - новое задание
      setStats(newStats);
      setTimeLeft(maxTime);
      const newQuestion = generateQuestion(operation!);
      setQuestion(newQuestion);
      setQuestionStartTime(Date.now());
    } else {
      // Неправильный ответ - конец игры
      setShowError(true);
      setStats(newStats);
      setTimeout(() => {
        setGameState('gameover');
      }, 500);
    }
  };

  const endGame = () => {
    setGameState('gameover');
  };

  const averageTime = stats.times.length > 0
    ? (stats.totalTime / stats.totalAnswers).toFixed(2)
    : '0.00';

  if (gameState === 'idle') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Тренажер дробей</h1>

          <div className="mb-8">
            <label className="block text-sm text-gray-600 mb-2">Время на ответ (сек)</label>
            <input
              type="number"
              value={timerInput}
              onChange={(e) => setTimerInput(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              min="1"
              max="300"
            />
            {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
          </div>

          <p className="text-gray-600 mb-6">Выберите операцию</p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => startGame('+')}
              className="px-6 py-4 text-3xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              +
            </button>
            <button
              onClick={() => startGame('-')}
              className="px-6 py-4 text-3xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              −
            </button>
            <button
              onClick={() => startGame('*')}
              className="px-6 py-4 text-3xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              ×
            </button>
            <button
              onClick={() => startGame('/')}
              className="px-6 py-4 text-3xl font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              ÷
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-md p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg">
          <h2 className="text-3xl font-bold text-red-600 mb-6">Конец игры!</h2>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Правильных ответов:</span>
              <span className="text-2xl font-bold text-blue-600">{stats.correctAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Всего ответов:</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalAnswers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Среднее время ответа:</span>
              <span className="text-xl font-semibold text-gray-900">{averageTime} сек</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Максимальный уровень:</span>
              <span className="text-2xl font-bold text-green-600">{stats.bestLevel}</span>
            </div>
          </div>

          <button
            onClick={() => setGameState('idle')}
            className="w-full px-6 py-3 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center min-h-screen transition-colors ${
        showError ? 'bg-red-50' : 'bg-white'
      }`}
    >
      <div className="w-full max-w-md p-8">
        {/* Уровень */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">Уровень</p>
          <p className="text-5xl font-bold text-blue-600">{stats.correctAnswers}</p>
        </div>

        {/* Таймер */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 mb-2">Осталось времени</p>
          <p
            className={`text-5xl font-bold ${
              timeLeft <= 2 ? 'text-red-600' : 'text-blue-600'
            }`}
          >
            {timeLeft}
          </p>
        </div>

        {/* Вопрос */}
        <div
          className={`p-6 rounded-lg mb-8 text-center ${
            showError
              ? 'bg-red-100 border-2 border-red-300'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900 mb-4">
            {question?.questionText}
          </p>
          <p className="text-4xl font-bold text-blue-600">
            = {question?.displayAnswer.toFixed(2)}
          </p>
        </div>

        {/* Кнопки ответа */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            disabled={showError}
            className="px-6 py-3 text-lg font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Правильно!
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={showError}
            className="px-6 py-3 text-lg font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Неправильно!
          </button>
        </div>
      </div>
    </div>
  );
}
