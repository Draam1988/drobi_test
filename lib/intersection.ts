import { evaluateFunction } from './functionParser';

export interface IntersectionPoint {
  x: number;
  y: number;
}

export function findIntersections(
  expr1: string,
  expr2: string,
  minX: number,
  maxX: number,
  tolerance: number = 0.01
): IntersectionPoint[] {
  const intersections: IntersectionPoint[] = [];
  const step = 0.01;
  let prevSign: number | null = null;
  let prevX: number | null = null;

  for (let x = minX; x <= maxX; x += step) {
    const y1 = evaluateFunction(expr1, x);
    const y2 = evaluateFunction(expr2, x);

    if (y1 === null || y2 === null) {
      prevSign = null;
      prevX = null;
      continue;
    }

    const diff = y1 - y2;
    const sign = Math.sign(diff);

    // Если знак изменился, значит есть пересечение между предыдущей точкой и текущей
    if (prevSign !== null && prevSign !== 0 && sign !== 0 && prevSign !== sign) {
      // Уточняем точку пересечения бинарным поиском
      const refinedX = bisectionSearch(expr1, expr2, prevX!, x);
      const y = evaluateFunction(expr1, refinedX);

      if (y !== null) {
        // Проверяем, не дублируется ли эта точка
        const isDuplicate = intersections.some(
          (p) => Math.abs(p.x - refinedX) < tolerance && Math.abs(p.y - y) < tolerance
        );

        if (!isDuplicate) {
          intersections.push({
            x: Number(refinedX.toFixed(4)),
            y: Number(y.toFixed(4)),
          });
        }
      }
    }

    prevSign = sign;
    prevX = x;
  }

  return intersections;
}

function bisectionSearch(
  expr1: string,
  expr2: string,
  left: number,
  right: number,
  iterations: number = 20
): number {
  for (let i = 0; i < iterations; i++) {
    const mid = (left + right) / 2;

    const y1Left = evaluateFunction(expr1, left);
    const y2Left = evaluateFunction(expr2, left);
    const y1Mid = evaluateFunction(expr1, mid);
    const y2Mid = evaluateFunction(expr2, mid);

    if (y1Left === null || y2Left === null || y1Mid === null || y2Mid === null) {
      break;
    }

    const diffLeft = y1Left - y2Left;
    const diffMid = y1Mid - y2Mid;

    if (Math.sign(diffLeft) === Math.sign(diffMid)) {
      left = mid;
    } else {
      right = mid;
    }
  }

  return (left + right) / 2;
}
