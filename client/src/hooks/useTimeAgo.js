import { useState, useEffect } from 'react';

/**
 * Хук для вычисления времени, прошедшего с указанной даты
 * @param {string|null} timestamp - ISO строка с датой или null
 * @returns {{value: number, unit: string}|null} - Объект с числом и единицей времени или null
 */
export const useTimeAgo = (timestamp) => {
  const [timeAgo, setTimeAgo] = useState(null);

  useEffect(() => {
    if (!timestamp) {
      setTimeAgo(null);
      return;
    }

    const updateTimeAgo = () => {
      try {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;

        if (diffMs < 0) {
          setTimeAgo(null);
          return;
        }

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
          setTimeAgo({ value: diffSeconds, unit: 'seconds' });
        } else if (diffMinutes < 60) {
          setTimeAgo({ value: diffMinutes, unit: 'minutes' });
        } else if (diffHours < 24) {
          setTimeAgo({ value: diffHours, unit: 'hours' });
        } else {
          setTimeAgo({ value: diffDays, unit: 'days' });
        }
      } catch (error) {
        console.error('Ошибка при вычислении времени:', error);
        setTimeAgo(null);
      }
    };

    // Обновляем сразу
    updateTimeAgo();

    // Обновляем каждую секунду
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
};

