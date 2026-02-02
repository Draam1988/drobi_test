// Парсер и вычисления для функций

type FunctionToken = {
  type: 'number' | 'variable' | 'operator' | 'function' | 'paren';
  value: string;
};

export function evaluateFunction(expression: string, x: number): number | null {
  try {
    // Заменяем 'x' на значение переменной
    let expr = expression
      .replace(/\s+/g, '')
      .toLowerCase()
      .replace(/x/g, `(${x})`);

    // Заменяем математические функции
    expr = expr
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/\^/g, '**');

    // Безопасное вычисление используя Function вместо eval
    const fn = new Function('Math', `return ${expr}`);
    const result = fn(Math);

    // Проверяем валидность результата
    if (!isFinite(result)) {
      return null;
    }

    return result;
  } catch (error) {
    return null;
  }
}

export function generateGraphPoints(
  expression: string,
  minX: number,
  maxX: number,
  step: number = 0.1
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];

  for (let x = minX; x <= maxX; x += step) {
    const y = evaluateFunction(expression, x);
    if (y !== null) {
      points.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
    }
  }

  return points;
}

export function validateExpression(expression: string): {
  valid: boolean;
  error?: string;
} {
  if (!expression.trim()) {
    return { valid: false, error: 'Введите функцию' };
  }

  // Базовая проверка синтаксиса
  const invalidChars = /[^x\d+\-*/^().,\s]/gi;
  if (invalidChars.test(expression)) {
    // Проверяем известные функции
    const expr = expression.toLowerCase();
    const validFunctions = ['sqrt', 'sin', 'cos', 'tan', 'abs', 'log', 'ln', 'exp'];
    const hasValidFunc = validFunctions.some(fn => expr.includes(fn));

    if (!hasValidFunc && invalidChars.test(expression)) {
      return { valid: false, error: 'Недопустимые символы' };
    }
  }

  // Проверяем скобки
  let openParens = 0;
  for (const char of expression) {
    if (char === '(') openParens++;
    if (char === ')') openParens--;
    if (openParens < 0) {
      return { valid: false, error: 'Ошибка в скобках' };
    }
  }

  if (openParens !== 0) {
    return { valid: false, error: 'Ошибка в скобках' };
  }

  return { valid: true };
}
