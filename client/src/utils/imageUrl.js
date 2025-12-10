/**
 * Формирует полный URL для изображения
 * @param {string} imagePath - Путь к изображению (например, /images/filename.jpeg)
 * @returns {string} Полный URL изображения
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Если уже полный URL, возвращаем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Формируем полный URL используя базовый URL API (без /api)
  // В разработке (Vite dev server на 5173) используем localhost:3000
  // В Docker (nginx на 8080) используем относительный путь
  const getApiBase = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    const port = window.location.port;
    // Vite dev server обычно на 5173 или 5174
    if (port === '5173' || port === '5174') {
      return 'http://localhost:3000/api';
    }
    return '/api';
  };

  const API_BASE = getApiBase();
  const SERVER_BASE = API_BASE.replace('/api', '') || '';

  // Убеждаемся, что путь начинается с /
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${SERVER_BASE}${cleanPath}`;
};

export default getImageUrl;
