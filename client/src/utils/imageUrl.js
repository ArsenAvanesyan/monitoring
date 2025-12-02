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
    const API_BASE = import.meta.env.VITE_API_URL || 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : '/api');
    const SERVER_BASE = API_BASE.replace('/api', '') || '';

    // Убеждаемся, что путь начинается с /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${SERVER_BASE}${cleanPath}`;
};

export default getImageUrl;

