'use client';

import { useEffect, useRef, useState } from 'react';
import { evaluateFunction, generateGraphPoints, validateExpression } from '@/lib/functionParser';
import { findIntersections, type IntersectionPoint } from '@/lib/intersection';

interface GraphPlotterProps {
  function1: string;
  function2: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function GraphPlotter({
  function1,
  function2,
  minX,
  maxX,
  minY,
  maxY,
}: GraphPlotterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [intersections, setIntersections] = useState<IntersectionPoint[]>([]);
  const [error, setError] = useState<string>('');

  const canvasWidth = 600;
  const canvasHeight = 600;
  const padding = 60;

  useEffect(() => {
    // Проверяем функции
    const val1 = validateExpression(function1);
    const val2 = validateExpression(function2);

    if (!val1.valid || !val2.valid) {
      setError(val1.error || val2.error || '');
      return;
    }

    setError('');

    // Находим пересечения
    const pts = findIntersections(function1, function2, minX, maxX);
    setIntersections(pts);

    // Рисуем график
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем канвас
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Рисуем сетку
    drawGrid(ctx);

    // Рисуем оси
    drawAxes(ctx);

    // Рисуем функции
    if (function1.trim()) {
      drawFunction(ctx, function1, '#2563eb', minX, maxX);
    }
    if (function2.trim()) {
      drawFunction(ctx, function2, '#dc2626', minX, maxX);
    }

    // Рисуем точки пересечения
    drawIntersections(ctx, pts);
  }, [function1, function2, minX, maxX, minY, maxY]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    const xRange = maxX - minX;
    const yRange = maxY - minY;

    // Вертикальные линии сетки
    for (let i = minX; i <= maxX; i++) {
      const x = padding + ((i - minX) / xRange) * (canvasWidth - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvasHeight - padding);
      ctx.stroke();
    }

    // Горизонтальные линии сетки
    for (let i = minY; i <= maxY; i++) {
      const y = canvasHeight - padding - ((i - minY) / yRange) * (canvasHeight - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvasWidth - padding, y);
      ctx.stroke();
    }
  };

  const drawAxes = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    const xRange = maxX - minX;
    const yRange = maxY - minY;

    // Оси X и Y
    const originX = padding + ((0 - minX) / xRange) * (canvasWidth - 2 * padding);
    const originY = canvasHeight - padding - ((0 - minY) / yRange) * (canvasHeight - 2 * padding);

    // Рисуем ось X
    ctx.beginPath();
    ctx.moveTo(padding, originY);
    ctx.lineTo(canvasWidth - padding, originY);
    ctx.stroke();

    // Рисуем ось Y
    ctx.beginPath();
    ctx.moveTo(originX, padding);
    ctx.lineTo(originX, canvasHeight - padding);
    ctx.stroke();

    // Метки на осях
    for (let i = minX; i <= maxX; i += Math.max(1, Math.floor((maxX - minX) / 10))) {
      const x = padding + ((i - minX) / xRange) * (canvasWidth - 2 * padding);
      ctx.fillText(i.toString(), x, originY + 20);
    }

    for (let i = minY; i <= maxY; i += Math.max(1, Math.floor((maxY - minY) / 10))) {
      const y = canvasHeight - padding - ((i - minY) / yRange) * (canvasHeight - 2 * padding);
      ctx.textAlign = 'right';
      ctx.fillText(i.toString(), originX - 10, y + 4);
    }
  };

  const drawFunction = (ctx: CanvasRenderingContext2D, expression: string, color: string, minXVal: number, maxXVal: number) => {
    const points = generateGraphPoints(expression, minXVal, maxXVal, 0.05);

    const xRange = maxX - minX;
    const yRange = maxY - minY;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let isFirstPoint = true;
    for (const point of points) {
      if (point.y < minY - 100 || point.y > maxY + 100) continue;

      const x = padding + ((point.x - minX) / xRange) * (canvasWidth - 2 * padding);
      const y = canvasHeight - padding - ((point.y - minY) / yRange) * (canvasHeight - 2 * padding);

      if (isFirstPoint) {
        ctx.moveTo(x, y);
        isFirstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  const drawIntersections = (ctx: CanvasRenderingContext2D, points: IntersectionPoint[]) => {
    const xRange = maxX - minX;
    const yRange = maxY - minY;

    for (const point of points) {
      const x = padding + ((point.x - minX) / xRange) * (canvasWidth - 2 * padding);
      const y = canvasHeight - padding - ((point.y - minY) / yRange) * (canvasHeight - 2 * padding);

      // Рисуем точку
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Обводка
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-gray-300 rounded-lg bg-white shadow-sm"
      />
      {intersections.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Точки пересечения ({intersections.length}):
          </h3>
          <div className="space-y-1">
            {intersections.map((point, idx) => (
              <div key={idx} className="text-sm text-gray-700">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                Точка {idx + 1}: x = {point.x}, y = {point.y}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
