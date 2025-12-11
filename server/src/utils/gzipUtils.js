// server/src/utils/gzipUtils.js
// Утилиты для работы с gzip архивами

const zlib = require('zlib');
const { promisify } = require('util');

const gunzip = promisify(zlib.gunzip);

/**
 * Распаковывает gzip архив
 * @param {Buffer} gzipBuffer - Буфер с gzip данными
 * @returns {Promise<Buffer>} - Распакованные данные
 */
async function decompressGzip(gzipBuffer) {
  try {
    if (!Buffer.isBuffer(gzipBuffer)) {
      throw new Error('Ожидается Buffer с gzip данными');
    }

    console.log('📦 Распаковка gzip архива...');
    console.log('  Размер архива:', gzipBuffer.length, 'байт');

    const decompressed = await gunzip(gzipBuffer);
    console.log('  ✅ Распаковано:', decompressed.length, 'байт');
    console.log('  Коэффициент сжатия:', (gzipBuffer.length / decompressed.length).toFixed(2) + 'x');

    return decompressed;
  } catch (error) {
    console.error('❌ Ошибка распаковки gzip:', error.message);
    throw new Error(`Ошибка распаковки gzip: ${error.message}`);
  }
}

/**
 * Извлекает текстовые данные из распакованного буфера
 * @param {Buffer} buffer - Распакованный буфер
 * @returns {string} - Текст из буфера
 */
function extractTextFromBuffer(buffer) {
  try {
    // Извлекаем текст как UTF-8
    // Если данные в другой кодировке, они все равно будут обработаны,
    // но могут отображаться некорректно (это нормально для бинарных данных)
    const text = buffer.toString('utf8');
    
    // Проверяем, что текст не пустой
    if (text.length === 0) {
      console.warn('⚠️ Распакованный буфер пуст');
    }

    return text;
  } catch (error) {
    console.error('❌ Ошибка извлечения текста из буфера:', error.message);
    // В крайнем случае возвращаем как UTF-8
    return buffer.toString('utf8');
  }
}

/**
 * Обрабатывает gzip архив: распаковывает и извлекает текст
 * @param {Buffer} gzipBuffer - Буфер с gzip данными
 * @param {string} filename - Имя файла из заголовка (для логирования)
 * @returns {Promise<string>} - Текст из распакованного архива
 */
async function processGzipArchive(gzipBuffer, filename = null) {
  try {
    console.log('🔍 Обработка gzip архива...');
    if (filename) {
      console.log('  Имя файла:', filename);
    }

    // Распаковываем gzip
    const decompressed = await decompressGzip(gzipBuffer);

    // Извлекаем текст
    const text = extractTextFromBuffer(decompressed);
    
    console.log('  ✅ Текст извлечен, длина:', text.length, 'символов');
    console.log('  Первые 200 символов:', text.substring(0, 200));

    return text;
  } catch (error) {
    console.error('❌ Ошибка обработки gzip архива:', error);
    throw error;
  }
}

module.exports = {
  decompressGzip,
  extractTextFromBuffer,
  processGzipArchive,
};

