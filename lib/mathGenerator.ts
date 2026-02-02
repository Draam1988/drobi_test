// Генерация случайной задачи на сложение или вычитание десятичных дробей
export interface MathTask {
  num1: number;
  num2: number;
  operation: 'add' | 'subtract';
  correct: number;
}

export function generateTask(): MathTask {
  // Генерируем два числа с разрядностью до сотых
  const num1 = parseFloat((Math.random() * 99.99).toFixed(2));
  const num2 = parseFloat((Math.random() * 99.99).toFixed(2));
  
  // Выбираем операцию
  const operation = Math.random() > 0.5 ? 'add' : 'subtract';
  
  let correct: number;
  
  if (operation === 'add') {
    correct = parseFloat((num1 + num2).toFixed(2));
  } else {
    // Убеждаемся, что результат не отрицательный
    if (num1 >= num2) {
      correct = parseFloat((num1 - num2).toFixed(2));
    } else {
      correct = parseFloat((num2 - num1).toFixed(2));
      // Меняем числа местами для отображения
      return {
        num1: num2,
        num2: num1,
        operation: 'subtract',
        correct
      };
    }
  }
  
  return {
    num1,
    num2,
    operation,
    correct
  };
}

export function formatTask(task: MathTask): string {
  const operator = task.operation === 'add' ? '+' : '−';
  return `${task.num1} ${operator} ${task.num2}`;
}

export function checkAnswer(userAnswer: string, correctAnswer: number): boolean {
  const userNum = parseFloat(userAnswer);
  
  if (isNaN(userNum)) {
    return false;
  }
  
  // Проверяем с небольшой точностью из-за ошибок округления
  return Math.abs(userNum - correctAnswer) < 0.001;
}
