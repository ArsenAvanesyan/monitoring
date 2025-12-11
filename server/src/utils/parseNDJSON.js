//? Функция для парсинга NDJSON (newline-delimited JSON)
function parseNDJSON(text) {
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  const parsed = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line.trim());
      parsed.push(obj);
    } catch (e) {
      console.warn('Не удалось распарсить строку как JSON:', line.substring(0, 100));
    }
  }

  return parsed;
}

module.exports = parseNDJSON;
