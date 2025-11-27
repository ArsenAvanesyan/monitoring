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
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const SERVER_BASE = API_BASE.replace('/api', '');

    // Убеждаемся, что путь начинается с /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    const fullUrl = `${SERVER_BASE}${cleanPath}`;
    console.log('Image URL generated:', { imagePath, SERVER_BASE, cleanPath, fullUrl });

    return fullUrl;
};

export default getImageUrl;

