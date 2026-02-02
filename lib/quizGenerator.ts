export interface QuizQuestion {
  num1: number;
  num2: number;
  operation: '+' | '-' | '*' | '/';
  correctAnswer: number;
  displayAnswer: number;
  isCorrect: boolean;
  questionText: string;
}

let lastAnswerStates: boolean[] = [];

export function resetAnswerSequence(): void {
  lastAnswerStates = [];
}

export function generateQuestion(operation: '+' | '-' | '*' | '/'): QuizQuestion {
  // Генерируем случайный ответ, но ограничиваем длинные последовательности (макс 3 подряд)
  let isCorrectInitial: boolean;
  
  if (lastAnswerStates.length < 3) {
    // На первых трёх вопросах просто случайно
    isCorrectInitial = Math.random() > 0.5;
  } else {
    // Проверяем последние 3 на ответ
    const last3 = lastAnswerStates.slice(-3);
    const allSame = last3.every(v => v === last3[0]);
    
    if (allSame) {
      // Если последние 3 одинаковы, даём противоположный
      isCorrectInitial = !last3[0];
    } else {
      // Иначе просто случайно
      isCorrectInitial = Math.random() > 0.5;
    }
  }
  
  lastAnswerStates.push(isCorrectInitial);
  // Генерируем числа с максимум двумя знаками после запятой
  let num1 = Math.round(Math.random() * 1000) / 100; // 0.00 - 10.00
  let num2 = Math.round(Math.random() * 1000) / 100;

  let correctAnswer: number;

  if (operation === '+') {
    correctAnswer = parseFloat((num1 + num2).toFixed(2));
  } else if (operation === '-') {
    // При вычитании убедимся, что результат всегда положительный
    if (num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    correctAnswer = parseFloat((num1 - num2).toFixed(2));
  } else if (operation === '*') {
    correctAnswer = parseFloat((num1 * num2).toFixed(2));
    // Убеждаемся, что произведение не превышает 99.99
    if (correctAnswer > 99.99) {
      num1 = Math.round(Math.random() * 100) / 100;
      num2 = Math.round(Math.random() * 100) / 100;
      correctAnswer = parseFloat((num1 * num2).toFixed(2));
    }
  } else if (operation === '/') {
    // Убеждаемся, что делитель не равен нулю
    if (num2 === 0) {
      num2 = Math.round(Math.random() * 900) / 100 + 0.01;
    }
    correctAnswer = parseFloat((num1 / num2).toFixed(2));
  }

  let displayAnswer = correctAnswer;
  const isCorrect = isCorrectInitial;

  if (!isCorrect) {
    // Генерируем неправильный ответ
    const error = (Math.random() - 0.5) * 10; // Ошибка от -5 до 5
    displayAnswer = parseFloat((correctAnswer + error).toFixed(2));
    
    // Убедимся, что ошибка достаточно значительна
    if (Math.abs(displayAnswer - correctAnswer) < 0.01) {
      displayAnswer = parseFloat((correctAnswer + (error > 0 ? 1 : -1)).toFixed(2));
    }
  }

  const questionText = `${num1.toFixed(2)} ${operation} ${num2.toFixed(2)} = ?`;

  return {
    num1,
    num2,
    operation,
    correctAnswer,
    displayAnswer,
    isCorrect,
    questionText,
  };
}
